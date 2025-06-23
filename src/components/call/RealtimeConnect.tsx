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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [metrics, setMetrics] = useState<SessionMetrics>({
    startTime: Date.now(),
    duration: 0,
  });

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const conversationDataRef = useRef<any[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Initialize ElevenLabs conversation
  const conversation = useConversation({
    onConnect: () => {
      console.log('🔗 Connected to ElevenLabs');
      setIsSessionActive(true);
      
      // Set up session timer
      const ttl = session.ttl_seconds || (interview.demo ? 120 : 3600);
      setTimeRemaining(ttl);
      startSessionTimer(ttl);
    },
    onDisconnect: () => {
      console.log('📞 Disconnected from ElevenLabs');
      setIsSessionActive(false);
      handleSessionComplete();
    },
    onMessage: (message: any) => {
      console.log('💬 Message received:', message);
      
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
      console.error('❌ Conversation error:', error);
      setError(`Connection error: ${error}`);
    }
  });

  // Set up user's video display
  useEffect(() => {
    const setupUserVideo = async () => {
      try {
        // Request microphone access first (required)
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
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
          console.log('📹 Video not available, using audio only');
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
        }
      } catch (error) {
        console.error('❌ Failed to setup media:', error);
        setError('Microphone access required. Please allow permissions and refresh.');
      }
    };

    setupUserVideo();

    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start conversation when component mounts
  useEffect(() => {
    if (!ws_url || !interview || !session) {
      setError('Missing session data. Please start the interview again.');
      return;
    }

    const startConversation = async () => {
      try {
        console.log('🚀 Starting conversation with signed URL');
        // Use signedUrl for pre-authenticated WebSocket connections
        const id = await conversation.startSession({ signedUrl: ws_url });
        setConversationId(id);
        console.log('✅ Conversation started with ID:', id);
      } catch (error) {
        console.error('❌ Failed to start conversation:', error);
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
        console.log('✅ Session completed and saved in background');
      }
    } catch (error) {
      console.error('❌ Failed to complete session in background:', error);
      // Don't redirect on error since user is already on analytics page
    }
  };

  // Manual end session
  const handleEndSession = useCallback(async () => {
    try {
      await conversation.endSession();
      handleSessionComplete();
    } catch (error) {
      console.error('❌ Error ending session:', error);
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
          volume={conversation.isSpeaking ? 0.8 : 0}
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
          <p>Time: {formatTime(timeRemaining)}</p>
          <p>Session ID: {conversationId}</p>
          <p>Transcripts: {transcripts.length}</p>
        </div>
      )}
    </div>
  );
};

export default RealtimeConnect;