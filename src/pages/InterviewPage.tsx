import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/InterviewPage.module.css";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { fetchInterview, createInterviewSession, Interview, InterviewSession } from "../utils/interviewService";
import { DEMO_INTERVIEWS, DemoInterview } from "../data/demo";

// Dictionary of case type descriptions
const CASE_TYPE_DESCRIPTIONS: Record<string, string> = {
  Profitability: "Analyze the profitability of a business or product",
  "Revenue Growth": "Identify strategies to grow revenue for a company",
  "Market Entry": "Evaluate opportunities to enter a new market",
  "Market Sizing": "Quantify opportunity in a target market",
  Comparison: "Compare options and recommend the best solution",
};

// Default description if case type is not found in dictionary
const DEFAULT_CASE_DESCRIPTION = "Analyze business problem and recommend solution";

interface CaseSection {
  heading: string;
  content: string;
  subContent?: string;
  listItems?: string[];
  additionalContent?: string;
}

interface CaseContent {
  sections: CaseSection[];
}

const InterviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Video configuration - easily adjustable
  const VIDEO_ASPECT_RATIO = '16/9'; // Change this to adjust aspect ratio (e.g., '4/3', '16/9', '1/1')
  const VIDEO_MIRRORED = true; // Set to false to disable mirroring

  const [interview, setInterview] = useState<Interview | null>(null);
  const [caseContent, setCaseContent] = useState<CaseContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [preCreatedSession, setPreCreatedSession] = useState<InterviewSession | null>(null);
  const [sessionPreloadError, setSessionPreloadError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStatus, setMediaStatus] = useState<{
    video: boolean;
    audio: boolean;
    error?: string;
  }>({
    video: false,
    audio: false,
  });
  const localStreamRef = useRef<MediaStream | null>(null);
  
  // Device information state
  const [deviceInfo, setDeviceInfo] = useState<{
    audioOutput: string;
    audioInput: string;
    videoInput: string;
  }>({
    audioOutput: "Default",
    audioInput: "Default", 
    videoInput: "Default"
  });

  // Helper function to check if pre-created session is still valid
  const isSessionValid = (session: InterviewSession): boolean => {
    if (!session) return false;
    
    const sessionStartTime = new Date(session.started_at).getTime();
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - sessionStartTime) / 1000;
    
    // Session is valid if it hasn't exceeded its TTL
    return elapsedSeconds < session.ttl_seconds;
  };

  // Fetch interview data
  useEffect(() => {
    const fetchInterviewData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error("No interview ID provided");
        }

        // Check if this is a demo interview first (for faster loading)
        const demoInterview = DEMO_INTERVIEWS.find(demo => demo.id === id);
        
        if (demoInterview) {
          // Use hardcoded demo data to avoid API call
          const interviewData: Interview = {
            id: demoInterview.id,
            title: demoInterview.title,
            difficulty: demoInterview.difficulty,
            company: demoInterview.company,
            short_description: demoInterview.short_description,
            long_description: demoInterview.long_description,
            image_url: demoInterview.image_url,
            elevenlabs_agent_id: demoInterview.elevenlabs_agent_id,
            demo: true,
            is_active: true,
            created_at: demoInterview.created_at,
            updated_at: demoInterview.updated_at
          };

          setInterview(interviewData);

          // Create case content from demo data
          const generatedContent: CaseContent = {
            sections: [
              {
                heading: "Case Overview",
                content: demoInterview.long_description || demoInterview.short_description || "",
              },
            ],
          };

          setCaseContent(generatedContent);

          // Pre-create session for demo interviews only
          createInterviewSession(demoInterview.id, true)
            .then(session => {
              setPreCreatedSession(session);
              setSessionPreloadError(null);
            })
            .catch(error => {
              setSessionPreloadError(error.message);
              setPreCreatedSession(null);
            });
        } else {
          // Fetch from API for premium interviews
          const interviewData = await fetchInterview(id);
          setInterview(interviewData);

          // Create case content from interview data
          const generatedContent: CaseContent = {
            sections: [
              {
                heading: "Case Overview",
                content:
                  interviewData.long_description ||
                  interviewData.short_description ||
                  "",
              },
            ],
          };

          setCaseContent(generatedContent);
        }
      } catch (err) {
        console.error("Error fetching interview data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    // For demo interviews, no authentication required
    const demoInterview = DEMO_INTERVIEWS.find(demo => demo.id === id);
    
    if (demoInterview) {
      fetchInterviewData();
    } else if (isAuthenticated) {
      // Only proceed with API calls for premium interviews if authenticated
      fetchInterviewData();
    } else if (isAuthenticated === false) {
      // If auth is done loading and we're not authenticated, show error for premium interviews
      setError("Authentication required to view this interview");
      setIsLoading(false);
    }
    // If isAuthenticated is still undefined (loading), we'll wait
  }, [id, isAuthenticated, navigate]);

  // Media setup function - called when user clicks to enable media
  const setupMedia = async () => {
    try {
      console.log('📹 InterviewPage: Starting media setup...');
      setMediaStatus({ video: false, audio: false }); // Reset status
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser doesn't support camera/microphone access");
      }

      let stream: MediaStream | null = null;
      let hasVideo = false;
      let hasAudio = false;

      // First, try to get both video and audio
      try {
        console.log('📹 Requesting video + audio permissions...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        hasVideo = true;
        hasAudio = true;
        console.log('📹 Got video + audio stream:', {
          stream,
          videoTracks: stream.getVideoTracks().length,
          audioTracks: stream.getAudioTracks().length
        });
        
        // Log video track details
        stream.getVideoTracks().forEach((track, index) => {
          console.log(`📹 Video track ${index}:`, {
            id: track.id,
            label: track.label,
            readyState: track.readyState,
            enabled: track.enabled,
            muted: track.muted,
            settings: track.getSettings()
          });
        });
      } catch (videoError) {
        console.log('📹 Video + audio failed, trying audio only:', videoError);
        
        // If video fails, try audio only
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          hasVideo = false;
          hasAudio = true;
          console.log('📹 Got audio-only stream:', stream);
        } catch (audioError) {
          console.error('📹 Audio-only also failed:', audioError);
          throw audioError; // Re-throw the audio error since that's the minimum requirement
        }
      }

      if (!stream) {
        throw new Error("Could not access any media devices");
      }

      // Save the stream to the ref
      localStreamRef.current = stream;
      console.log('📹 Saved stream to localStreamRef');

      // We'll connect the stream to the video element in a separate useEffect
      // after the component re-renders with the video element

      // Update status to indicate what we successfully got
      setMediaStatus({ video: hasVideo, audio: hasAudio });
      console.log('📹 Updated media status:', { video: hasVideo, audio: hasAudio });
    } catch (err) {
      console.error("📹 Error accessing media devices:", err);
      let errorMessage = "Could not access microphone.";
      
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage = "Microphone access denied. Please allow permissions and try again.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        } else if (err.name === "NotSupportedError") {
          errorMessage = "Your browser doesn't support microphone access.";
        } else if (err.name === "SecurityError") {
          errorMessage = "Microphone access blocked for security reasons. Please use HTTPS.";
        } else {
          errorMessage = err.message;
        }
      }
      
      setMediaStatus({
        video: false,
        audio: false,
        error: errorMessage,
      });
    }
  };

  // Connect video stream to video element when both are available
  useEffect(() => {
    const connectVideoStream = () => {
      console.log('📹 InterviewPage: Attempting to connect video stream:', {
        hasVideoRef: !!videoRef.current,
        hasVideoStatus: mediaStatus.video,
        hasLocalStream: !!localStreamRef.current,
        videoTracks: localStreamRef.current?.getVideoTracks().length || 0,
        videoTrackState: localStreamRef.current?.getVideoTracks()[0]?.readyState,
        videoTrackEnabled: localStreamRef.current?.getVideoTracks()[0]?.enabled
      });

      if (videoRef.current && mediaStatus.video && localStreamRef.current) {
        const stream = localStreamRef.current;
        
        console.log('📹 Connecting stream to video element:', stream);
        videoRef.current.srcObject = stream;
        
        // Set video properties for better rendering
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log('📹 Video metadata loaded:', {
              videoWidth: videoRef.current.videoWidth,
              videoHeight: videoRef.current.videoHeight,
              readyState: videoRef.current.readyState
            });
          }
        };
        
        // Add error event listener
        videoRef.current.onerror = (e) => {
          console.error("📹 Video element error:", e);
        };
        
        // Add additional event listeners for debugging
        videoRef.current.oncanplay = () => {
          console.log('📹 Video can play');
        };
        
        videoRef.current.onplaying = () => {
          console.log('📹 Video is playing');
        };

        videoRef.current.onloadstart = () => {
          console.log('📹 Video load started');
        };

        videoRef.current.onloadeddata = () => {
          console.log('📹 Video data loaded');
        };
        
        // Also try to play immediately if metadata is already loaded
        if (videoRef.current.readyState >= 1) {
          console.log('📹 Video metadata already loaded, attempting to play');
          videoRef.current.play().then(() => {
            console.log('📹 Video playing successfully');
          }).catch((e) => {
            console.error('📹 Video play failed:', e);
          });
        }
        
        return true; // Successfully connected
      } else {
        console.log('📹 Cannot connect video stream - missing requirements:', {
          hasVideoRef: !!videoRef.current,
          hasVideoStatus: mediaStatus.video,
          hasLocalStream: !!localStreamRef.current
        });
        
        return false; // Failed to connect
      }
    };

    // Only try to connect if we have both media status and stream
    if (mediaStatus.video && localStreamRef.current) {
      // Use a retry mechanism to wait for the video element
      let retryCount = 0;
      const maxRetries = 10;
      const retryInterval = 100;
      
      const tryConnect = () => {
        const success = connectVideoStream();
        
        if (!success && retryCount < maxRetries) {
          retryCount++;
          console.log(`📹 Retry ${retryCount}/${maxRetries} in ${retryInterval}ms...`);
          setTimeout(tryConnect, retryInterval);
        } else if (!success) {
          console.error('📹 Failed to connect video after all retries');
        }
      };
      
      // Start with a small delay to allow React to render the video element
      setTimeout(tryConnect, 50);
    }
  }, [mediaStatus.video, localStreamRef.current]); // Run when video status changes or stream is set

  // Get device information
  const getDeviceInfo = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const audioOutput = devices.find(device => device.kind === 'audiooutput')?.label || "Default Speaker";
      const audioInput = devices.find(device => device.kind === 'audioinput')?.label || "Default Microphone";
      const videoInput = devices.find(device => device.kind === 'videoinput')?.label || "Default Camera";
      
      setDeviceInfo({
        audioOutput: audioOutput.replace(/\s*\([^)]*\)$/, ''), // Remove device IDs in parentheses
        audioInput: audioInput.replace(/\s*\([^)]*\)$/, ''),
        videoInput: videoInput.replace(/\s*\([^)]*\)$/, '')
      });
    } catch (err) {
      console.log("Could not enumerate devices:", err);
    }
  };

  // Check media permissions on component mount
  useEffect(() => {
    const checkMediaSupport = async () => {
      try {
        console.log('📹 InterviewPage: Checking media support on mount...');
        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.log('📹 getUserMedia not supported');
          setMediaStatus({
            video: false,
            audio: false,
            error: "Your browser doesn't support camera/microphone access",
          });
          return;
        }

        // Check if we already have permissions and auto-setup if granted
        if (navigator.permissions) {
          try {
            console.log('📹 Checking existing permissions...');
            const videoPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            const audioPermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            
            console.log('📹 Permission states:', {
              video: videoPermission.state,
              audio: audioPermission.state
            });
            
            if (videoPermission.state === 'granted' && audioPermission.state === 'granted') {
              // If we already have permissions, set up media automatically
              console.log('📹 Permissions already granted, setting up media automatically');
              await setupMedia();
            }
            
            // Get device info regardless of permissions
            await getDeviceInfo();
          } catch (permErr) {
            // Permissions API might not be fully supported, that's okay
            console.log("📹 Permissions API query failed:", permErr);
          }
        }
      } catch (err) {
        console.log("📹 Permissions API not supported or failed:", err);
        // This is fine, we'll request permissions when user clicks
        await getDeviceInfo(); // Still try to get device info
      }
    };

    checkMediaSupport();

    // Clean up function
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartInterview = async () => {
    if (!interview) {
      setStartError("Interview data is missing.");
      return;
    }

    setStartError(null);
    setIsStarting(true);

    try {
      // Stop only the audio tracks of the local stream to release the mic
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => track.stop());
      }

      let session: InterviewSession;

      // Check if we have a valid pre-created session for demo interviews
      if (interview.demo && preCreatedSession && isSessionValid(preCreatedSession)) {
        
        session = preCreatedSession;
      } else {
        // Create new session (fallback for demo or normal flow for premium)
        if (interview.demo && preCreatedSession && !isSessionValid(preCreatedSession)) {
          
        } else if (interview.demo) {
          
        }
        
        session = await createInterviewSession(interview.id, interview.demo);
      }
      
      // Navigate to the interview session with Eleven Labs integration
      navigate(`/interview/session/${session.progress_id}`, {
        state: {
          interview: interview,
          session: session,
          ws_url: session.ws_url,
          elevenlabs_agent_id: session.elevenlabs_agent_id,
        },
      });
    } catch (error: any) {
          
      if (error instanceof Error && error.message.includes('subscription')) {
        setStartError("Active subscription required for premium interviews. Redirecting to pricing...");
        setTimeout(() => navigate("/pricing"), 2000);
      } else {
        setStartError(
          error instanceof Error
            ? error.message
            : "Failed to start the interview session"
        );
      }
    } finally {
      setIsStarting(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    if (minutes === 1.5) {
      return "1m 30s";
    }
    return `${Math.floor(minutes)}m`;
  };

  // Estimate interview duration based on difficulty and demo status
  const estimateDuration = (): number => {
    if (!interview) return 20;

    // Demo interviews have 1.5-minute limit
    if (interview.demo) {
      return 1.5;
    }

    // Premium interviews based on difficulty
    switch (interview.difficulty.toLowerCase()) {
      case 'easy':
        return 20;
      case 'medium':
        return 30;
      case 'hard':
        return 45;
      default:
        return 30;
    }
  };

  // Determine case type from interview content
  const determineCaseType = (): string => {
    if (!interview) return "Case Interview";

    // Try to infer case type from title or description
    const titleLower = interview.title.toLowerCase();
    const descLower = (interview.short_description || "").toLowerCase();

    if (
      titleLower.includes("market sizing") ||
      descLower.includes("market sizing")
    ) {
      return "Market Sizing";
    } else if (
      titleLower.includes("profitability") ||
      descLower.includes("profitability")
    ) {
      return "Profitability";
    } else if (
      titleLower.includes("market entry") ||
      descLower.includes("market entry")
    ) {
      return "Market Entry";
    } else if (
      titleLower.includes("merger") ||
      descLower.includes("merger") ||
      titleLower.includes("acquisition") ||
      descLower.includes("acquisition")
    ) {
      return "Merger & Acquisition";
    } else if (
      titleLower.includes("growth") ||
      descLower.includes("growth strategy")
    ) {
      return "Revenue Growth";
    } else if (
      titleLower.includes("comparison") ||
      descLower.includes("comparison")
    ) {
      return "Comparison";
    }

    return "Case Interview";
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error || "Interview not found"}</div>
        <Link to="/interviews" className={styles.backLink}>
          Back to Interviews
        </Link>
      </div>
    );
  }

  const caseType = determineCaseType();
  const duration = estimateDuration();

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link to="/interviews">Mock Interviews</Link>
        <span className={styles.separator}>&gt;</span>
        <span>{interview.title}</span>
      </div>

      <h1 className={styles.title}>{interview.title}</h1>

      <div className={styles.tags}>
        <span className={styles.duration}>{formatDuration(duration)}</span>
        <span className={styles.official}>
          {interview.demo ? "Demo Interview" : `Official ${interview.company} Consulting Case practice`}
        </span>
      </div>

      <div className={styles.interviewLayout}>
        <div className={styles.cameraContainer}>
          <div className={styles.camera}>
            {mediaStatus.error ? (
              <div className={styles.cameraError}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
                    fill="#FF4D4F"
                  />
                </svg>
                <p>{mediaStatus.error}</p>
                <button
                  onClick={setupMedia}
                  className={styles.retryButton}
                >
                  Enable Microphone
                </button>
              </div>
            ) : !mediaStatus.video && !mediaStatus.audio ? (
              <div className={styles.cameraPlaceholder}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"
                    fill="#888"
                  />
                </svg>
                <p>Enable Microphone and Camera</p>
                <button
                  onClick={setupMedia}
                  className={styles.enableMediaButton}
                >
                  Enable Microphone and Camera
                </button>
              </div>
            ) : (
              <>
                {mediaStatus.video ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={styles.videoFeed}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: VIDEO_MIRRORED ? 'scaleX(-1)' : 'none',
                      aspectRatio: VIDEO_ASPECT_RATIO
                    }}
                    onLoadStart={() => console.log("🎥 Video load started")}
                    onLoadedData={() => console.log("🎥 Video data loaded")}
                    onCanPlayThrough={() => console.log("🎥 Video can play through")}
                  />
                ) : (
                  <div className={styles.audioOnlyIndicator}>
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c-.08 0-.16.02-.24.06-.15.08-.26.23-.26.44v1.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V8.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V10c0 3.53 2.61 6.43 6 6.92V19h-2c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2v-2.08c3.39-.49 6-3.39 6-6.92V8.5c0-.28-.22-.5-.5-.5z"
                        fill="#4CAF50"
                      />
                    </svg>
                    <p>Audio Only</p>
                    <span className={styles.audioOnlyNote}>
                      Microphone connected, camera not available
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.deviceInfo}>
            <div className={styles.deviceItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" fill="#666"/>
              </svg>
              <span>{deviceInfo.audioOutput}</span>
            </div>
            
            <div className={styles.deviceItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2s-2-.9-2-2V4c0-1.1.9-2 2-2zm5.3 6c-.08 0-.16.02-.24.06-.15.08-.26.23-.26.44v1.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V8.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V10c0 3.53 2.61 6.43 6 6.92V19h-2c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2v-2.08c3.39-.49 6-3.39 6-6.92V8.5c0-.28-.22-.5-.5-.5z" fill="#666"/>
              </svg>
              <span>{deviceInfo.audioInput}</span>
            </div>
            
            <div className={styles.deviceItem}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" fill="#666"/>
              </svg>
              <span>{deviceInfo.videoInput}</span>
            </div>
          </div>
        </div>

        <div className={styles.rightSidebar}>
          <div className={styles.joinSection}>
            <h3 className={styles.readyToJoinTitle}>Ready to Join?</h3>
            
            <div className={styles.joinIcon}>
              <img 
                src="/assets/Logo.avif" 
                alt="Logo" 
                width="48" 
                height="48"
                style={{ borderRadius: '50%' }}
              />
            </div>

            {startError && (
              <div className={styles.startError}>{startError}</div>
            )}
            
            <button
              onClick={handleStartInterview}
              disabled={
                !mediaStatus.audio || 
                !!mediaStatus.error ||
                isStarting
              }
              className={styles.startButton}
            >
              {isStarting ? "Starting Interview..." : "Start Interview"}
            </button>

            <p className={styles.joinNote}>
              Begin the interview to get started.
            </p>

            {interview.demo && (
              <p className={styles.demoNote}>
                This is a 1m 30s demo. Upgrade for full interviews.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h3>About this interview</h3>
        
        {/* Show short description if different from long description */}
        {interview.short_description && 
         interview.long_description && 
         interview.short_description !== interview.long_description && (
          <p className={styles.shortDescription}>
            <strong>Summary:</strong> {interview.short_description}
          </p>
        )}
        
        {/* Show long description with priority, fallback to short if no long description */}
        <p className={styles.longDescription}>
          {interview.long_description || interview.short_description}
        </p>
        
        {interview.company && (
          <a href="#" className={styles.officialLink}>
            Official mock interview from {interview.company}
          </a>
        )}
      </div>
    </div>
  );
};

export default InterviewPage; 