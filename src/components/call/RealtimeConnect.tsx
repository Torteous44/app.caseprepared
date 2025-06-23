import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useConversation } from "@elevenlabs/react";
import { useAuth } from "../../contexts/AuthContext";
import { completeInterviewSession } from "../../utils/interviewService";
import LoadingSpinner from "../common/LoadingSpinner";
import AudioVisualizer from "./AudioVisualizer";
import styles from "../../styles/RealtimeConnect.module.css";

// Types for the component
interface LocationState {
  interview?: any;
  session?: any;
  ws_url?: string;
  elevenlabs_agent_id?: string;
}

interface SessionMetrics {
  startTime: number;
  duration: number;
  conversationId?: string;
}

interface TranscriptItem {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const RealtimeConnect: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Extract session data from navigation state
  const {
    interview,
    session,
    ws_url,
    elevenlabs_agent_id
  } = (location.state as LocationState) || {};

  // Component state
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [metrics, setMetrics] = useState<SessionMetrics>({
    startTime: Date.now(),
    duration: 0,
  });

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationDataRef = useRef<any[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: async () => {
      setIsSessionActive(true);
      
      // Request microphone access only when session starts
      await setupUserMedia();
      
      // Set up session timer
      const ttl = session.ttl_seconds || (interview.demo ? 90 : 3600);
      setTimeRemaining(ttl);
      startSessionTimer(ttl);
    },
    onDisconnect: () => {
      setIsSessionActive(false);
      // Clean up microphone access immediately when session ends
      cleanupUserMedia();
      handleSessionComplete();
    },
    onMessage: (message: any) => {
      
      // Process message for transcription - only if it's actual content
      let messageText = '';
      let speaker: 'user' | 'ai' = 'ai';
      
      if (typeof message === 'string') {
        messageText = message;
        speaker = 'ai'; // Default to AI for string messages
      } else if (message && typeof message === 'object') {
        messageText = message.message || '';
        // Map the source to our speaker types
        speaker = message.source === 'user' ? 'user' : 'ai';
      }
      
      if (messageText && messageText.trim()) {
        const transcriptItem: TranscriptItem = {
          speaker: speaker,
          text: messageText.trim(),
          timestamp: new Date().toISOString(),
        };
        
        setTranscripts(prev => {
          const newTranscripts = [...prev, transcriptItem];
          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            if (transcriptRef.current) {
              transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
            }
          }, 100);
          return newTranscripts;
        });
        
        conversationDataRef.current.push({
          role: speaker === 'ai' ? 'assistant' : 'user',
          message: messageText.trim(),
          timestamp: new Date().toISOString(),
        });
      }
    },
    onError: (error) => { 
      setError(`Connection error: ${error}`);
    }
  });

  // Set up user's media (microphone and camera)
  const setupUserMedia = async () => {
    try {
      setIsMicrophoneActive(true);
      
      let stream: MediaStream | null = null;
      
      try {
        // Try to get video + audio
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
      } catch (videoError) {
        // Fallback to audio only
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
      }

      if (stream) {
        setUserStream(stream);
        if (userVideoRef.current && stream.getVideoTracks().length > 0) {
          userVideoRef.current.srcObject = stream;
        }
        
        // Set up audio analyzer for volume detection
        setupAudioAnalyzer(stream);
      }
    } catch (error) {
      setIsMicrophoneActive(false);
      setError('Microphone access required. Please allow permissions and refresh.');
    }
  };

  // Clean up user's media access
  const cleanupUserMedia = () => {
    
    try {
      if (userStream) {
        userStream.getTracks().forEach(track => {
          if (track.readyState !== 'ended') {
            track.stop();
          }
        });
        setUserStream(null);
      }
      
      // Clean up audio analyzer
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      // Reset video ref
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = null;
      }
      
      // Reset volume and state
      setUserVolume(0);
      setIsMicrophoneActive(false);
    } catch (error) {
      // Force state reset even if cleanup fails
      setUserStream(null);
      setUserVolume(0);
      setIsMicrophoneActive(false);
    }
  };

  // Component cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupUserMedia();
    };
  }, []);

  // Additional cleanup on page visibility change or beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isMicrophoneActive) {
        cleanupUserMedia();
      }
    };

    const handleBeforeUnload = () => {
      if (isMicrophoneActive) {
        cleanupUserMedia();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isMicrophoneActive]);
  
  // Set up audio analyzer for volume detection
  const setupAudioAnalyzer = (stream: MediaStream) => {
    try {
      // Create audio context and analyzer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Start analyzing audio levels
      const analyzeAudio = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          
          // Normalize to 0-1 range and apply better scaling for responsiveness
          const normalizedVolume = Math.min(average / 128, 1);
          
          // Apply noise gate - ignore very low volumes that are likely background noise
          const noiseGate = 0.05;
          const volumeAboveNoise = normalizedVolume > noiseGate ? normalizedVolume : 0;
          
          // More sensitive scaling - amplify quieter sounds more
          const sensitivityBoost = Math.pow(volumeAboveNoise, 0.6) * 2.0;
          const scaledVolume = Math.max(Math.min(sensitivityBoost, 1), 0);
          
          // Only update if not AI speaking
          if (!conversation.isSpeaking) {
            setUserVolume(scaledVolume);
          } else {
            // When AI is speaking, set user volume to 0
            setUserVolume(0);
          }
          
          animationFrameRef.current = requestAnimationFrame(analyzeAudio);
        }
      };

      analyzeAudio();
    } catch (error) {
    }
  };

  // Start conversation when component mounts
  useEffect(() => {
    if (!ws_url || !interview || !session) {
      setError('Missing session data. Please start the interview again.');
      return;
    }

    const startConversation = async () => {
      try {
        // Use signedUrl for pre-authenticated WebSocket connections
        const id = await conversation.startSession({ signedUrl: ws_url });
        setConversationId(id);
      } catch (error) {

        setError('Failed to connect to interview. Please try again.');
      }
    };

    startConversation();

    return () => {
      if (conversation.status === 'connected') {
        conversation.endSession();
      }
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [ws_url, interview, session]);

  // Session timer management
  const startSessionTimer = (duration: number) => {
    sessionTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          cleanupUserMedia(); // Ensure cleanup on timeout
          setError('Session time limit reached.');
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Complete the interview session
  const handleSessionComplete = async () => {
    if (metrics.duration > 0) return; // Already completed
    
    const duration = Math.floor((Date.now() - metrics.startTime) / 1000);
    const updatedMetrics = { ...metrics, duration };
    setMetrics(updatedMetrics);

    // IMPORTANT: Clean up microphone access immediately before navigation
    cleanupUserMedia();

    // Navigate immediately to post-interview screen
    navigate(`/interview/analytics/${interview?.id}`, {
      state: {
        interview,
        session,
        metrics: updatedMetrics,
        transcript: conversationDataRef.current,
        transcripts: transcripts,
        conversationId: conversationId || sessionId,
      }
    });

    // Complete session in background
    try {
      const completionData = {
        transcript: {
          conversation: conversationDataRef.current,
          transcripts: transcripts,
          summary: 'Interview session completed',
        },
        duration_seconds: duration,
        conversation_id: conversationId || sessionId,
      };

      if (interview?.id) {
        await completeInterviewSession(interview.id, completionData);
      }
    } catch (error) { 
    }
  };

  // Manual end session
  const handleEndSession = useCallback(async () => {
    try {
      await conversation.endSession();
      // Cleanup will be handled by onDisconnect callback
      handleSessionComplete();
    } catch (error) {
      // Ensure cleanup even if session end fails
      cleanupUserMedia();
      handleSessionComplete();
    }
  }, [conversation]);

  // Toggle transcript panel
  const toggleTranscript = useCallback(() => {
    setIsTranscriptOpen(prev => !prev);
  }, []);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (conversation.status === 'disconnected' && !error && !isSessionActive) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <h2>Connecting to Interview...</h2>
          <p>Setting up your AI interview session</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate('/interviews')}
            className={styles.returnButton}
          >
            Return to Interviews
          </button>
        </div>
      </div>
    );
  }

  // Skip completion state - navigate immediately

  // Main interview interface
  return (
    <div className={styles.container}>
      {/* Main content - Audio Visualizer */}
      <div className={styles.mainContent}>
        <AudioVisualizer 
          isConnected={conversation.status === 'connected'}
          isSpeaking={conversation.isSpeaking}
          volume={conversation.isSpeaking ? 0.8 : userVolume}
          status={conversation.status}
        />
      </div>

      {/* User video in bottom right */}
      <div className={styles.userVideoContainer}>
        {userStream && userStream.getVideoTracks().length > 0 ? (
          <video
            ref={userVideoRef}
            autoPlay
            playsInline
            muted
            className={styles.userVideo}
          />
        ) : (
          <div className={styles.cameraDisabled}>
            <p>Camera not available</p>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className={styles.bottomControls}>
        <button
          onClick={toggleTranscript}
          className={`${styles.controlButton} ${styles.transcriptButton}`}
          title="Toggle Transcript"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75H12a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={handleEndSession}
          className={`${styles.controlButton} ${styles.endCall}`}
          title="End Call"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Transcription panel */}
      <div className={`${styles.transcriptionPanel} ${isTranscriptOpen ? styles.open : ''}`}>
        <div className={styles.transcriptionHeader}>
          <span>Live Conversation</span>
          <button 
            onClick={toggleTranscript}
            className={styles.closeTranscript}
            title="Close transcript"
          >
            ×
          </button>
        </div>
        <div className={styles.transcriptionContent} ref={transcriptRef}>
          {transcripts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Conversation will appear here...</p>
            </div>
          ) : (
            <div className={styles.messagesContainer}>
              {transcripts.map((item, index) => (
                <div key={index} className={`${styles.message} ${styles[item.speaker]}`}>
                  <div className={styles.messageText}>{item.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className={styles.debugInfo}>
          <p>Status: {conversation.status}</p>
          <p>Speaking: {conversation.isSpeaking ? 'Yes' : 'No'}</p>
          <p>User Volume: {userVolume.toFixed(2)}</p>
          <p>User Speaking: {userVolume > 0.1 ? 'Yes' : 'No'}</p>
          <p>Microphone: {isMicrophoneActive ? 'Active' : 'Inactive'}</p>
          <p>Time: {formatTime(timeRemaining)}</p>
          <p>Session ID: {conversationId}</p>
          <p>Transcripts: {transcripts.length}</p>
        </div>
      )}
    </div>
  );
};

export default RealtimeConnect;