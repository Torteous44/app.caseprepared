import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/RealtimeConnect.module.css";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../contexts/AuthContext";
import LongPopup from "../landing/LongPopup";

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
  questionNumber?: number;
  demoType?: string;
}

// Demo API base URL
// Ensure backend URL is correct for the environment
const DEMO_API_BASE_URL = "https://caseprepcrud.onrender.com/api/v1/demo";

// Define the extension for HTMLAudioElement to include setSinkId
interface HTMLAudioElementWithSinkId extends HTMLAudioElement {
  setSinkId(deviceId: string): Promise<void>;
}

const DemoRealtimeConnect: React.FC = () => {
  const { demoTypeId, sessionId } = useParams<{
    demoTypeId: string;
    sessionId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state as LocationState) || {};
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();

  // TROUBLESHOOTING: Log initial params
  console.log("DemoRealtimeConnect MOUNTED with params:", {
    demoTypeId,
    sessionId,
    locationState,
    path: location.pathname,
  });

  // Get demo type and question number from params or location state
  const demoType = demoTypeId || sessionId || locationState.demoType;
  const questionNumber = locationState.questionNumber || 1;

  // TROUBLESHOOTING: Log derived values
  console.log("Demo values:", { demoType, questionNumber });

  // State
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("new");
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0); // For the circle visualizer
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
  // Helper notification state
  const [showHelperNotification, setShowHelperNotification] = useState(false);

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

  // Handle connection state color
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

  // Handle connection status text
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

  // Create API instance before other code that depends on it
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: DEMO_API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return instance;
  }, []);

  // Initialize media when component mounts
  useEffect(() => {
    // Setup media stream
    let mounted = true;
    const setupMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, // Enable video
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            // Enhanced audio quality settings
            sampleRate: 48000,
            channelCount: 2,
          },
        });

        // Only set the stream if component is still mounted
        if (mounted) {
          localStreamRef.current = stream;

          // Set local video stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } else {
          // Clean up stream if component unmounted during async operation
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

    // Clean up function to stop all tracks when component unmounts
    return () => {
      mounted = false;
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
    };
  }, [showNotification]);

  // Show helper notification when call becomes active
  useEffect(() => {
    if (callActive && connectionState === "connected") {
      setShowHelperNotification(true);

      // Hide the notification after 7 seconds
      const timer = setTimeout(() => {
        setShowHelperNotification(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [callActive, connectionState]);

  // Initiate connection when component mounts with session ID
  useEffect(() => {
    console.log("Connection effect triggered:", {
      demoType,
      callActive,
      isConnecting,
    });

    if (demoType && !callActive && !isConnecting) {
      // Allow a short delay for the media setup to complete
      console.log(
        "Starting connection for demo type:",
        demoType,
        "question:",
        questionNumber
      );
      const timer = setTimeout(() => {
        console.log("Calling handleConnect()");
        handleConnect();
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      console.log("Not starting connection because:", {
        hasDemoType: !!demoType,
        callNotActive: !callActive,
        notConnecting: !isConnecting,
      });
    }
  }, [demoType, callActive, isConnecting]);

  // Mark the current question as complete
  const markQuestionAsComplete = useCallback(async () => {
    if (!demoType) return;

    try {
      const response = await fetch(
        `${DEMO_API_BASE_URL}/interviews/complete-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            case_type: demoType,
            question_number: questionNumber,
          }),
        }
      );

      if (response.ok) {
        console.log(
          `Question ${questionNumber} for demo ${demoType} marked as complete`
        );
      } else {
        console.error(
          "Failed to mark question as complete:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error marking question as complete:", error);
    }
  }, [demoType, questionNumber]);

  // Check for 60 second trial end
  useEffect(() => {
    if (callActive && callDuration === 60) {
      // Stop all tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Stop the timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Update state
      setCallActive(false);
      setConnectionState("closed");

      if (isAuthenticated) {
        // For authenticated users, navigate directly to the demo post question screen
        markQuestionAsComplete();

        // Set a flag in localStorage to indicate the user completed a demo call
        localStorage.setItem("demo_call_completed", "true");
        localStorage.setItem("demo_call_timestamp", Date.now().toString());

        navigate(`/interview/demo-post-question/${demoType}`, {
          state: {
            title: interviewTitle,
            questionNumber: questionNumber,
            demoType: demoType,
            callDuration: callDuration,
          },
        });
      } else {
        // For non-logged in users, show the registration modal
        openModal("register");

        // Navigate back to home page after a short delay
        setTimeout(() => {
          navigate("/");
        }, 500);
      }
    }
  }, [
    callDuration,
    callActive,
    navigate,
    openModal,
    isAuthenticated,
    demoType,
    interviewTitle,
    questionNumber,
    markQuestionAsComplete,
  ]);

  // End call
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

    // Mark question as complete before navigating
    markQuestionAsComplete();

    if (isAuthenticated) {
      // Set a flag in localStorage to indicate the user completed a demo call
      localStorage.setItem("demo_call_completed", "true");
      localStorage.setItem("demo_call_timestamp", Date.now().toString());

      // For authenticated users, navigate to the demo post question screen
      navigate(`/interview/demo-post-question/${demoType}`, {
        state: {
          title: interviewTitle,
          questionNumber: questionNumber,
          demoType: demoType,
          callDuration: callDuration,
        },
      });
    } else {
      // For non-authenticated users, navigate back to interviews page
      navigate("/interviews");
    }
  }, [
    navigate,
    markQuestionAsComplete,
    isAuthenticated,
    demoType,
    interviewTitle,
    questionNumber,
    callDuration,
  ]);

  // Check for 3 minute (180 second) limit for authenticated users
  useEffect(() => {
    if (callActive && callDuration === 180 && isAuthenticated) {
      // Stop all tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // Close peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Stop the timer
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Update state
      setCallActive(false);
      setConnectionState("closed");

      // Mark question as complete before navigating
      markQuestionAsComplete();

      // Set a flag in localStorage to indicate the user completed a demo call
      localStorage.setItem("demo_call_completed", "true");
      localStorage.setItem("demo_call_timestamp", Date.now().toString());

      // Navigate to the demo post question screen
      navigate(`/interview/demo-post-question/${demoType}`, {
        state: {
          title: interviewTitle,
          questionNumber: questionNumber,
          demoType: demoType,
          callDuration: callDuration,
        },
      });
    }
  }, [
    callDuration,
    callActive,
    isAuthenticated,
    navigate,
    demoType,
    interviewTitle,
    questionNumber,
    markQuestionAsComplete,
  ]);

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

  // Mute/unmute toggle
  const handleMuteToggle = useCallback(() => {
    if (localStreamRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);

      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuteState;
      });
    }
  }, [isMuted]);

  // Connect to interview
  async function handleConnect() {
    console.log("=== handleConnect STARTED ===");
    if (isConnecting) {
      console.log("Already connecting, exiting handleConnect");
      return;
    }

    setIsConnecting(true);
    console.log("handleConnect called - connecting to backend");
    console.log("DEMO_API_BASE_URL:", DEMO_API_BASE_URL);

    try {
      setConnectionState("connecting");

      if (!demoType) {
        console.error("No demo type provided");
        showNotification("Invalid demo type", "error");
        setIsConnecting(false);
        return;
      }

      console.log("Demo type validated:", demoType);

      // Check if media stream is already initialized
      if (!localStreamRef.current) {
        console.log("No local stream found, requesting permissions");
        try {
          console.log("Requesting camera/microphone permissions");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true, // Enable video
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              // Enhanced audio quality settings
              sampleRate: 48000,
              channelCount: 2,
            },
          });

          localStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          console.log("Camera/microphone permissions granted");
        } catch (err) {
          console.error("Error accessing media devices:", err);
          showNotification("Failed to access camera/microphone.", "error");
          setIsConnecting(false);
          return;
        }
      } else {
        console.log("Local stream already exists, skipping media setup");
      }

      // Get TURN credentials from the demo backend
      console.log(
        "Attempting to fetch TURN credentials from:",
        `${DEMO_API_BASE_URL}/turn-credentials`
      );
      try {
        const turnResp = await fetch(`${DEMO_API_BASE_URL}/turn-credentials`);
        if (!turnResp.ok) {
          throw new Error(
            `Failed to get TURN credentials: ${turnResp.status} ${turnResp.statusText}`
          );
        }
        const turnData = await turnResp.json();
        console.log("Got TURN credentials:", turnData);

        // Get ephemeral token for the OpenAI Realtime API using the demo endpoint
        console.log(
          "Fetching token from:",
          `${DEMO_API_BASE_URL}/direct-token/${demoType}/${questionNumber}?ttl=3600`
        );
        const rtResp = await fetch(
          `${DEMO_API_BASE_URL}/direct-token/${demoType}/${questionNumber}?ttl=3600`
        );
        if (!rtResp.ok) {
          throw new Error(
            `Failed to get token: ${rtResp.status} ${rtResp.statusText}`
          );
        }
        const rtData = await rtResp.json();
        console.log("Received token data:", rtData);

        // Use the simplified token format
        const ephemeralKey = rtData.token;
        if (!ephemeralKey) {
          throw new Error("No token received from server");
        }

        console.log(
          "Got ephemeral key:",
          ephemeralKey.substring(0, 15) + "..."
        );

        // Create RTCPeerConnection with ICE servers from the backend
        const configuration: RTCConfiguration = {
          iceServers: [
            ...(Array.isArray(turnData.iceServers) ? turnData.iceServers : []),
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

        // Set up event handlers
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

        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc.connectionState);

          if (pc.connectionState === "connected") {
            setConnectionState("connected");
            setIsConnecting(false);
            setCallActive(true);

            if (!callStartTimeRef.current) {
              // Start call duration timer if not already started
              callStartTimeRef.current = Date.now();
              durationIntervalRef.current = setInterval(() => {
                if (callStartTimeRef.current) {
                  const seconds = Math.floor(
                    (Date.now() - callStartTimeRef.current) / 1000
                  );
                  setCallDuration(seconds);
                }
              }, 1000);
            }
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

              // Create a brand new stream for each track to avoid stale references
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

                  // Add audio quality optimizations
                  try {
                    // Cast to our interface with setSinkId
                    const audioElementWithSinkId =
                      audioRef.current as HTMLAudioElementWithSinkId;
                    if (
                      typeof audioElementWithSinkId.setSinkId === "function"
                    ) {
                      // Use default audio output device
                      audioElementWithSinkId
                        .setSinkId("default")
                        .catch((e: Error) =>
                          console.log("Could not set audio output device:", e)
                        );
                    }
                  } catch (e) {
                    console.log(
                      "Browser doesn't support advanced audio output settings"
                    );
                  }

                  const playPromise = audioRef.current.play();
                  playPromise.catch((error) => {
                    console.error(
                      "Failed to play in main audio element:",
                      error
                    );
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
                  const sourceNode =
                    audioCtx.createMediaStreamSource(newStream);

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

        // Add local stream to peer connection with prioritized audio
        if (localStreamRef.current) {
          // Add audio tracks first with high priority
          const audioTracks = localStreamRef.current.getAudioTracks();
          if (audioTracks.length > 0) {
            const audioTrack = audioTracks[0];
            console.log("Adding audio track with high priority");
            const sender = pc.addTrack(audioTrack, localStreamRef.current);

            // Try to set high priority for audio (modern browsers only)
            try {
              const params = sender.getParameters();
              if (!params.encodings) {
                params.encodings = [{}];
              }
              params.encodings[0].priority = "high";
              sender
                .setParameters(params)
                .catch((e) =>
                  console.log(
                    "Could not set audio priority, continuing anyway:",
                    e
                  )
                );
            } catch (e) {
              console.log(
                "Browser doesn't support advanced encoding parameters"
              );
            }
          }

          // Then add video tracks
          const videoTracks = localStreamRef.current.getVideoTracks();
          videoTracks.forEach((track) => {
            if (localStreamRef.current) {
              pc.addTrack(track, localStreamRef.current);
            }
          });
        }

        // Create offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
        });

        // Try to optimize audio bandwidth in SDP
        try {
          if (offer.sdp) {
            // Set higher bitrate for audio (128kbps)
            const modifiedSdp = offer.sdp.replace(
              /(m=audio.*\r\n)/g,
              "$1b=AS:128\r\n"
            );
            offer.sdp = modifiedSdp;
            console.log("Applied audio bitrate optimization in SDP");
          }
        } catch (e) {
          console.log("Could not modify SDP for bandwidth optimization:", e);
        }

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
          const response = await axios({
            url: "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
            method: "POST",
            headers: {
              Authorization: `Bearer ${ephemeralKey}`,
              "Content-Type": "application/sdp",
            },
            data: currentSdp,
            timeout: 10000,
          });

          const answerSDP = response.data;
          console.log("Received SDP answer from OpenAI Realtime API");

          await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
          console.log("Remote SDP set successfully");

          showNotification("Connected to AI interviewer", "success");
        } catch (error: any) {
          let errorMessage = "Unknown error";
          if (error.response) {
            errorMessage = `API returned status ${error.response.status}: ${
              error.response.data?.error?.message || error.response.statusText
            }`;
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
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        showNotification(
          `Backend error: ${
            fetchError instanceof Error ? fetchError.message : "Unknown error"
          }`,
          "error"
        );
        setIsConnecting(false);
        setConnectionState("failed");
        return;
      }
    } catch (error) {
      console.error("Connection error in main try/catch:", error);
      showNotification("Failed to establish connection", "error");
      setIsConnecting(false);
      setConnectionState("failed");
    }
  }

  // Format call duration
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Calculate circle visualizer size based on audio level
  const getCircleSize = () => {
    // Base scale is 0.6, max scale is 1.1 for more visible changes
    const scale = 0.6 + audioLevel * 0.5;
    return { transform: `scale(${scale})` };
  };

  // Set interview title based on location state
  useEffect(() => {
    if (locationState.title) {
      setInterviewTitle(locationState.title);
    } else {
      // Set default titles based on demo type
      const demoTitles: Record<string, string> = {
        "market-entry": "Climate Case - BCG Case",
        profitability: "Beautify - McKinsey Case",
        merger: "Coffee Shop Co. - Bain Case",
      };

      if (demoType && demoTitles[demoType]) {
        setInterviewTitle(demoTitles[demoType]);
      }
    }
  }, [locationState.title, demoType]);

  return (
    <div className={styles.container}>
      {/* Helper notification */}
      {showHelperNotification && (
        <div className={styles.helperNotification}>
          <div className={styles.helperNotificationContent}>
            <span>Say hello to start the interview!</span>
          </div>
        </div>
      )}

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
          </div>
        </div>

        {/* Bottom controls - now outside the video container */}
        <div className={styles.bottomControls}>
          <button
            className={`${styles.controlButton} ${isMuted ? styles.muted : ""}`}
            onClick={handleMuteToggle}
            disabled={isConnecting}
          >
            {isMuted ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M10.121 10.121L12 12m-7.071 2.828l7.071-7.07m0 0L14.12 5.88M12 12l2.121 2.121M4.242 10.121l1.414-1.414M18.364 17.657l1.414-1.414M18.364 6.343l-1.414-1.414M5.636 17.657L7.05 19.07M16 12H2m10-7v14" />
                  <path d="M12,4L12,4c-1.105,0-2,0.895-2,2v5c0,1.105,0.895,2,2,2h0c1.105,0,2-0.895,2-2V6C14,4.895,13.105,4,12,4z" />
                  <line
                    x1="3"
                    y1="3"
                    x2="21"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M12,16c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2s-2,0.9-2,2v8C10,15.1,10.9,16,12,16z" />
                <path d="M16,12v2c0,2.21-1.79,4-4,4s-4-1.79-4-4v-2H6v2c0,2.97,2.16,5.43,5,5.91V22h2v-2.09c2.84-0.48,5-2.94,5-5.91v-2H16z" />
              </svg>
            )}
          </button>

          {/* End Call button updated with phone icon */}
          <button
            className={`${styles.controlButton} ${styles.endCall}`}
            onClick={handleEndCall}
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

          <button className={styles.controlButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="currentColor"
            >
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />

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

export default DemoRealtimeConnect;
