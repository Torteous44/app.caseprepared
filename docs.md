# Sessions Start Endpoint

## Overview
This endpoint initiates a new interview session based on a specified interview ID.

## Base URL
`https://demobackend-p2e1.onrender.com`

## Endpoint
`POST /sessions/start`

## Headers
- `Authorization`: Bearer token (required)
- `Content-Type`: application/json

## Request Body
```json
{
  "interview_id": "string" // Required: ID of the interview to start
}
```

## Response
### Success (200 OK)
```json
{
  "id": "string", // Session ID used for accessing the interview
  // Other session properties may be included
}
```

### Error Responses
- `401 Unauthorized`: Invalid or missing authentication token
- `404 Not Found`: Interview not found
- `400 Bad Request`: Missing required parameters

## Usage Example
```javascript
const startSession = async (interviewId) => {
  const token = localStorage.getItem("token");
  
  const response = await fetch("https://demobackend-p2e1.onrender.com/sessions/start", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      interview_id: interviewId,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || "Failed to start session");
  }
  
  return data;
};
```

## Notes
- After successfully starting a session, navigate to the interview using the returned session ID
- Authentication is required to start a session 



6276 - Beautify
A72B - Climate Case - BCG Case
3DE0 - Coffee Shop Co. - Bain Case


import React, {
  useEffect,
  useState,
  useRef,
  useReducer,
  useCallback,
  useMemo,
} from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import AudioVisualizer from "./AudioVisualizer.js";
import styles from "../../styles/realtimeconnect.module.css";
import Transcription from "./Transcription.js";

/** ===========================
 *     TYPES & INTERFACES
 *  =========================== */

type ConnectionState =
  | "new"
  | "checking"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

type NetworkQuality = "unknown" | "excellent" | "good" | "fair" | "poor";

interface Transcript {
  text: string;
  speaker: string;
  timestamp: string;
}

interface NotificationState {
  show: boolean;
  message: string;
  type: "info" | "warning" | "error" | "success";
}

interface RealtimeConnectState {
  isConnecting: boolean;
  callActive: boolean;
  connectionState: ConnectionState;
  networkQuality: NetworkQuality;
  isMuted: boolean;
  callStartTime: number | null;
  callDuration: number;
  transcripts: Transcript[];
  lastPongTime: number | null;
  lastAudioTime: number | null;
  notification: NotificationState;
}

type RealtimeAction =
  | { type: "SET_CONNECTING"; payload: boolean }
  | { type: "SET_CALL_ACTIVE"; payload: boolean }
  | { type: "SET_CONNECTION_STATE"; payload: ConnectionState }
  | { type: "SET_NETWORK_QUALITY"; payload: NetworkQuality }
  | { type: "ADD_TRANSCRIPT"; payload: Transcript }
  | { type: "SET_NOTIFICATION"; payload: NotificationState }
  | { type: "SET_MUTED"; payload: boolean }
  | { type: "SET_CALL_DURATION"; payload: number }
  | { type: "SET_CALL_START_TIME"; payload: number | null }
  | { type: "SET_LAST_PONG_TIME"; payload: number | null }
  | { type: "SET_LAST_AUDIO_TIME"; payload: number | null };

interface CallInfo {
  title: string;
  host: string;
  price: string;
}

interface LastTranscriptRef {
  text: string;
  speaker: string;
  timestamp: string;
}

/** ===========================
 *     REDUCER
 *  =========================== */
function connectionReducer(
  state: RealtimeConnectState,
  action: RealtimeAction
): RealtimeConnectState {
  switch (action.type) {
    case "SET_CONNECTING":
      return { ...state, isConnecting: action.payload };
    case "SET_CALL_ACTIVE":
      return { ...state, callActive: action.payload };
    case "SET_CONNECTION_STATE":
      return { ...state, connectionState: action.payload };
    case "SET_NETWORK_QUALITY":
      return { ...state, networkQuality: action.payload };
    case "ADD_TRANSCRIPT":
      return { ...state, transcripts: [...state.transcripts, action.payload] };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.payload };
    case "SET_MUTED":
      return { ...state, isMuted: action.payload };
    case "SET_CALL_DURATION":
      return { ...state, callDuration: action.payload };
    case "SET_CALL_START_TIME":
      return { ...state, callStartTime: action.payload };
    case "SET_LAST_PONG_TIME":
      return { ...state, lastPongTime: action.payload };
    case "SET_LAST_AUDIO_TIME":
      return { ...state, lastAudioTime: action.payload };
    default:
      return state;
  }
}

