import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import AudioVisualizer from "../components/call/AudioVisualizer";
import styles from "../styles/RealtimeConnect.module.css";

// Types for the demo component
interface TranscriptItem {
  speaker: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const RealtimeConnectDemo: React.FC = () => {
  const navigate = useNavigate();

  // Demo state
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(90);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      speaker: 'ai',
      text: 'Hello! I\'m your AI interviewer. I\'ll be asking you some case study questions today. Are you ready to begin?',
      timestamp: new Date().toISOString(),
    },
    {
      speaker: 'user',
      text: 'Yes, I\'m ready to start the interview.',
      timestamp: new Date().toISOString(),
    },
    {
      speaker: 'ai',
      text: 'Great! Let\'s start with a market sizing question. How would you estimate the total addressable market for electric vehicles in the United States?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Set up user's media (microphone and camera) - simplified for demo
  const setupUserMedia = async () => {
    try {
      setIsMicrophoneActive(true);
      
      let stream: MediaStream | null = null;
      
      try {
        // Try to get video + audio first
        console.log('Requesting video + audio permissions...');
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
        console.log('Got video + audio stream:', stream);
      } catch (videoError) {
        console.log('Video + audio failed, trying audio only:', videoError);
        // Fallback to audio only
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          });
          console.log('Got audio-only stream:', stream);
        } catch (audioError) {
          console.error('Audio-only also failed:', audioError);
          throw audioError;
        }
      }

      if (stream) {
        console.log('Setting user stream. Video tracks:', stream.getVideoTracks().length, 'Audio tracks:', stream.getAudioTracks().length);
        setUserStream(stream);
        
        // Connect video to video element if we have video tracks
        if (userVideoRef.current && stream.getVideoTracks().length > 0) {
          console.log('Connecting stream to video element');
          userVideoRef.current.srcObject = stream;
          
          // Ensure video plays
          userVideoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            if (userVideoRef.current) {
              userVideoRef.current.play().catch(e => console.error('Video play failed:', e));
            }
          };
        }
        
        // Set up audio analyzer for volume detection
        setupAudioAnalyzer(stream);
      }
    } catch (error) {
      console.error('setupUserMedia failed:', error);
      setIsMicrophoneActive(false);
      // Don't show error in demo mode, just continue without media
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

  // Set up user media immediately when component mounts
  useEffect(() => {
    console.log('🎥 RealtimeConnectDemo mounted, setting up media...');
    setupUserMedia();
  }, []);

  // Log userStream changes
  useEffect(() => {
    console.log('🎥 userStream changed:', {
      hasStream: !!userStream,
      videoTracks: userStream?.getVideoTracks().length || 0,
      audioTracks: userStream?.getAudioTracks().length || 0,
      videoTrackState: userStream?.getVideoTracks()[0]?.readyState,
      videoTrackEnabled: userStream?.getVideoTracks()[0]?.enabled
    });
    
    if (userStream && userVideoRef.current) {
      console.log('🎥 Video ref exists, connecting stream...');
      userVideoRef.current.srcObject = userStream;
      
      // Add comprehensive video element event listeners
      const videoElement = userVideoRef.current;
      
      videoElement.onloadstart = () => console.log('🎥 Video loadstart event');
      videoElement.onloadeddata = () => console.log('🎥 Video loadeddata event');
      videoElement.onloadedmetadata = () => {
        console.log('🎥 Video metadata loaded:', {
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          duration: videoElement.duration,
          readyState: videoElement.readyState
        });
        videoElement.play().catch(e => console.error('🎥 Video play failed:', e));
      };
      videoElement.oncanplay = () => console.log('🎥 Video can play');
      videoElement.onplaying = () => console.log('🎥 Video is playing');
      videoElement.onerror = (e) => console.error('🎥 Video error:', e);
      videoElement.onstalled = () => console.log('🎥 Video stalled');
      videoElement.onwaiting = () => console.log('🎥 Video waiting');
    }
  }, [userStream]);

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
          if (!isAISpeaking) {
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
      console.error('Audio analyzer setup failed:', error);
    }
  };

  // Start demo timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          cleanupUserMedia();
          setError('Demo session time limit reached.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // Demo: Simulate AI speaking periodically
  useEffect(() => {
    const aiSpeakingInterval = setInterval(() => {
      setIsAISpeaking(prev => !prev);
    }, 3000); // Toggle every 3 seconds

    return () => clearInterval(aiSpeakingInterval);
  }, []);

  // Manual end session
  const handleEndSession = useCallback(async () => {
    cleanupUserMedia();
    navigate('/interviews');
  }, [navigate]);

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

  // Error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>Demo Session Ended</h2>
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

  // Main interview interface
  return (
    <div className={styles.container}>
      {/* Branding pill */}
      <div className={styles.brandingPill}>
        CasePrepared AI (Demo)
      </div>

      {/* Demo timer */}
      <div className={styles.demoTimer}>
        Demo Time: {formatTime(timeRemaining)}
      </div>

      {/* Main content - Audio Visualizer */}
      <div className={styles.mainContent}>
        <AudioVisualizer 
          isConnected={isConnected}
          isSpeaking={isAISpeaking}
          volume={isAISpeaking ? 0.8 : userVolume}
          status="connected"
        />
      </div>

      {/* User video in bottom right */}
      <div className={styles.userVideoContainer}>
        {(() => {
          console.log('🎥 Rendering video container. Current state:', {
            hasUserStream: !!userStream,
            videoTracksCount: userStream?.getVideoTracks().length || 0,
            userVideoRefExists: !!userVideoRef.current,
            videoTrackEnabled: userStream?.getVideoTracks()[0]?.enabled,
            videoTrackReadyState: userStream?.getVideoTracks()[0]?.readyState
          });
          
          if (userStream && userStream.getVideoTracks().length > 0) {
            console.log('🎥 Rendering video element');
            return (
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className={styles.userVideo}
                onLoadedMetadata={() => console.log('🎥 Video element metadata loaded')}
                onPlay={() => console.log('🎥 Video element playing')}
                onError={(e) => console.error('🎥 Video element error:', e)}
              />
            );
          } else {
            console.log('🎥 Rendering camera disabled placeholder');
            return (
              <div className={styles.cameraDisabled}>
                <p>Camera not available</p>
              </div>
            );
          }
        })()}
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
          <span>Live Conversation (Demo)</span>
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
    </div>
  );
};

export default RealtimeConnectDemo; 