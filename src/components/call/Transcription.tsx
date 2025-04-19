import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  RefObject,
} from "react";

// API base URL
const API_BASE_URL = "http://localhost:8000";

interface TranscriptionProps {
  remoteMediaStream: MediaStream | null;
  localStream: MediaStream | null;
  isCallActive: boolean;
  onTranscriptReceived: (transcript: TranscriptData) => void;
  sessionId: string;
  questionNumber: number;
  onQuestionEnd?: (analysisData: any) => void;
}

interface TranscriptData {
  text: string;
  speaker: string;
  timestamp: string;
}

interface TranscriptionRef {
  closeTranscription: () => Promise<any>;
}

function Transcription(
  {
    remoteMediaStream,
    localStream,
    isCallActive,
    onTranscriptReceived,
    sessionId,
    questionNumber,
    onQuestionEnd,
  }: TranscriptionProps,
  ref: React.Ref<TranscriptionRef>
) {
  const aiAudioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const assemblyWsRef = useRef<WebSocket | null>(null);
  const lastTranscriptRef = useRef<TranscriptData>({
    text: "",
    speaker: "",
    timestamp: "",
  });
  const [fullTranscript, setFullTranscript] = useState<TranscriptData[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const lastActivityTime = useRef(Date.now());
  const silenceThreshold = 500; // ms to consider silence after activity

  // Helper function for audio conversion
  function convertFloat32ToInt16(buffer: Float32Array): ArrayBuffer {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return buf.buffer;
  }

  // Helper function to log with timestamps
  const logWithTime = (message: string): void => {
    console.log(`[${new Date().toISOString()}] Transcription: ${message}`);
  };

  // Combine the audio streams into one
  const combineStreams = (): MediaStream | null => {
    if (!remoteMediaStream || !localStream) {
      return null;
    }

    try {
      // Create a new combined stream
      const combinedStream = new MediaStream();

      // Add the local stream (user's voice) first - this is the most important
      const localAudioTrack = localStream.getAudioTracks()[0];
      if (localAudioTrack) {
        logWithTime("Adding local audio track to combined stream");
        combinedStream.addTrack(localAudioTrack);
      } else {
        logWithTime("WARNING: No local audio track found");
      }

      // Then add the remote stream (AI voice) if available
      const remoteAudioTrack = remoteMediaStream.getAudioTracks()[0];
      if (remoteAudioTrack) {
        logWithTime("Adding remote audio track to combined stream");
        combinedStream.addTrack(remoteAudioTrack);
      } else {
        logWithTime("WARNING: No remote audio track found");
      }

      // Verify combined stream has tracks
      if (combinedStream.getAudioTracks().length === 0) {
        logWithTime("ERROR: Combined stream has no audio tracks");
        return null;
      }

      logWithTime(
        `Combined stream created with ${
          combinedStream.getAudioTracks().length
        } audio tracks`
      );
      return combinedStream;
    } catch (error) {
      logWithTime(`Error combining streams: ${error}`);
      return null;
    }
  };

  // Function to get authentication token
  const getAuthToken = (): string | null => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    if (!token) {
      logWithTime("No authentication token found in localStorage");
      return null;
    }
    return token;
  };

  const initializeTranscription = async (): Promise<void> => {
    try {
      logWithTime("Initializing transcription...");

      const jwtToken = getAuthToken();
      if (!jwtToken) {
        return;
      }

      // Get temporary token from backend
      const response = await fetch(`${API_BASE_URL}/api/v1/assembly/token`, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get token: ${await response.text()}`);
      }

      const { token } = await response.json();
      logWithTime("Got token for transcription");

      const SAMPLE_RATE = 16000;
      const wsUrl = `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=${SAMPLE_RATE}&token=${encodeURIComponent(
        token
      )}`;

      logWithTime("Connecting to AssemblyAI WebSocket...");
      const ws = new WebSocket(wsUrl);
      assemblyWsRef.current = ws;

      ws.onopen = () => {
        logWithTime("WebSocket connected");

        // Combine streams
        const combinedStream = combineStreams();
        if (combinedStream) {
          // Create a single audio context for both streams
          if (aiAudioContextRef.current) {
            aiAudioContextRef.current
              .close()
              .catch((err: Error) =>
                logWithTime(
                  `Error closing previous audio context: ${err.message}`
                )
              );
          }

          aiAudioContextRef.current = new (window.AudioContext ||
            (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });

          const source =
            aiAudioContextRef.current.createMediaStreamSource(combinedStream);

          const processor = aiAudioContextRef.current.createScriptProcessor(
            2048,
            1,
            1
          );
          processorRef.current = processor;

          // Process audio and send to AssemblyAI
          processor.onaudioprocess = (e: AudioProcessingEvent) => {
            if (ws.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16Data = convertFloat32ToInt16(inputData);
              ws.send(int16Data);
            }
          };

          // Connect the nodes: source -> processor -> destination
          source.connect(processor);
          processor.connect(aiAudioContextRef.current.destination);

          logWithTime("Audio processing pipeline established");
        }
      };

      // Helper to detect likely speaker based on simple heuristics
      const determineSpeaker = (text: string): string => {
        // If the user was recently detected as speaking (via audio activity)
        // or if there was a long pause since last transcript
        const timeSinceLastActivity = Date.now() - lastActivityTime.current;

        // Update the last activity time
        lastActivityTime.current = Date.now();

        // Simple heuristic: if the message starts with a question mark or common AI phrases,
        // it's more likely to be the AI
        const aiPhrases = [
          "hello",
          "hi there",
          "welcome",
          "let's",
          "i'm",
          "to begin",
          "now,",
          "first,",
          "could you",
          "tell me about",
          "what would",
          "let me",
          "thank you",
          "that's",
          "interesting",
        ];

        const lowerText = text.toLowerCase();
        const hasAiPhrase = aiPhrases.some((phrase) =>
          lowerText.includes(phrase)
        );

        // If it contains common AI interview phrases and no question marks, likely AI
        if (hasAiPhrase && !lowerText.includes("?") && lowerText.length > 15) {
          logWithTime(
            `Identified likely AI speech: "${text.substring(0, 30)}..."`
          );
          return "AI";
        }

        // If there's been significant silence, likely a speaker change
        if (timeSinceLastActivity > silenceThreshold) {
          // Toggle between speakers when there's a pause
          setIsUserSpeaking((prev) => !prev);
        }

        // Use the current speaking state
        const speaker = isUserSpeaking ? "User" : "AI";
        logWithTime(
          `Identified likely ${speaker} speech: "${text.substring(0, 30)}..."`
        );
        return speaker;
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);

          if (message.message_type === "FinalTranscript") {
            logWithTime(`Transcript received: "${message.text}"`);

            // Check for duplicate or empty transcript
            if (
              message.text.trim() === "" ||
              lastTranscriptRef.current.text === message.text
            ) {
              logWithTime("Skipping empty or duplicate transcript");
              return;
            }

            // Use improved speaker detection
            const speaker = message.speaker || determineSpeaker(message.text);

            const newTranscript = {
              text: message.text,
              speaker: speaker,
              timestamp: new Date().toISOString(),
            };

            lastTranscriptRef.current = newTranscript;

            // Update the full transcript
            setFullTranscript((prev) => [...prev, newTranscript]);

            // Handle the new transcript
            if (typeof onTranscriptReceived === "function") {
              onTranscriptReceived(newTranscript);
            }
          }
        } catch (error) {
          const err = error as Error;
          logWithTime(`Error processing message: ${err.message}`);
        }
      };

      ws.onerror = (error: Event) => {
        logWithTime(
          `WebSocket error: ${(error as ErrorEvent).message || "Unknown error"}`
        );
      };

      ws.onclose = (event: CloseEvent) => {
        logWithTime(`WebSocket closed: ${event.code} ${event.reason}`);
      };
    } catch (error) {
      const err = error as Error;
      logWithTime(`Failed to initialize transcription: ${err.message}`);
      console.error("Transcription initialization error:", err);
    }
  };

  // Function to send the transcript to the backend for analysis
  const sendTranscriptForAnalysis = async (): Promise<any> => {
    try {
      logWithTime("Sending transcript for analysis...");

      if (fullTranscript.length === 0) {
        logWithTime("No transcript to send");
        return null;
      }

      // Check if analysis was already sent for this session/question
      const analysisKey = `transcript_analysis_sent_${sessionId}_${questionNumber}`;
      if (localStorage.getItem(analysisKey) === "true") {
        logWithTime(
          "Analysis already sent for this session/question. Skipping."
        );
        return null;
      }

      const jwtToken = getAuthToken();
      if (!jwtToken) {
        return null;
      }

      // Get transcript statistics
      const userSegments = fullTranscript.filter(
        (t) => t.speaker === "User"
      ).length;
      const aiSegments = fullTranscript.filter(
        (t) => t.speaker === "AI"
      ).length;
      logWithTime(
        `Transcript contains ${userSegments} user segments and ${aiSegments} AI segments`
      );

      // Format the transcript as a single string with clear speaker labels
      const formattedTranscript = fullTranscript
        .map((t) => `[${t.speaker}]: ${t.text}`)
        .join("\n\n"); // Add extra line break for better separation

      // Log a preview of the transcript
      logWithTime(
        `Transcript preview (first 200 chars): ${formattedTranscript.substring(
          0,
          200
        )}...`
      );

      // Mark as sent in localStorage BEFORE sending the request
      // This ensures the PostQuestionScreen can detect that a send was attempted
      localStorage.setItem(analysisKey, "true");
      logWithTime("Set localStorage flag to indicate analysis was sent");

      // Send to backend
      const response = await fetch(
        `${API_BASE_URL}/api/v1/transcript-analysis/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            transcript: formattedTranscript,
            interview_id: sessionId,
            question_number: questionNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to analyze transcript: ${await response.text()}`
        );
      }

      const analysisData = await response.json();
      logWithTime("Transcript analysis received successfully");

      // Call the onQuestionEnd callback with the analysis data
      if (onQuestionEnd) {
        onQuestionEnd(analysisData);
      }

      return analysisData;
    } catch (error) {
      const err = error as Error;
      logWithTime(`Failed to analyze transcript: ${err.message}`);
      console.error("Transcript analysis error:", err);
      return null;
    }
  };

  // Function to close the transcription service
  const closeTranscription = async (): Promise<any> => {
    logWithTime("Closing transcription service...");

    // Close the WebSocket connection
    if (assemblyWsRef.current) {
      assemblyWsRef.current.close();
      assemblyWsRef.current = null;
    }

    // Disconnect the audio processing nodes
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    // Close the audio context
    if (aiAudioContextRef.current) {
      aiAudioContextRef.current
        .close()
        .catch((err: Error) =>
          logWithTime(`Error closing audio context: ${err.message}`)
        );
      aiAudioContextRef.current = null;
    }

    // Send the transcript for analysis and return the result
    return await sendTranscriptForAnalysis();
  };

  // Initialize audio analyzer for user voice detection
  useEffect(() => {
    if (!isCallActive || !localStream) return;

    try {
      // Create audio context
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create analyzer
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;

      // Create source from user's microphone
      const source = audioContext.createMediaStreamSource(localStream);
      source.connect(analyzer);

      // Buffer for analysis
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);

      // Create audio level detection loop
      const detectSpeech = () => {
        if (!isCallActive) return;

        analyzer.getByteFrequencyData(dataArray);

        // Calculate average level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        // If average is above threshold, user is likely speaking
        const SPEECH_THRESHOLD = 30; // Adjust based on testing
        const isSpeaking = average > SPEECH_THRESHOLD;

        if (isSpeaking) {
          // Update last activity time when user is speaking
          lastActivityTime.current = Date.now();

          // Only log state changes to avoid console spam
          if (!isUserSpeaking) {
            logWithTime("User voice activity detected");
            setIsUserSpeaking(true);
          }
        } else if (
          isUserSpeaking &&
          Date.now() - lastActivityTime.current > silenceThreshold
        ) {
          // Only change state after silence threshold
          logWithTime("User voice activity stopped");
          setIsUserSpeaking(false);
        }

        // Continue loop
        requestAnimationFrame(detectSpeech);
      };

      // Start detection loop
      detectSpeech();

      // Cleanup
      return () => {
        audioContext.close().catch((err) => {
          logWithTime(`Error closing audio context: ${err}`);
        });
      };
    } catch (error) {
      logWithTime(`Error setting up voice activity detection: ${error}`);
    }
  }, [isCallActive, localStream, isUserSpeaking, silenceThreshold]);

  // Initialize the transcription service when active
  useEffect(() => {
    logWithTime(
      `Transcription useEffect triggered - isCallActive: ${isCallActive}, remoteStream: ${!!remoteMediaStream}, localStream: ${!!localStream}`
    );

    if (isCallActive && remoteMediaStream && localStream) {
      initializeTranscription();
    }

    return () => {
      if (assemblyWsRef.current) {
        assemblyWsRef.current.close();
        assemblyWsRef.current = null;
      }

      if (aiAudioContextRef.current) {
        aiAudioContextRef.current
          .close()
          .catch((err: Error) =>
            logWithTime(`Error closing audio context: ${err.message}`)
          );
        aiAudioContextRef.current = null;
      }

      if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
      }
    };
  }, [isCallActive, remoteMediaStream, localStream, sessionId, questionNumber]);

  // Expose the closeTranscription method to parent components
  useImperativeHandle(
    ref,
    () => ({
      closeTranscription,
    }),
    [fullTranscript, sessionId, questionNumber, onQuestionEnd]
  );

  // Log component rendering for debugging
  useEffect(() => {
    console.log("Transcription component rendered", {
      isCallActive,
      sessionId,
      questionNumber,
    });

    return () => {
      console.log("Transcription component unmounted");
    };
  }, []);

  return null; // No rendering needed, transcription is handled in the background
}

const TranscriptionWithRef = forwardRef<TranscriptionRef, TranscriptionProps>(
  Transcription
);

export default TranscriptionWithRef;
