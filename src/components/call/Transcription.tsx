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
      logWithTime("Streams not available for combining.");
      return null;
    }

    const combinedStream = new MediaStream();
    // Add both user and AI audio tracks to the combined stream
    combinedStream.addTrack(remoteMediaStream.getAudioTracks()[0]);
    combinedStream.addTrack(localStream.getAudioTracks()[0]);

    return combinedStream;
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

            const newTranscript = {
              text: message.text,
              speaker: message.speaker || "AI",
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

      const jwtToken = getAuthToken();
      if (!jwtToken) {
        return null;
      }

      // Format the transcript as a single string
      const formattedTranscript = fullTranscript
        .map((t) => `[${t.speaker}]: ${t.text}`)
        .join("\n");

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
