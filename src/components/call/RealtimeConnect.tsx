import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/RealtimeConnect.module.css";

// RTC API base URL - use relative URL to avoid CORS issues
const RTC_API_BASE_URL = "/api/rtc"; // This will be proxied to the backend

// Types
type ConnectionState =
  | "new"
  | "checking"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";
type NotificationType = "info" | "warning" | "error" | "success";
type InterviewState =
  | "idle"
  | "connecting"
  | "introduction"
  | "question"
  | "response"
  | "feedback"
  | "conclusion";

interface LocationState {
  title?: string;
  questionNumber?: number;
  lesson?: any;
}

interface TranscriptItem {
  text: string;
  speaker: string;
  timestamp: string;
}

const RealtimeConnect: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state || {}) as LocationState;

  // State
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("new");
  const [interviewState, setInterviewState] = useState<InterviewState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.3);
  const [interviewTitle, setInterviewTitle] =
    useState<string>("Case Interview");
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: NotificationType;
  }>({
    show: false,
    message: "",
    type: "info",
  });
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [audioPacketCount, setAudioPacketCount] = useState(0);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioPacketCountRef = useRef<number>(0);

  // Set interview title when component mounts
  useEffect(() => {
    if (locationState.title) {
      setInterviewTitle(locationState.title);
    }

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    durationIntervalRef.current = timer;

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [locationState.title]);

  // Initialize WebSocket connection and media
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        // 1. Get user media (microphone and camera)
        await setupMediaStream();

        // 2. Initialize WebSocket connection
        await connectToWebSocket();

        // Start audio level monitoring
        startAudioLevelMonitoring();
      } catch (error) {
        console.error("Failed to initialize interview:", error);
        showNotification(
          "Failed to initialize interview. Please try again.",
          "error"
        );
      }
    };

    initializeInterview();

    // Cleanup function
    return () => {
      cleanupResources();
    };
  }, [sessionId]);

  // Setup media stream with 16kHz sampling rate
  const setupMediaStream = async () => {
    try {
      // Create audio context with 16kHz sampling rate
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext({
        sampleRate: 16000, // Set to 16kHz for AssemblyAI
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Request 16kHz sampling rate
          channelCount: 1, // Mono audio
        },
      });

      localStreamRef.current = stream;

      // Display local video
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Setup audio processing for visualization and WebSocket streaming
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;

      const audioSource =
        audioContextRef.current.createMediaStreamSource(stream);
      audioSource.connect(analyser);

      audioAnalyserRef.current = analyser;
      audioDataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      // Create script processor for raw PCM data
      const processor = audioContextRef.current.createScriptProcessor(
        4096,
        1,
        1
      );
      processor.onaudioprocess = handleAudioProcess;

      // Connect the processor
      audioSource.connect(processor);
      processor.connect(audioContextRef.current.destination);

      audioProcessorRef.current = processor;

      return true;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      showNotification(
        "Failed to access camera/microphone. Please check permissions.",
        "error"
      );
      return false;
    }
  };

  // Process audio data for WebSocket streaming
  const handleAudioProcess = (event: AudioProcessingEvent) => {
    if (
      !webSocketRef.current ||
      webSocketRef.current.readyState !== WebSocket.OPEN ||
      isMuted
    ) {
      return;
    }

    try {
      // Get raw PCM data from the audio buffer
      const inputData = event.inputBuffer.getChannelData(0);

      // Convert float32 to int16 (required format for AssemblyAI)
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        // Convert float32 in range [-1.0, 1.0] to int16 in range [-32768, 32767]
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7fff;
      }

      // Log audio packet info periodically
      if (audioPacketCountRef.current % 20 === 0) {
        console.log(
          `Sending audio packet #${audioPacketCountRef.current}, size: ${pcmData.buffer.byteLength} bytes`
        );
      }
      audioPacketCountRef.current++;

      // Send the raw PCM data directly to the WebSocket
      webSocketRef.current.send(pcmData.buffer);
    } catch (error) {
      console.error("Error processing audio:", error);
    }
  };

  // Connect to WebSocket
  const connectToWebSocket = async () => {
    if (!sessionId) {
      showNotification("No session ID provided", "error");
      return false;
    }

    try {
      setConnectionState("connecting");

      // Get auth token
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Determine WebSocket protocol based on current page protocol
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

      // For local development, use direct connection
      // For production, use relative URL that will be proxied
      const wsUrl =
        process.env.NODE_ENV === "development"
          ? `${protocol}//localhost:8001/api/v1/interview?token=${token}&case_id=${sessionId}`
          : `${protocol}//${window.location.host}/api/v1/interview?token=${token}&case_id=${sessionId}`;

      console.log(`Connecting to WebSocket: ${wsUrl}`);

      // Create WebSocket connection
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      // Setup event handlers
      ws.onopen = handleWebSocketOpen;
      ws.onmessage = handleWebSocketMessage;
      ws.onclose = handleWebSocketClose;
      ws.onerror = handleWebSocketError;

      // Set binary type to arraybuffer for receiving binary data
      ws.binaryType = "arraybuffer";

      return true;
    } catch (error) {
      console.error("WebSocket connection error:", error);
      setConnectionState("failed");
      showNotification("Failed to connect to interview service", "error");
      return false;
    }
  };

  // WebSocket event handlers
  const handleWebSocketOpen = () => {
    console.log("Connected to interview service");
    setConnectionState("connected");
    setCallActive(true);
    setInterviewState("introduction");
    showNotification("Connected to interview service", "success");
  };

  const handleWebSocketMessage = (event: MessageEvent) => {
    try {
      // Check if the message is binary (audio data)
      if (event.data instanceof ArrayBuffer) {
        console.log(
          "Received binary audio data, size:",
          event.data.byteLength,
          "bytes"
        );

        // Create a blob from the array buffer with MP3 MIME type
        const blob = new Blob([event.data], { type: "audio/mp3" });

        // Create an object URL from the blob
        const url = URL.createObjectURL(blob);

        // Play the audio using the audio element
        if (audioRef.current) {
          console.log("Playing audio from URL:", url);
          audioRef.current.src = url;

          // Add event listeners for debugging
          audioRef.current.onplay = () => console.log("Audio playback started");
          audioRef.current.onended = () => {
            console.log("Audio playback ended");
            URL.revokeObjectURL(url);
          };
          audioRef.current.onerror = (e) =>
            console.error("Audio play error:", e);

          // Force play
          audioRef.current
            .play()
            .then(() => console.log("Audio playback initiated successfully"))
            .catch((e) => {
              console.error("Audio play error:", e);
              // Try again with user interaction if needed
              showNotification("Click anywhere to enable audio", "info");
              document.body.addEventListener("click", function playOnce() {
                audioRef.current?.play();
                document.body.removeEventListener("click", playOnce);
              });
            });
        } else {
          console.error("Audio element reference is null");
        }
        return;
      }

      // Parse JSON messages
      const message = JSON.parse(event.data);
      console.log("Received message:", message);

      // Handle different message types based on actual backend implementation
      switch (message.type) {
        case "interview_started":
          console.log("Interview started:", message.data);
          break;

        case "interviewer_speaking":
          // Handle text from interviewer
          if (message.data && message.data.text) {
            console.log("Interviewer speaking:", message.data.text);
            addTranscriptItem({
              text: message.data.text,
              speaker: "Interviewer",
              timestamp: new Date().toISOString(),
            });
          }
          break;

        case "state_change":
          // Handle state changes
          if (message.data && message.data.state) {
            console.log("State change:", message.data.state);
            setInterviewState(
              message.data.state.toLowerCase() as InterviewState
            );

            // Handle state-specific actions
            switch (message.data.state.toLowerCase()) {
              case "question":
                setIsUserSpeaking(false);
                break;
              case "response":
                setIsUserSpeaking(true);
                break;
            }
          }
          break;

        case "debug":
          console.log("Debug from server:", message.data?.message);
          break;

        case "tts_starting":
          console.log("TTS synthesis starting");
          showNotification("Interviewer is speaking...", "info");
          break;

        case "tts_complete":
          console.log("TTS synthesis complete");
          break;

        case "error":
          handleError(message);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  };

  const handleWebSocketClose = (event: CloseEvent) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
    setConnectionState("closed");
    setCallActive(false);

    // Show notification if it wasn't a normal closure
    if (event.code !== 1000) {
      showNotification(
        `Connection closed: ${event.reason || "Unknown reason"}`,
        "warning"
      );
    }
  };

  const handleWebSocketError = (error: Event) => {
    console.error("WebSocket error:", error);
    setConnectionState("failed");
    showNotification("Connection error. Please try again.", "error");
  };

  // Message handlers
  const handleTranscription = (message: any) => {
    // Add transcription to the transcript list
    if (message.text) {
      addTranscriptItem({
        text: message.text,
        speaker: message.is_final ? "Interviewer" : "System",
        timestamp: new Date().toISOString(),
      });
    }
  };

  const handleStateChange = (message: any) => {
    const state = message.state || "idle";
    setInterviewState(state as InterviewState);

    // Handle state-specific actions
    switch (state) {
      case "question":
        setIsUserSpeaking(false);
        break;
      case "response":
        setIsUserSpeaking(true);
        break;
      case "feedback":
        setIsUserSpeaking(false);
        break;
    }
  };

  const handleFeedback = (message: any) => {
    // Display feedback in transcript
    addTranscriptItem({
      text: `Feedback: ${
        message.text || message.message || "No feedback provided"
      }`,
      speaker: "System",
      timestamp: new Date().toISOString(),
    });
  };

  const handleInterviewComplete = (message: any) => {
    // Add summary to transcript
    addTranscriptItem({
      text: `Interview Complete: ${
        message.summary || "Interview session ended"
      }`,
      speaker: "System",
      timestamp: new Date().toISOString(),
    });

    // Show notification
    showNotification("Interview complete", "success");

    // Navigate to post-interview page after a delay
    setTimeout(() => {
      handleEndQuestion();
    }, 3000);
  };

  const handleError = (message: any) => {
    const errorMessage =
      message.data?.message || message.message || "Unknown error";
    showNotification(`Error: ${errorMessage}`, "error");
  };

  // Audio level monitoring
  const startAudioLevelMonitoring = () => {
    const updateAudioLevel = () => {
      if (audioAnalyserRef.current && audioDataArrayRef.current) {
        audioAnalyserRef.current.getByteFrequencyData(
          audioDataArrayRef.current
        );

        // Calculate average level
        let sum = 0;
        const dataArray = audioDataArrayRef.current;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }

        const avg = Math.min(1, Math.max(0, sum / (dataArray.length * 255)));
        setAudioLevel(avg);
      }

      // Continue animation loop if call is active
      if (callActive) {
        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };

    // Start animation loop
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Transcript handling
  const addTranscriptItem = (item: TranscriptItem) => {
    setTranscripts((prev) => [...prev, item]);
  };

  // Handle mute/unmute toggle
  const handleMuteToggle = () => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);

      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });

      // Notify the server about mute state (using a text message)
      if (webSocketRef.current?.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(
          JSON.stringify({
            type: "control",
            action: newMuteState ? "mute" : "unmute",
          })
        );
      }
    }
  };

  // Handle ending the call
  const handleEndCall = () => {
    // Send end interview command to server
    if (webSocketRef.current?.readyState === WebSocket.OPEN) {
      webSocketRef.current.send(
        JSON.stringify({
          type: "control",
          action: "end",
        })
      );
    }

    // Clean up resources
    cleanupResources();

    // Navigate back to interview page
    navigate(`/my-interview/${sessionId}`);
  };

  // Handle ending the question and going to the post-question screen
  const handleEndQuestion = () => {
    // Show notification
    showNotification("Ending question...", "info");

    // Clean up resources
    cleanupResources();

    // Set default values for post-question screen
    const currentQuestionNumber = locationState.questionNumber || 1;
    const nextQuestionNumber = currentQuestionNumber + 1;
    const totalQuestions = 4;
    const isAllCompleted = false;
    const completedQuestions = [currentQuestionNumber];

    // Navigate to post-question screen
    navigate(`/interview/post-question/${sessionId}`, {
      state: {
        title: interviewTitle,
        questionNumber: currentQuestionNumber,
        nextQuestionNumber,
        totalQuestions,
        isAllCompleted,
        completedQuestions,
      },
    });
  };

  // Clean up all resources
  const cleanupResources = () => {
    // Disconnect audio processor if active
    if (audioProcessorRef.current && audioContextRef.current) {
      audioProcessorRef.current.disconnect();
      audioProcessorRef.current = null;
    }

    // Close WebSocket connection
    if (webSocketRef.current) {
      if (
        webSocketRef.current.readyState === WebSocket.OPEN ||
        webSocketRef.current.readyState === WebSocket.CONNECTING
      ) {
        webSocketRef.current.close();
      }
      webSocketRef.current = null;
    }

    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Clear audio context
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Reset state
    setCallActive(false);
    setConnectionState("closed");
  };

  // Show notification helper
  const showNotification = (
    message: string,
    type: NotificationType = "info",
    duration = 5000
  ) => {
    setNotification({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, duration);
  };

  // Format call duration for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Connection state color and text
  const getConnectionStateColor = (state: ConnectionState): string => {
    switch (state) {
      case "connected":
        return "#4ade80"; // Green
      case "connecting":
      case "checking":
        return "#facc15"; // Yellow
      case "disconnected":
        return "#f97316"; // Orange
      case "failed":
      case "closed":
        return "#ef4444"; // Red
      default:
        return "#a3a3a3"; // Gray
    }
  };

  const getConnectionStatusText = (state: ConnectionState): string => {
    switch (state) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting";
      case "checking":
        return "Checking";
      case "disconnected":
        return "Disconnected";
      case "failed":
        return "Failed";
      case "closed":
        return "Closed";
      default:
        return "Initializing";
    }
  };

  // Calculate circle visualizer size based on audio level
  const getCircleSize = () => {
    // Base scale is 0.6, max scale is 1.1 for more visible changes
    const scale = 0.6 + audioLevel * 0.5;
    return { transform: `scale(${scale})` };
  };

  return (
    <div className={styles.container}>
      {/* Connection indicator */}
      <div className={styles.connectionIndicator}>
        <div
          className={styles.statusDot}
          style={{
            backgroundColor: getConnectionStateColor(connectionState),
          }}
        ></div>
        <span className={styles.statusText}>
          {getConnectionStatusText(connectionState)}
        </span>
      </div>

      {/* Main video and controls container */}
      <div className={styles.callContainer}>
        {/* Video container */}
        <div className={styles.videoContainer}>
          {/* Local video (yourself) */}
          <video
            ref={videoRef}
            className={styles.localVideo}
            autoPlay
            playsInline
            muted // Mute local video to prevent feedback
            style={{ transform: "scaleX(-1)" }} // Mirror effect
          />

          {/* Audio visualizer modal inside video */}
          {callActive && (
            <div className={styles.audioVisualizerContainer}>
              <div className={styles.circleContainer}>
                <div
                  className={styles.circleVisualizer}
                  style={getCircleSize()}
                >
                  <div className={styles.innerCircle}></div>
                </div>
              </div>
              <div className={styles.brandingText}>ConsultAI</div>
            </div>
          )}

          {/* Call title info inside video */}
          <div className={styles.callInfo}>
            <span className={styles.callTitle}>{interviewTitle}</span>
            <span className={styles.callDuration}>
              {formatDuration(callDuration)}
            </span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className={styles.bottomControls}>
          <button
            className={`${styles.controlButton} ${isMuted ? styles.muted : ""}`}
            onClick={handleMuteToggle}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5.889 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.889l5.294-4.332a.5.5 0 01.817.387v15.89a.5.5 0 01-.817.387L5.89 16zm14.525-4l3.536 3.536-1.414 1.414L19 13.414l-3.536 3.536-1.414-1.414L17.586 12 14.05 8.464l1.414-1.414L19 10.586l3.536-3.536 1.414 1.414L20.414 12z" />
              </svg>
            ) : (
              <svg
                fill="currentColor"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path d="M11.553 3.064A.75.75 0 0112 3.75v16.5a.75.75 0 01-1.255.555L5.46 16H2.75A1.75 1.75 0 011 14.25v-4.5C1 8.784 1.784 8 2.75 8h2.71l5.285-4.805a.75.75 0 01.808-.13zM10.5 5.445l-4.245 3.86a.75.75 0 01-.505.195h-3a.25.25 0 00-.25.25v4.5c0 .138.112.25.25.25h3a.75.75 0 01.505.195l4.245 3.86V5.445z" />
                <path d="M18.718 4.222a.75.75 0 011.06 0c4.296 4.296 4.296 11.26 0 15.556a.75.75 0 01-1.06-1.06 9.5 9.5 0 000-13.436.75.75 0 010-1.06z" />
                <path d="M16.243 7.757a.75.75 0 10-1.061 1.061 4.5 4.5 0 010 6.364.75.75 0 001.06 1.06 6 6 0 000-8.485z" />
              </svg>
            )}
          </button>

          {/* End Question button */}
          <button
            className={`${styles.controlButton} ${styles.endQuestion}`}
            onClick={handleEndQuestion}
            title="End question and view results"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
            <span className={styles.buttonText}>End Question</span>
          </button>

          {/* End Call button */}
          <button
            className={`${styles.controlButton} ${styles.endCall}`}
            onClick={handleEndCall}
            title="End interview and return to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M21.384,17.752a2.108,2.108,0,0,1-.522,3.359,7.543,7.543,0,0,1-5.476.642C10.5,20.523,3.477,13.5,2.247,8.614a7.543,7.543,0,0,1,.642-5.476,2.108,2.108,0,0,1,3.359-.522L8.333,4.7a2.094,2.094,0,0,1,.445,2.328A3.877,3.877,0,0,1,8,8.2c-2.384,2.384,5.417,10.185,7.8,7.8a3.877,3.877,0,0,1,1.173-.781,2.092,2.092,0,0,1,2.328.445Z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />

      {/* Transcription display */}
      <div className={styles.transcriptionContainer}>
        <h3>Interview Transcript</h3>
        <div className={styles.transcripts}>
          {transcripts.map((item, index) => (
            <div
              key={index}
              className={`${styles.transcriptItem} ${
                item.speaker === "Interviewer"
                  ? styles.interviewer
                  : item.speaker === "User"
                  ? styles.user
                  : styles.system
              }`}
            >
              <span className={styles.speaker}>{item.speaker}:</span>
              <span className={styles.text}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Speaking indicator */}
        <div className={styles.speakingIndicator}>
          {isUserSpeaking
            ? "Your turn to speak..."
            : "Interviewer is speaking..."}
        </div>
      </div>

      {/* Notifications */}
      {notification.show && (
        <div
          className={`${styles.notification} ${
            styles[`notification-${notification.type}`]
          }`}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default RealtimeConnect;