/** ===========================
 *     COMPONENT
 *  =========================== */

const RealtimeConnect: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [log, setLog] = useState<string>("");

  // Create API instance before other code that depends on it
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "https://demobackend-p2e1.onrender.com",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token");
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    return instance;
  }, []);

  // Reducer-based state
  const [state, dispatch] = useReducer(connectionReducer, {
    isConnecting: false,
    callActive: false,
    connectionState: "new",
    networkQuality: "unknown",
    isMuted: false,
    callStartTime: null,
    callDuration: 0,
    transcripts: [],
    lastPongTime: null,
    lastAudioTime: null,
    notification: {
      show: false,
      message: "",
      type: "info",
    },
  } as RealtimeConnectState);

  // Basic call info from location or defaults
  const [callInfo, setCallInfo] = useState<CallInfo>({
    title: "Loading...",
    host: "Loading...",
    price: "$5.00 call",
  });

  // Refs
  const remoteMediaStreamRef = useRef<MediaStream>(new MediaStream());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const iceRestartAttemptsRef = useRef<number>(0);
  const maxIceRestarts = 3;
  const iceRestartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const lastTranscriptRef = useRef<LastTranscriptRef>({
    text: "",
    speaker: "",
    timestamp: "",
  });

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const HEARTBEAT_INTERVAL = 10000; // 10 seconds
  const HEARTBEAT_TIMEOUT = 15000; // 15 seconds
  const AUDIO_SILENCE_THRESHOLD = 15000; // 15 seconds
  const hasInitializedRef = useRef<boolean>(false);

  /** ===========================
   *     EFFECTS
   *  =========================== */

  // Set call info from navigation state
  useEffect(() => {
    if (location.state && typeof location.state === "object") {
      const { title, host, price } = location.state as Partial<CallInfo>;
      setCallInfo({
        title: title || "Loading...",
        host: host || "Loading...",
        price: price ? `$${price} call` : "$5.00 call",
      });
    }
  }, [location.state]);

  useEffect(() => {
    console.log("Debug environment:", {
      NODE_ENV: process.env.NODE_ENV,
      SHOW_DEBUG_LOGS: process.env.REACT_APP_SHOW_DEBUG_LOGS,
    });
  }, []);

  useEffect(() => {
    appendLog("Debug logging initialized...");
  }, []);

  // Auto-connect when component mounts if we have a sessionId
  useEffect(() => {
    if (sessionId && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      reconnectAttemptsRef.current = 0;

      // Slight delay to ensure component is fully mounted
      setTimeout(() => {
        handleConnect();
      }, 100);
    }

    // Cleanup
    return () => {
      appendLog("Component unmounting - cleaning up resources...");

      // Clear intervals/timeouts
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (iceRestartTimeoutRef.current) {
        clearTimeout(iceRestartTimeoutRef.current);
        iceRestartTimeoutRef.current = null;
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }

      // Clean up peer connection
      if (peerConnectionRef.current) {
        const pc = peerConnectionRef.current;
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.oniceconnectionstatechange = null;
        pc.onicegatheringstatechange = null;
        pc.onsignalingstatechange = null;
        pc.onconnectionstatechange = null;

        // Close all data channels safely
        try {
          // Cast to any to avoid TypeScript errors with non-standard methods
          const dataChannels = (pc as any).getDataChannels?.();
          if (dataChannels && Array.isArray(dataChannels)) {
            dataChannels.forEach((channel: RTCDataChannel) => channel.close());
          } else if (dataChannelRef.current) {
            dataChannelRef.current.close();
          }
        } catch (error) {
          // Silently handle if browser doesn't support getDataChannels
        }

        pc.close();
        peerConnectionRef.current = null;
      }

      // Clean up audio
      if (audioRef.current) {
        audioRef.current.srcObject = null;
        audioRef.current.load();
      }

      // Clean up media streams
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        localStreamRef.current = null;
      }

      if (remoteMediaStreamRef.current) {
        remoteMediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
        remoteMediaStreamRef.current = new MediaStream();
      }

      // Reset all state
      dispatch({ type: "SET_CONNECTION_STATE", payload: "closed" });
      dispatch({ type: "SET_CALL_ACTIVE", payload: false });
      dispatch({ type: "SET_CONNECTING", payload: false });
      dispatch({ type: "SET_NETWORK_QUALITY", payload: "unknown" });
      dispatch({ type: "SET_MUTED", payload: false });

      // Heartbeat cleanup
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      if (heartbeatTimeoutRef.current) {
        clearTimeout(heartbeatTimeoutRef.current);
        heartbeatTimeoutRef.current = null;
      }

      appendLog("Call ended - all resources cleaned up");
    };
  }, [sessionId]);

  /** ===========================
   *     HELPERS & UTILS
   *  =========================== */

  function appendLog(msg: string) {
    console.log("Log:", msg);
    setLog((prev) => prev + "\n" + msg);
  }

  function getConnectionStateColor(stateValue: ConnectionState): string {
    switch (stateValue) {
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
  }

  function getConnectionStatusText(stateValue: ConnectionState): string {
    switch (stateValue) {
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
  }

  const showNotification = useCallback(
    (
      message: string,
      type: NotificationState["type"] = "info",
      duration = 5000
    ) => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      dispatch({
        type: "SET_NOTIFICATION",
        payload: {
          show: true,
          message,
          type,
        },
      });

      notificationTimeoutRef.current = setTimeout(() => {
        dispatch({
          type: "SET_NOTIFICATION",
          payload: { ...state.notification, show: false },
        });
      }, duration);
    },
    [state.notification]
  );

  /** ===========================
   *   CONNECTION QUALITY MONITOR
   *  =========================== */
  const monitorConnectionQuality = useCallback(
    (pc: RTCPeerConnection) => {
      if (!pc) return;

      const statsInterval = setInterval(async () => {
        if (pc.connectionState !== "connected") {
          clearInterval(statsInterval);
          return;
        }

        try {
          const stats = await pc.getStats();
          let totalPacketsLost = 0;
          let totalPackets = 0;
          let currentRtt = 0;
          let jitter = 0;

          stats.forEach((stat) => {
            if (stat.type === "inbound-rtp" && "packetsLost" in stat) {
              totalPacketsLost += stat.packetsLost as number;
              totalPackets += (stat.packetsReceived as number) || 0;
              if ("jitter" in stat) {
                jitter = Math.max(jitter, stat.jitter as number);
              }
            }
            if (stat.type === "remote-inbound-rtp" && "roundTripTime" in stat) {
              currentRtt = stat.roundTripTime as number;
            }
          });

          const packetLossPercent =
            totalPackets > 0 ? (totalPacketsLost / totalPackets) * 100 : 0;

          let quality: NetworkQuality = "excellent";
          if (packetLossPercent > 10 || currentRtt > 0.3 || jitter > 0.05) {
            quality = "poor";
          } else if (
            packetLossPercent > 5 ||
            currentRtt > 0.15 ||
            jitter > 0.03
          ) {
            quality = "fair";
          } else if (
            packetLossPercent > 1 ||
            currentRtt > 0.05 ||
            jitter > 0.01
          ) {
            quality = "good";
          }

          dispatch({ type: "SET_NETWORK_QUALITY", payload: quality });
          appendLog(
            `Connection quality: ${quality} (loss: ${packetLossPercent.toFixed(
              1
            )}%, RTT: ${(currentRtt * 1000).toFixed(0)}ms, jitter: ${(
              jitter * 1000
            ).toFixed(1)}ms)`
          );

          if (quality === "poor" && state.callActive) {
            showNotification(
              "Connection quality is poor. Consider switching to a more stable network.",
              "warning",
              10000
            );
          }
        } catch (err) {
          console.error("Error getting connection stats:", err);
        }
      }, 3000);

      return () => clearInterval(statsInterval);
    },
    [showNotification, state.callActive]
  );

  /** ===========================
   *   RECONNECT LOGIC
   *  =========================== */
  const attemptReconnect = useCallback(async () => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      appendLog(
        "Maximum reconnection attempts reached. Please try again later."
      );
      dispatch({ type: "SET_CONNECTING", payload: false });
      return;
    }

    reconnectAttemptsRef.current++;
    appendLog(
      `Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}...`
    );

    try {
      await handleConnect();
    } catch (err) {
      if (err instanceof Error) {
        appendLog(`Reconnection failed: ${err.message}`);
      } else {
        appendLog(`Reconnection failed: ${String(err)}`);
      }
      const backoffTime = Math.min(
        1000 * Math.pow(2, reconnectAttemptsRef.current),
        10000
      );
      appendLog(`Retrying in ${backoffTime / 1000} seconds...`);

      reconnectTimeoutRef.current = setTimeout(attemptReconnect, backoffTime);
    }
  }, []);

  /** ===========================
   *   HEARTBEAT LOGIC
   *  =========================== */

  const startHeartbeat = useCallback(() => {
    appendLog("Starting heartbeat mechanism...");

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
    }

    dispatch({ type: "SET_LAST_AUDIO_TIME", payload: Date.now() });
    dispatch({ type: "SET_LAST_PONG_TIME", payload: Date.now() });

    heartbeatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastAudio = now - (state.lastAudioTime || now);

      if (timeSinceLastAudio > AUDIO_SILENCE_THRESHOLD && state.callActive) {
        appendLog(
          `No audio for ${timeSinceLastAudio}ms, checking connection...`
        );

        if (
          dataChannelRef.current &&
          dataChannelRef.current.readyState === "open"
        ) {
          try {
            dataChannelRef.current.send(
              JSON.stringify({ type: "ping", timestamp: now })
            );
            appendLog("❤️ Heartbeat ping sent");
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            appendLog(`Failed to send heartbeat: ${msg}`);
          }

          const timeSinceLastPong = now - (state.lastPongTime || now);
          if (timeSinceLastPong > HEARTBEAT_TIMEOUT) {
            appendLog(
              `⚠️ No heartbeat response for ${timeSinceLastPong}ms, connection may be dead`
            );
            showNotification(
              "Connection appears to be unresponsive. Attempting to recover...",
              "warning"
            );

            if (
              peerConnectionRef.current &&
              peerConnectionRef.current.connectionState !== "failed"
            ) {
              if (iceRestartAttemptsRef.current < maxIceRestarts) {
                appendLog(
                  "Connection issue detected, will attempt ICE restart"
                );
                iceRestartAttemptsRef.current++;
              } else {
                appendLog(
                  "Too many ICE restart attempts, triggering reconnect"
                );
                attemptReconnect();
              }
            } else {
              attemptReconnect();
            }
          }
        }
      }
    }, HEARTBEAT_INTERVAL);
  }, [
    state.lastAudioTime,
    state.lastPongTime,
    state.callActive,
    showNotification,
    attemptReconnect,
  ]);

  const handlePongReceived = useCallback((timestamp: number) => {
    const latency = Date.now() - timestamp;
    appendLog(`❤️ Heartbeat pong received (latency: ${latency}ms)`);
    dispatch({ type: "SET_LAST_PONG_TIME", payload: Date.now() });

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const stopHeartbeat = useCallback(() => {
    appendLog("Stopping heartbeat mechanism");
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  /** ===========================
   *   ICE RESTART
   *  =========================== */
  const performIceRestart = useCallback(async () => {
    if (
      !peerConnectionRef.current ||
      iceRestartAttemptsRef.current >= maxIceRestarts
    ) {
      appendLog(
        "Cannot perform ICE restart - falling back to full reconnection"
      );
      attemptReconnect();
      return;
    }

    try {
      appendLog(
        `Attempting ICE restart (attempt ${
          iceRestartAttemptsRef.current + 1
        }/${maxIceRestarts})`
      );
      iceRestartAttemptsRef.current++;

      const pc = peerConnectionRef.current;
      if (!pc) return;

      const offer = await pc.createOffer({
        iceRestart: true,
        offerToReceiveAudio: true,
      });
      await pc.setLocalDescription(offer);

      await Promise.race([
        new Promise<void>((resolve, reject) => {
          const checkState = () => {
            if (!peerConnectionRef.current) {
              reject(
                new Error("PeerConnection was closed during ICE gathering")
              );
              return;
            }
            if (peerConnectionRef.current.iceGatheringState === "complete") {
              peerConnectionRef.current.removeEventListener(
                "icegatheringstatechange",
                checkState
              );
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
            appendLog(
              "ICE gathering timed out, continuing with available candidates"
            );
            resolve();
          }, 5000);
        }),
      ]);

      if (!sessionId) {
        throw new Error("No session ID available");
      }

      const rtResp = await api.get<{ client_secret: { value: string } }>(
        `/realtime/token?session_id=${sessionId}`
      );
      const ephemeralKey = rtResp.data.client_secret.value;

      // Use axios for the Realtime call
      let retries = 0;
      const maxRetries = 3;
      let answerSDP = "";

      while (retries < maxRetries) {
        try {
          const response = await axios({
            url: "https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview",
            method: "POST",
            headers: {
              Authorization: `Bearer ${ephemeralKey}`,
              "Content-Type": "application/sdp",
            },
            data: offer.sdp,
            timeout: 10000,
          });
          answerSDP = response.data;
          break;
        } catch (error: any) {
          if (
            error.response &&
            (error.response.status === 429 || error.response.status >= 500) &&
            retries < maxRetries - 1
          ) {
            retries++;
            const backoff = Math.pow(2, retries) * 1000;
            appendLog(
              `API call failed with status ${
                error.response.status
              }. Retrying in ${backoff / 1000}s...`
            );
            await new Promise((r) => setTimeout(r, backoff));
          } else {
            throw error;
          }
        }
      }

      await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });

      appendLog("ICE restart completed successfully");
      iceRestartAttemptsRef.current = 0;
      dispatch({ type: "SET_CONNECTION_STATE", payload: "checking" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      appendLog(`ICE restart failed: ${msg}`);
      const backoffTime = Math.min(
        1000 * Math.pow(2, iceRestartAttemptsRef.current),
        5000
      );

      if (iceRestartAttemptsRef.current < maxIceRestarts) {
        appendLog(`Retrying ICE restart in ${backoffTime / 1000}s...`);
        iceRestartTimeoutRef.current = setTimeout(
          performIceRestart,
          backoffTime
        );
      } else {
        appendLog(
          "Maximum ICE restarts attempted, falling back to full reconnection"
        );
        attemptReconnect();
      }
    }
  }, [api, attemptReconnect, sessionId]);

  /** ===========================
   *   MAIN CONNECTION LOGIC
   *  =========================== */
  async function handleConnect(): Promise<void> {
    if (state.isConnecting) {
      appendLog("Connection already in progress, ignoring duplicate request");
      return;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    dispatch({ type: "SET_CONNECTING", payload: true });
    appendLog("Starting connection process...");

    const jwtToken = localStorage.getItem("token");
    if (!jwtToken) {
      showNotification("Please log in to continue", "error");
      return;
    }
    if (!sessionId) {
      showNotification("Invalid session", "error");
      return;
    }

    try {
      appendLog("Fetching TURN credentials...");
      const turnResp = await api.get<{
        ttl: number;
        iceServers: RTCIceServer[];
      }>("/webrtc/turn-credentials");
      const turnData = turnResp.data;
      appendLog(`Got TURN credentials (TTL: ${turnData.ttl}s)`);

      appendLog("Fetching ephemeral token...");
      const rtResp = await api.get<{ client_secret: { value: string } }>(
        `/realtime/token?session_id=${sessionId}`
      );
      const ephemeralKey = rtResp.data.client_secret.value;
      appendLog("Got ephemeral key: " + ephemeralKey.substring(0, 15) + "...");

      appendLog("Creating RTCPeerConnection...");
      const configuration: RTCConfiguration = {
        iceServers: [
          ...turnData.iceServers,
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
          { urls: "stun:openrelay.metered.ca:80" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
          {
            urls: "turn:openrelay.metered.ca:443?transport=tcp",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
        iceCandidatePoolSize: 10,
        iceTransportPolicy: "all",
        rtcpMuxPolicy: "require",
        bundlePolicy: "max-bundle",
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      appendLog("Creating data channel for heartbeat...");
      try {
        const dataChannel = pc.createDataChannel("heartbeat", {
          ordered: true,
          maxRetransmits: 3,
        });

        dataChannel.onopen = () => {
          appendLog("Heartbeat data channel opened");
          dataChannelRef.current = dataChannel;
          startHeartbeat();
        };

        dataChannel.onclose = () => {
          appendLog("Heartbeat data channel closed");
          dataChannelRef.current = null;
          stopHeartbeat();
        };

        dataChannel.onerror = (error) => {
          appendLog(
            `Heartbeat data channel error: ${
              (error as any)?.message || "Unknown error"
            }`
          );
        };

        dataChannel.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "pong") {
              handlePongReceived(message.timestamp);
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            appendLog(`Error parsing data channel message: ${msg}`);
          }
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        appendLog(`Failed to create data channel: ${msg}`);
      }

      pc.ondatachannel = (event) => {
        appendLog(`Received data channel: ${event.channel.label}`);
        const channel = event.channel;

        if (channel.label === "heartbeat") {
          dataChannelRef.current = channel;

          channel.onopen = () => {
            appendLog("Remote heartbeat data channel opened");
            startHeartbeat();
          };

          channel.onclose = () => {
            appendLog("Remote heartbeat data channel closed");
            dataChannelRef.current = null;
            stopHeartbeat();
          };

          channel.onerror = (error) => {
            appendLog(
              `Remote heartbeat data channel error: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          };

          channel.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              if (message.type === "ping") {
                channel.send(
                  JSON.stringify({
                    type: "pong",
                    timestamp: message.timestamp,
                  })
                );
                appendLog("Responded to ping with pong");
              } else if (message.type === "pong") {
                handlePongReceived(message.timestamp);
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              appendLog(`Error handling data channel message: ${msg}`);
            }
          };
        }
      };

      pc.onconnectionstatechange = () => {
        appendLog(`Connection state changed: ${pc.connectionState}`);
        dispatch({
          type: "SET_CONNECTION_STATE",
          payload: pc.connectionState as ConnectionState,
        });

        if (pc.connectionState === "connected") {
          dispatch({ type: "SET_CALL_ACTIVE", payload: true });
          dispatch({ type: "SET_CONNECTING", payload: false });
          reconnectAttemptsRef.current = 0;

          const startTime = Date.now();
          dispatch({ type: "SET_CALL_START_TIME", payload: startTime });
          durationIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            dispatch({ type: "SET_CALL_DURATION", payload: elapsed });
          }, 1000);

          monitorConnectionQuality(pc);
          iceRestartAttemptsRef.current = 0;
        } else if (pc.connectionState === "disconnected") {
          // Check if we've flagged from the heartbeat that we need an ICE restart
          if (
            iceRestartAttemptsRef.current > 0 &&
            iceRestartAttemptsRef.current <= maxIceRestarts
          ) {
            performIceRestart();
          }
        } else if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          dispatch({ type: "SET_CALL_ACTIVE", payload: false });
          if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
          }
          if (pc.connectionState === "failed") {
            attemptReconnect();
          }
        }
      };

      pc.oniceconnectionstatechange = () => {
        appendLog(`ICE connection state changed: ${pc.iceConnectionState}`);
        if (pc.iceConnectionState === "checking") {
          dispatch({ type: "SET_CONNECTION_STATE", payload: "checking" });
        }
      };

      pc.onicegatheringstatechange = () => {
        appendLog(`ICE gathering state: ${pc.iceGatheringState}`);
      };

      pc.onsignalingstatechange = () => {
        appendLog(`Signaling state: ${pc.signalingState}`);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateInfo = {
            protocol: event.candidate.protocol,
            type: event.candidate.type,
            address: event.candidate.address,
            server: event.candidate.relatedAddress ? "TURN" : "STUN",
            relatedAddress: event.candidate.relatedAddress,
            relatedPort: event.candidate.relatedPort,
            raw: event.candidate.candidate,
          };
          appendLog(`ICE candidate: ${JSON.stringify(candidateInfo, null, 2)}`);
          console.log("ICE Candidate Details:", candidateInfo);
        }
      };

      appendLog("Adding user audio track...");
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        localStreamRef.current = localStream;
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      } catch (mediaError: any) {
        const msg =
          mediaError instanceof Error ? mediaError.message : String(mediaError);
        appendLog(`Media error: ${msg}`);
        throw new Error(`Could not access microphone: ${msg}`);
      }

      pc.ontrack = (evt) => {
        appendLog("🎵 Track received: " + evt.track.kind);
        if (evt.track.kind === "audio") {
          try {
            remoteMediaStreamRef.current = evt.streams[0];

            // Audio playback
            const audioEl = audioRef.current;
            if (audioEl) {
              audioEl.srcObject = evt.streams[0];
              audioEl
                .play()
                .catch((error: any) =>
                  appendLog(`Audio play error: ${error.message}`)
                );
            }

            // Volume detection
            const AudioContextClass =
              window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const source = audioContext.createMediaStreamSource(evt.streams[0]);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const detectAudio = () => {
              if (!state.callActive) {
                return;
              }
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;

              if (average > 10) {
                dispatch({ type: "SET_LAST_AUDIO_TIME", payload: Date.now() });
              }
              requestAnimationFrame(detectAudio);
            };

            detectAudio();

            evt.track.onunmute = () => {
              appendLog("Audio track unmuted");
              dispatch({ type: "SET_LAST_AUDIO_TIME", payload: Date.now() });
            };
          } catch (error: any) {
            const msg = error instanceof Error ? error.message : String(error);
            appendLog(`Audio setup error: ${msg}`);
          }
        }
      };

      appendLog("Local SDP offer created.");
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
      });
      await pc.setLocalDescription(offer);

      const sendInitialOffer = async () => {
        appendLog("Sending initial SDP offer to OpenAI Realtime API...");
        const currentSdp = pc.localDescription?.sdp;
        if (!currentSdp) {
          throw new Error("No local SDP available");
        }

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
          appendLog("Received SDP answer from OpenAI.");
          await pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
          appendLog("Remote SDP set.");
          appendLog("Setup complete - waiting for audio...");
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
          appendLog(`Error sending initial offer: ${errorMessage}`);
          throw new Error(errorMessage);
        }
      };

      setTimeout(() => {
        sendInitialOffer().catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          appendLog(`Failed to send initial offer: ${msg}`);
          showNotification(`Connection error: ${msg}`, "error");
          dispatch({ type: "SET_CONNECTING", payload: false });
        });
      }, 500);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      appendLog(`Connection error: ${msg}`);
      console.error("Connection error:", err);
      showNotification(`Connection error: ${msg}`, "error");
      dispatch({ type: "SET_CONNECTING", payload: false });

      if (reconnectAttemptsRef.current === 0) {
        attemptReconnect();
      }
    }
  }

  /** ===========================
   *   END CALL
   *  =========================== */
  const handleEndCall = useCallback(() => {
    appendLog("Ending call - cleaning up resources...");

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (iceRestartTimeoutRef.current) {
      clearTimeout(iceRestartTimeoutRef.current);
      iceRestartTimeoutRef.current = null;
    }
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
      notificationTimeoutRef.current = null;
    }

    if (peerConnectionRef.current) {
      const pc = peerConnectionRef.current;
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.oniceconnectionstatechange = null;
      pc.onicegatheringstatechange = null;
      pc.onsignalingstatechange = null;
      pc.onconnectionstatechange = null;

      // Close all data channels safely
      try {
        // Cast to any to avoid TypeScript errors with non-standard methods
        const dataChannels = (pc as any).getDataChannels?.();
        if (dataChannels && Array.isArray(dataChannels)) {
          dataChannels.forEach((channel: RTCDataChannel) => channel.close());
        } else if (dataChannelRef.current) {
          dataChannelRef.current.close();
        }
      } catch (error) {
        // Silently handle if browser doesn't support getDataChannels
      }

      pc.close();
      peerConnectionRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.load();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      localStreamRef.current = null;
    }

    if (remoteMediaStreamRef.current) {
      remoteMediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      remoteMediaStreamRef.current = new MediaStream();
    }

    dispatch({ type: "SET_CONNECTION_STATE", payload: "closed" });
    dispatch({ type: "SET_CALL_ACTIVE", payload: false });
    dispatch({ type: "SET_CONNECTING", payload: false });
    dispatch({ type: "SET_NETWORK_QUALITY", payload: "unknown" });
    dispatch({ type: "SET_MUTED", payload: false });

    const finalDuration = state.callStartTime
      ? Math.floor((Date.now() - state.callStartTime) / 1000)
      : 0;
    const minutes = Math.floor(finalDuration / 60);
    const seconds = finalDuration % 60;
    const formattedDuration = `${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    appendLog("Call ended - all resources cleaned up");

    navigate("/summary", {
      state: {
        duration: formattedDuration,
      },
    });

    stopHeartbeat();

    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
  }, [navigate, state.callStartTime, stopHeartbeat]);

  /** ===========================
   *   MUTE TOGGLE
   *  =========================== */
  const handleMuteToggle = useCallback(() => {
    if (!localStreamRef.current) return;
    const newMuteState = !state.isMuted;
    dispatch({ type: "SET_MUTED", payload: newMuteState });

    localStreamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = !newMuteState));

    appendLog(`Microphone ${newMuteState ? "muted" : "unmuted"}`);
  }, [state.isMuted]);

  /** ===========================
   *   TRANSCRIPT HANDLER
   *  =========================== */
  const handleTranscriptReceived = useCallback(
    (transcript: Transcript) => {
      dispatch({
        type: "ADD_TRANSCRIPT",
        payload: transcript,
      });
    },
    [dispatch]
  );

  /** ===========================
   *   RENDER
   *  =========================== */
  return (
    <div className={styles.container}>
      {/* Notification */}
      {state.notification.show && (
        <div
          className={`${styles.notification} ${
            styles[state.notification.type]
          }`}
        >
          <div className={styles.notificationContent}>
            {state.notification.message}
          </div>
          <button
            className={styles.notificationClose}
            onClick={() =>
              dispatch({
                type: "SET_NOTIFICATION",
                payload: { ...state.notification, show: false },
              })
            }
          >
            ×
          </button>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} id="aiAudio" autoPlay style={{ display: "none" }} />

      {/* Connection status indicator */}
      <div className={styles.connectionIndicator}>
        <div
          className={styles.statusDot}
          style={{
            backgroundColor: getConnectionStateColor(state.connectionState),
          }}
        ></div>
        <span className={styles.statusText}>
          {getConnectionStatusText(state.connectionState)}
        </span>
      </div>

      {/* Call header */}
      <div className={styles.callHeader}>
        <div className={styles.callTitle}>{callInfo.title}</div>
      </div>

      {/* Audio visualizer */}
      <div className={styles.visualizerContainer}>
        <AudioVisualizer
          mediaStream={remoteMediaStreamRef.current}
          isLoading={state.isConnecting}
        />
      </div>

      {/* Call controls */}
      <div className={styles.controlsContainer}>
        <button
          className={`${styles.controlButton} ${styles.micButton} ${
            state.isMuted ? styles.muted : ""
          }`}
          onClick={handleMuteToggle}
        >
          <img src="/assets/mute.svg" alt="Mute" />
        </button>
        <button className={`${styles.controlButton} ${styles.optionsButton}`}>
          <img src="/assets/dots.svg" alt="Options" />
        </button>
        <button
          className={`${styles.controlButton} ${styles.endCallButton}`}
          onClick={handleEndCall}
        >
          <img src="/assets/x.svg" alt="End Call" />
        </button>
      </div>

      {/* Transcription */}
      <Transcription
        transcripts={state.transcripts}
        remoteMediaStream={remoteMediaStreamRef.current}
        localStream={localStreamRef.current}
        isCallActive={state.callActive}
        onTranscriptReceived={handleTranscriptReceived}
      />

      {/* Footer */}
      <footer className={styles.footer}>
        <a href="mailto:mattporteous44@gmail.com">Need help?</a>
        <a
          href="https://www.use-reach.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          About Reach
        </a>
      </footer>
    </div>
  );
};

export default RealtimeConnect;
