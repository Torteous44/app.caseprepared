import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/RealtimeConnect.module.css";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import TranscriptionWithRef from "./Transcription";

// API base URL defined in AuthContext
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

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

interface LocationState {
  title?: string;
  sessionToken?: any;
  turnCredentials?: any;
  questionNumber?: number;
}

interface TranscriptData {
  text: string;
  speaker: string;
  timestamp: string;
}

interface TranscriptionRef {
  closeTranscription: () => Promise<any>;
}

interface TranscriptAnalysis {
  structure: {
    title: string;
    description: string;
  };
  communication: {
    title: string;
    description: string;
  };
  hypothesis_driven_approach: {
    title: string;
    description: string;
  };
  qualitative_analysis: {
    title: string;
    description: string;
  };
  adaptability: {
    title: string;
    description: string;
  };
  [key: string]: any; // Allow for additional properties
}

const AuthenticatedRealtimeConnect: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state || {}) as LocationState;
  const { isAuthenticated } = useAuth();

  // State
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("new");
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
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
  const [isEnding, setIsEnding] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptData[]>([]);
  const [transcriptAnalysis, setTranscriptAnalysis] =
    useState<TranscriptAnalysis | null>(null);

  // Refs
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteMediaStreamRef = useRef<MediaStream>(new MediaStream());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callStartTimeRef = useRef<number | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const transcriptionRef = useRef<TranscriptionRef | null>(null);

  // Show notification helper
  const showNotification = useCallback(
    (message: string, type: NotificationType = "info", duration = 5000) => {
      setNotification({
        show: true,
        message,
        type,
      });

      setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, duration);
    },
    []
  );

  // Set interview title when component mounts
  useEffect(() => {
    if (locationState.title) {
      setInterviewTitle(locationState.title);
    }
  }, [locationState.title]);

  // Initialize media when component mounts
  useEffect(() => {
    // Setup media stream
    let mounted = true;
    const setupMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (mounted) {
          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch (err) {
        console.error("Error accessing media devices:", err);
        if (mounted) {
          showNotification("Failed to access camera/microphone.", "error");
        }
      }
    };

    setupMediaStream();

    // Clean up only if the component is unmounting normally
    // (not due to handleEndQuestion, which does its own cleanup)
    return () => {
      mounted = false;

      // Only cleanup resources if they haven't already been cleaned up by handleEndQuestion
      if (!isEnding) {
        console.log("Cleanup from useEffect");
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          localStreamRef.current = null;
        }

        if (peerConnectionRef.current) {
          peerConnectionRef.current.close();
          peerConnectionRef.current = null;
        }

        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
        }
      }
    };
  }, [showNotification, isEnding]);

  // Check if we have session token and TURN credentials in location state
  useEffect(() => {
    // Don't attempt connection if we're ending a question
    if (isEnding) {
      return;
    }

    // Don't attempt to connect if already active or connecting
    if (callActive || isConnecting) {
      return;
    }

    // Only proceed if we have a valid session ID
    if (!sessionId) {
      return;
    }

    console.log(
      "Connection attempt with questionNumber:",
      locationState.questionNumber
    );

    // Use a timer to prevent immediate connection attempts
    const timer = setTimeout(() => {
      if (!locationState.sessionToken || !locationState.turnCredentials) {
        // If not in location state, fetch them
        fetchCredentialsAndConnect();
      } else {
        // If we already have them, connect directly
        handleConnect(
          locationState.turnCredentials,
          locationState.sessionToken
        );
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId, callActive, isConnecting, locationState, isEnding]);

  // Fetch credentials and connect
  const fetchCredentialsAndConnect = async () => {
    if (!sessionId || !isAuthenticated) {
      showNotification("Authentication required", "error");
      navigate("/interviews");
      return;
    }

    // Don't try to connect if we're in the process of ending a question
    if (isEnding) {
      console.log("Ignoring connection attempt during question ending");
      return;
    }

    try {
      setIsConnecting(true);
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Ensure any existing connections are closed before creating a new one
      if (peerConnectionRef.current) {
        console.log(
          "Closing existing peer connection before creating a new one"
        );
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      // 1. Fetch TURN credentials
      const turnResponse = await fetch(
        `${API_BASE_URL}/api/v1/webrtc/turn-credentials`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!turnResponse.ok) {
        const errorData = await turnResponse.json();
        throw new Error(errorData.detail || "Failed to get TURN credentials");
      }

      const turnCredentials = await turnResponse.json();
      console.log("Got TURN credentials");
      console.log(
        "TURN credentials structure:",
        JSON.stringify(turnCredentials, null, 2)
      );

      // 2. Generate OpenAI ephemeral key
      const questionNumber = locationState.questionNumber || 1;

      const openAIKeyResponse = await fetch(
        `${API_BASE_URL}/api/v1/webrtc/openai-ephemeral-key`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interview_id: sessionId,
            question_number: questionNumber,
          }),
        }
      );

      if (!openAIKeyResponse.ok) {
        const errorData = await openAIKeyResponse.json();
        throw new Error(
          errorData.detail || "Failed to generate OpenAI session token"
        );
      }

      const sessionData = await openAIKeyResponse.json();
      console.log("Got OpenAI session token");

      // 3. Now connect with the credentials
      if (!isEnding) {
        handleConnect(turnCredentials, sessionData);
      } else {
        console.log("Skipping connection as question is ending");
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Error fetching credentials:", error);
      showNotification(
        error instanceof Error
          ? error.message
          : "Failed to get connection credentials",
        "error"
      );
      setIsConnecting(false);
    }
  };

  // Connect to OpenAI realtime
  const handleConnect = async (turnCredentials: any, sessionData: any) => {
    if (isConnecting) return;
    if (isEnding) {
      console.log("Not connecting because question is ending");
      return;
    }

    // If we already have an active connection, don't establish another one
    if (callActive && peerConnectionRef.current) {
      console.log("Connection already active, not creating a new one");
      return;
    }

    setIsConnecting(true);

    try {
      setConnectionState("connecting");

      if (!sessionId) {
        showNotification("Invalid session ID", "error");
        setIsConnecting(false);
        return;
      }

      // Check if media stream is already initialized
      if (!localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
          showNotification("Failed to access camera/microphone.", "error");
          setIsConnecting(false);
          return;
        }
      }

      // Extract ephemeral key from session data
      let ephemeralToken = null;

      // Check structures based on updated documentation
      if (
        sessionData.realtimeSession &&
        sessionData.realtimeSession.client_secret &&
        sessionData.realtimeSession.client_secret.value
      ) {
        // This is the new documented structure
        ephemeralToken = sessionData.realtimeSession.client_secret.value;
        console.log(
          "Found token in realtimeSession.client_secret.value structure"
        );
      } else if (sessionData.client_secret && sessionData.client_secret.value) {
        // This is the current structure in the response
        ephemeralToken = sessionData.client_secret.value;
        console.log("Found token in client_secret.value structure");
      } else if (sessionData.ephemeralKey && sessionData.ephemeralKey.token) {
        // This is the previously documented structure
        ephemeralToken = sessionData.ephemeralKey.token;
        console.log("Found token in ephemeralKey.token structure");
      } else {
        console.log(
          "DEBUG: Available session data keys:",
          Object.keys(sessionData)
        );
        if (sessionData.realtimeSession)
          console.log(
            "realtimeSession keys:",
            Object.keys(sessionData.realtimeSession)
          );
        if (sessionData.apiKey)
          console.log(
            "apiKey structure:",
            typeof sessionData.apiKey,
            "length:",
            sessionData.apiKey.length
          );
      }

      if (!ephemeralToken) {
        // If no ephemeral token is found, fall back to API key (not recommended)
        console.warn(
          "No ephemeral token found in session data. This is insecure."
        );

        // SECURITY WARNING: This should only be used temporarily
        ephemeralToken =
          sessionData.apiKey ||
          sessionData.apiKeyBackup1 ||
          sessionData.apiKeyBackup2;

        if (ephemeralToken) {
          if (ephemeralToken === sessionData.apiKey) {
            console.log("Using primary apiKey");
          } else if (ephemeralToken === sessionData.apiKeyBackup1) {
            console.log("Using apiKeyBackup1");
          } else {
            console.log("Using apiKeyBackup2");
          }
        }

        if (!ephemeralToken) {
          throw new Error("No authentication token found in session data");
        }
      }

      // Check token format
      console.log("Token format:", {
        type: typeof ephemeralToken,
        length: ephemeralToken.length,
        startsWithSk: ephemeralToken.startsWith("sk-"),
        startsWithSkProj: ephemeralToken.startsWith("sk-proj-"),
        endsWithSpecialChars: ephemeralToken.match(/[^A-Za-z0-9]$/),
        firstChar: ephemeralToken.charAt(0),
        lastChar: ephemeralToken.charAt(ephemeralToken.length - 1),
      });

      console.log("Using auth token:", ephemeralToken.substring(0, 15) + "...");

      // Simple validation test against OpenAI API
      try {
        console.log("Testing token with simple OpenAI API call...");
        const testResponse = await axios({
          url: "https://api.openai.com/v1/models",
          method: "GET",
          headers: {
            Authorization: `Bearer ${ephemeralToken}`,
          },
          timeout: 5000,
        });

        console.log(
          "Token test successful! API responded with status:",
          testResponse.status
        );
        console.log(
          "Available models count:",
          testResponse.data?.data?.length || "unknown"
        );
      } catch (testError: any) {
        console.error("Token validation test failed:", testError.message);
        if (testError.response) {
          console.log("Test error status:", testError.response.status);
          console.log(
            "Test error data:",
            JSON.stringify(testError.response.data, null, 2)
          );
        }

        // Don't throw here, just continue with the main connection attempt
        console.log(
          "Continuing with connection attempt despite validation failure..."
        );
      }

      // Create RTCPeerConnection with ICE servers from the credentials
      const configuration: RTCConfiguration = {
        iceServers: [
          ...(turnCredentials.iceServers || []),
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
        iceCandidatePoolSize: 10,
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Set up data channel for heartbeats
      dataChannelRef.current = pc.createDataChannel("heartbeat", {
        ordered: true,
      });

      dataChannelRef.current.onopen = () => {
        console.log("Data channel opened");
      };

      dataChannelRef.current.onclose = () => {
        console.log("Data channel closed");
      };

      // Basic RTCPeerConnection event handlers
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("New ICE candidate:", event.candidate);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);

        if (pc.iceConnectionState === "connected") {
          setConnectionState("connected");
          setIsConnecting(false);
          setCallActive(true);

          // Start call duration timer
          callStartTimeRef.current = Date.now();
          durationIntervalRef.current = setInterval(() => {
            if (callStartTimeRef.current) {
              const seconds = Math.floor(
                (Date.now() - callStartTimeRef.current) / 1000
              );
              setCallDuration(seconds);
            }
          }, 1000);
        } else if (
          pc.iceConnectionState === "failed" ||
          pc.iceConnectionState === "disconnected" ||
          pc.iceConnectionState === "closed"
        ) {
          setConnectionState(pc.iceConnectionState as ConnectionState);
          setIsConnecting(false);

          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
          }

          showNotification("Connection lost. Try reconnecting.", "error");
        }
      };

      pc.ontrack = (event) => {
        console.log("Received remote track:", event.track.kind);

        if (event.track.kind === "audio") {
          try {
            console.log("Processing audio track:", event.track.id);

            // Handle track events
            event.track.onunmute = () => {
              console.log("Audio track unmuted - should be audible now");
            };

            event.track.onmute = () => {
              console.log("Audio track muted - audio paused");
            };

            event.track.onended = () => {
              console.log("Audio track ended");
            };

            const newStream = new MediaStream([event.track]);
            remoteMediaStreamRef.current = newStream;

            // Set up audio playback elements without visible controls
            const setupAudioPlayback = () => {
              // Create multiple audio elements with different approaches

              // 1. Main audio element in the component
              if (audioRef.current) {
                audioRef.current.srcObject = null; // Clear first
                audioRef.current.srcObject = newStream;
                audioRef.current.volume = 1.0; // Full volume
                audioRef.current.muted = false;

                const playPromise = audioRef.current.play();
                playPromise.catch((error) => {
                  console.error("Failed to play in main audio element:", error);
                });
              }

              // 2. Create a completely separate audio element in the body
              const existingBackupAudio =
                document.getElementById("backup-audio");
              if (existingBackupAudio) {
                existingBackupAudio.remove();
              }

              const backupAudio = document.createElement("audio");
              backupAudio.id = "backup-audio";
              backupAudio.autoplay = true;
              backupAudio.srcObject = newStream;
              backupAudio.volume = 1.0;
              backupAudio.muted = false;
              backupAudio.style.display = "none";
              document.body.appendChild(backupAudio);

              backupAudio.play().catch((error) => {
                console.error("Backup audio play failed:", error);
              });

              // 3. Use AudioContext directly for maximum compatibility
              try {
                const AudioContext =
                  window.AudioContext || (window as any).webkitAudioContext;
                const audioCtx = new AudioContext();

                // Create a MediaStreamAudioSourceNode
                const sourceNode = audioCtx.createMediaStreamSource(newStream);

                // Connect directly to destination (speakers)
                sourceNode.connect(audioCtx.destination);

                console.log("Direct AudioContext connection established");
              } catch (error) {
                console.error("AudioContext approach failed:", error);
              }
            };

            // Call immediately and also schedule a few retries to handle delayed tracks
            setupAudioPlayback();
            setTimeout(setupAudioPlayback, 500);
            setTimeout(setupAudioPlayback, 1500);
            setTimeout(setupAudioPlayback, 3000);

            // Also try to unlock audio on next user interaction
            const unlockOnInteraction = () => {
              console.log("User interaction - unlocking audio");
              setupAudioPlayback();
              document.removeEventListener("click", unlockOnInteraction);
              document.removeEventListener("touchstart", unlockOnInteraction);
            };

            document.addEventListener("click", unlockOnInteraction);
            document.addEventListener("touchstart", unlockOnInteraction);
          } catch (err) {
            console.error("Error processing audio track:", err);
          }
        }
      };

      // Add local stream to peer connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          if (localStreamRef.current) {
            pc.addTrack(track, localStreamRef.current);
          }
        });
      }

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      });

      await pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete or timeout
      await Promise.race([
        new Promise<void>((resolve) => {
          const checkState = () => {
            if (pc.iceGatheringState === "complete") {
              pc.removeEventListener("icegatheringstatechange", checkState);
              resolve();
            }
          };

          if (pc.iceGatheringState === "complete") {
            resolve();
          } else {
            pc.addEventListener("icegatheringstatechange", checkState);
          }
        }),
        new Promise<void>((resolve) => {
          setTimeout(() => {
            console.log(
              "ICE gathering timed out, continuing with available candidates"
            );
            resolve();
          }, 5000);
        }),
      ]);

      // Get the current SDP
      const currentSdp = pc.localDescription?.sdp;
      if (!currentSdp) {
        throw new Error("No local SDP available");
      }

      // Send SDP to OpenAI Realtime API
      try {
        console.log("Sending SDP to OpenAI Realtime API");

        // Get the model from session data, using the new structure if available
        let model;
        if (sessionData.realtimeSession && sessionData.realtimeSession.model) {
          model = sessionData.realtimeSession.model;
          console.log("Using model from realtimeSession:", model);
        } else {
          model = sessionData.model || "gpt-4o-mini-realtime-preview";
          console.log("Using model from fallback:", model);
        }

        // Debug SDP format
        console.log(
          "SDP first 100 chars:",
          currentSdp.substring(0, 100).replace(/\n/g, "\\n")
        );
        console.log("SDP length:", currentSdp.length);

        // SECURITY WARNING: Using API keys directly in the frontend is a security risk
        // The backend should be generating proper ephemeral tokens as per documentation
        console.log(`Using model: ${model}`);

        const headers = {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime",
        };

        console.log("Headers being sent:", {
          "Authorization length": headers.Authorization.length,
          "Authorization prefix":
            headers.Authorization.substring(0, 15) + "...",
          "Content-Type": headers["Content-Type"],
          "OpenAI-Beta": headers["OpenAI-Beta"],
        });

        let response;
        try {
          response = await axios({
            url: `https://api.openai.com/v1/realtime?model=${model}`,
            method: "POST",
            headers,
            data: currentSdp,
            timeout: 10000,
          });
        } catch (innerError) {
          // If the first attempt failed, try with different keys if available
          console.log("First connection attempt failed, trying backup options");

          // Try using a different URL format
          if (model.includes("mini")) {
            console.log("Trying with mini-removed from model name");
            const altModel = model.replace("-mini", "");

            console.log(`Trying with alternate model: ${altModel}`);
            response = await axios({
              url: `https://api.openai.com/v1/realtime?model=${altModel}`,
              method: "POST",
              headers,
              data: currentSdp,
              timeout: 10000,
            });
          }
          // If no backup succeeded, rethrow the original error
          else {
            throw innerError;
          }
        }

        const answerSDP = response.data;
        console.log("Received SDP answer from OpenAI Realtime API");

        await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
        console.log("Remote SDP set successfully");

        showNotification("Connected to AI interviewer", "success");
      } catch (error: any) {
        let errorMessage = "Unknown error";
        console.log("DEBUG - Full error object:", {
          name: error.name,
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          hasResponseData: !!error.response?.data,
          hasResponseHeaders: !!error.response?.headers,
        });

        if (error.response) {
          console.log(
            "DEBUG - Response data:",
            JSON.stringify(error.response.data, null, 2)
          );
          console.log("DEBUG - Response headers:", error.response.headers);

          errorMessage = `API returned status ${error.response.status}: ${
            error.response.data?.error?.message || error.response.statusText
          }`;

          // Check specific OpenAI error types
          if (error.response.data?.error?.type) {
            console.log("OpenAI error type:", error.response.data.error.type);
          }

          // Debugging potential key recognition issues
          if (
            error.response.status === 401 &&
            error.response.data?.error?.message
          ) {
            if (error.response.data.error.message.includes("API key")) {
              console.log(
                "API key validation failed. Checking key format issues."
              );
              // Check key structure issues
              if (
                ephemeralToken.includes(" ") ||
                ephemeralToken.includes("\n")
              ) {
                console.error("Key contains whitespace characters!");
              }

              if (ephemeralToken.length < 30) {
                console.error("Key too short for OpenAI API key!");
              }

              // Check if it might be trying to use a base64-encoded string as a key
              const base64Regex =
                /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
              if (base64Regex.test(ephemeralToken)) {
                console.error(
                  "Key appears to be base64 encoded, not a raw API key!"
                );
              }
            }
          }
        } else if (error.request) {
          errorMessage = `Request timeout: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
        console.error(
          `Error sending offer to OpenAI Realtime API: ${errorMessage}`
        );
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Connection error:", error);
      showNotification("Failed to establish connection", "error");
      setIsConnecting(false);
      setConnectionState("failed");
    }
  };

  // Handle mute/unmute toggle
  const handleMuteToggle = useCallback(() => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);

      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
    }
  }, [isMuted]);

  // Handle ending the call
  const handleEndCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setConnectionState("closed");
    setCallActive(false);

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Navigate back to interview page
    navigate(`/my-interview/${sessionId}`);
  }, [navigate, sessionId]);

  // Handle transcript received
  const handleTranscriptReceived = useCallback((transcript: TranscriptData) => {
    setTranscripts((prev) => [...prev, transcript]);
  }, []);

  // Handle transcript analysis received
  const handleTranscriptAnalysisReceived = useCallback(
    (analysis: TranscriptAnalysis) => {
      setTranscriptAnalysis(analysis);
    },
    []
  );

  // Handle ending the question and going to the post-question screen
  const handleEndQuestion = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);

    // Show notification
    showNotification("Ending question...", "info");

    let analysisData: TranscriptAnalysis | null = null;
    let nextQuestionNumber = (locationState.questionNumber || 1) + 1;
    let isAllCompleted = false;
    let completedQuestions: number[] = [];

    try {
      // Add debug logging
      console.log("Trying to close transcription service...");
      console.log("transcriptionRef exists:", !!transcriptionRef.current);
      console.log("Transcription refs:", {
        transcriptionRef: transcriptionRef.current,
        closeMethod: transcriptionRef.current?.closeTranscription,
      });

      // Close transcription service and get analysis data
      if (transcriptionRef.current) {
        try {
          analysisData = await transcriptionRef.current.closeTranscription();
          console.log("Transcription analysis received:", !!analysisData);
          console.log(
            "Analysis data keys:",
            analysisData ? Object.keys(analysisData) : "none"
          );
        } catch (transcriptionError) {
          console.error("Error closing transcription:", transcriptionError);
        }
      }

      // Call the API to mark the question as complete
      const questionNumber = locationState.questionNumber || 1;
      const token = localStorage.getItem("access_token");

      if (!token) {
        console.warn("No authentication token found");
        // Continue even without a token - we'll use default values
      } else {
        try {
          console.log(
            `Calling API to complete question ${questionNumber} for interview ${sessionId}`
          );

          // Make API call to complete the question
          const completeResponse = await fetch(
            `${API_BASE_URL}/api/v1/interviews/${sessionId}/questions/${questionNumber}/complete`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("API response status:", completeResponse.status);

          if (!completeResponse.ok) {
            const errorText = await completeResponse.text();
            console.error("Error response:", errorText);

            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch (e) {
              console.error("Failed to parse error JSON:", e);
            }

            console.warn(
              `Failed to mark question as complete (Status: ${
                completeResponse.status
              }): ${errorData?.detail || "Unknown error"}`
            );
            // Continue with default values - not stopping the flow
          } else {
            const updatedInterview = await completeResponse.json();
            console.log(
              "Question marked as complete. Updated interview data:",
              updatedInterview
            );

            // Get the next question number from the API response
            nextQuestionNumber =
              updatedInterview.progress_data?.current_question ||
              questionNumber + 1;
            isAllCompleted = updatedInterview.status === "completed";
            completedQuestions =
              updatedInterview.progress_data?.questions_completed || [];

            console.log("Next question will be:", nextQuestionNumber);
            console.log("Completed questions:", completedQuestions);
            console.log(
              "Interview completion status:",
              updatedInterview.status
            );
          }
        } catch (apiError) {
          console.error("API error:", apiError);
          // Continue with default values - not stopping the flow
        }
      }

      // Clean up connection
      if (peerConnectionRef.current) {
        // Close peer connection
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Close data channel if open
      if (dataChannelRef.current) {
        dataChannelRef.current.close();
        dataChannelRef.current = null;
      }

      // Stop local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        localStreamRef.current = null;
      }

      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }

      // Cancel animation frame if active
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // Clear timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      setConnectionState("closed");
      setCallActive(false);

      // Set default values for post-question screen if they weren't set from the API
      // If question number is not available, default to 1
      const currentQuestionNumber = locationState.questionNumber || 1;
      // Add current question to completed questions if not already there
      if (!completedQuestions.includes(currentQuestionNumber)) {
        completedQuestions.push(currentQuestionNumber);
      }
      // Default total questions
      const totalQuestions = 4;

      // Navigate to post-question screen with the necessary data
      console.log("Navigating to post-question screen");
      console.log("Navigation data:", {
        path: `/interview/post-question/${sessionId}`,
        title: interviewTitle,
        questionNumber: currentQuestionNumber,
        nextQuestionNumber,
        totalQuestions,
        isAllCompleted,
        completedQuestions: completedQuestions.length,
        hasTranscriptAnalysis: !!analysisData || !!transcriptAnalysis,
      });

      try {
        // Use the exact path from App.tsx route definition
        const postQuestionPath = `/interview/post-question/${sessionId}`;
        console.log(`Navigating to: ${postQuestionPath}`);

        navigate(postQuestionPath, {
          state: {
            title: interviewTitle,
            questionNumber: currentQuestionNumber,
            nextQuestionNumber,
            totalQuestions,
            isAllCompleted,
            completedQuestions,
            transcriptAnalysis: analysisData || transcriptAnalysis, // Include analysis data
          },
        });
        console.log("Navigation called successfully");
      } catch (navError) {
        console.error("Navigation error:", navError);
      }
    } catch (error) {
      console.error("Error during question ending process:", error);

      // Even in case of errors, try to navigate to the post-question screen
      // with whatever data we have
      try {
        navigate(`/interview/post-question/${sessionId}`, {
          state: {
            title: interviewTitle,
            questionNumber: locationState.questionNumber || 1,
            nextQuestionNumber: (locationState.questionNumber || 1) + 1,
            totalQuestions: 4,
            isAllCompleted: false,
            completedQuestions: [],
            transcriptAnalysis: analysisData || transcriptAnalysis,
          },
        });
        console.log("Fallback navigation executed");
      } catch (navError) {
        console.error("Fallback navigation error:", navError);
        showNotification(
          "Failed to navigate to results. Please try again or return to the interviews page.",
          "error"
        );
      }

      setIsEnding(false);
    }
  }, [
    navigate,
    sessionId,
    interviewTitle,
    locationState.questionNumber,
    isEnding,
    showNotification,
    transcriptAnalysis,
  ]);

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

  // Setup audio visualizer
  useEffect(() => {
    if (remoteMediaStreamRef.current && callActive) {
      try {
        // Clean up previous audio context if it exists
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(console.error);
          audioContextRef.current = null;
        }

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        // Create new audio context
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // Create audio source from the stream
        const source = audioContextRef.current.createMediaStreamSource(
          remoteMediaStreamRef.current
        );

        // Create analyzer
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        // Create data array for frequency data
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Function to update audio level for visualizer
        const updateAudioLevel = () => {
          if (!analyserRef.current || !callActive) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }

          // Calculate average level and normalize to 0-1
          const avg = Math.min(1, Math.max(0, sum / (bufferLength * 255)));
          setAudioLevel(avg);

          // Continue animation loop
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };

        // Start animation loop
        updateAudioLevel();
      } catch (error) {
        console.error("Error setting up audio visualizer:", error);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [remoteMediaStreamRef.current, callActive]);

  // Calculate circle visualizer size based on audio level
  const getCircleSize = () => {
    // Base scale is 0.6, max scale is 1.1 for more visible changes
    const scale = 0.6 + audioLevel * 0.5;
    return { transform: `scale(${scale})` };
  };

  // Debug useEffect to watch navigation
  useEffect(() => {
    // Track the current location
    console.log("Current location:", {
      pathname: location.pathname,
      state: location.state,
    });
  }, [location]);

  // Debug log when component mounts/unmounts
  useEffect(() => {
    console.log(
      `AuthenticatedRealtimeConnect mounted with sessionId: ${sessionId}`
    );
    return () => {
      console.log(
        `AuthenticatedRealtimeConnect unmounting with sessionId: ${sessionId}`
      );
    };
  }, [sessionId]);

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
            disabled={isConnecting || isEnding}
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
            disabled={isEnding}
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

      {/* Transcription component */}
      {sessionId && (
        <TranscriptionWithRef
          ref={transcriptionRef}
          remoteMediaStream={remoteMediaStreamRef.current}
          localStream={localStreamRef.current}
          isCallActive={callActive}
          onTranscriptReceived={handleTranscriptReceived}
          sessionId={sessionId}
          questionNumber={locationState.questionNumber || 1}
          onQuestionEnd={handleTranscriptAnalysisReceived}
        />
      )}

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

export default AuthenticatedRealtimeConnect;
