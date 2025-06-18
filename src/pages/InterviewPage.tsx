import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/AuthenticatedInterviewPage.module.css";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { fetchLesson, Lesson } from "../utils/lessonService";

// Dictionary of case type descriptions
const CASE_TYPE_DESCRIPTIONS: Record<string, string> = {
  Profitability: "Analyze the profitability of a business or product",
  "Revenue Growth": "Identify strategies to grow revenue for a company",
  "Market Entry": "Evaluate opportunities to enter a new market",
  "Market Sizing": "Quantify opportunity in a target market",
  Comparison: "Compare options and recommend the best solution",
  // Add more case types and descriptions as needed
};

// Default description if case type is not found in dictionary
const DEFAULT_CASE_DESCRIPTION =
  "Analyze business problem and recommend solution";

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

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [caseContent, setCaseContent] = useState<CaseContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

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

  // Fetch lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error("No lesson ID provided");
        }

        const lessonData = await fetchLesson(id);
        setLesson(lessonData);

        // Create case content from lesson data
        const generatedContent: CaseContent = {
          sections: [
            {
              heading: "Case Overview",
              content:
                lessonData.long_description ||
                lessonData.short_description ||
                "",
            },
          ],
        };

        setCaseContent(generatedContent);
      } catch (err) {
        console.error("Error fetching lesson data:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Only proceed with API calls if we're authenticated
    if (isAuthenticated) {
      fetchLessonData();
    } else if (isAuthenticated === false) {
      // If auth is done loading and we're not authenticated, show error
      setError("Authentication required to view this lesson");
      setIsLoading(false);
    }
    // If isAuthenticated is still undefined (loading), we'll wait
  }, [id, isAuthenticated, navigate]);

  // Setup camera and microphone
  useEffect(() => {
    const setupMedia = async () => {
      try {
        // Request both video and audio
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: true,
        });

        // Save the stream to the ref
        localStreamRef.current = stream;

        // Connect the stream to the video element if it exists
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Make sure video plays when ready
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch((e) => {
              console.error("Error playing video:", e);
            });
          };
        }

        // Update status to indicate success
        setMediaStatus({ video: true, audio: true });
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setMediaStatus({
          video: false,
          audio: false,
          error:
            "Could not access camera or microphone. Please allow permissions.",
        });
      }
    };

    setupMedia();

    // Clean up function
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartLesson = async () => {
    if (!lesson) {
      setStartError("Lesson data is missing.");
      return;
    }

    setStartError(null);

    try {
      // Stop the local stream to release camera/mic before navigation
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Navigate to the realtime connect component
      navigate(`/lesson/session/${lesson.id}`, {
        state: {
          title: lesson.title,
          lesson: lesson,
          questionNumber: 1,
        },
      });
    } catch (error: any) {
      console.error("Failed to start session:", error);
      setStartError(
        error instanceof Error
          ? error.message
          : "Failed to start the lesson session"
      );
    }
  };

  const formatDuration = (minutes: number): string => {
    return `${minutes}m`;
  };

  // Estimate lesson duration based on content
  const estimateDuration = (): number => {
    if (!lesson) return 20;

    let questionCount = 0;
    lesson.body.phases.forEach((phase) => {
      if (phase.questions) {
        questionCount += phase.questions.length;
      }
    });

    return Math.max(20, questionCount * 7); // Minimum 20 minutes
  };

  // Determine case type from lesson content
  const determineCaseType = (): string => {
    if (!lesson) return "Case Interview";

    // Try to infer case type from title or description
    const titleLower = lesson.title.toLowerCase();
    const descLower = (lesson.short_description || "").toLowerCase();

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

  if (error || !lesson) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{error || "Lesson not found"}</div>
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
        <span>{lesson.title}</span>
      </div>

      <h1 className={styles.title}>{lesson.title}</h1>

      <div className={styles.tags}>
        <span className={styles.duration}>{formatDuration(duration)}</span>
        <span className={styles.official}>
          Official {lesson.company} Consulting Case practice
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
                  onClick={() => window.location.reload()}
                  className={styles.retryButton}
                >
                  Retry
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.videoFeed}
                style={{ transform: "scaleX(-1)" }}
              />
            )}
          </div>
          <p className={styles.cameraInstructions}>
            Please enable your microphone and camera.
          </p>
        </div>

        <div className={styles.interviewInfo}>
          <h2 className={styles.aboutTitle}>Ready to Join?</h2>

          <div className={styles.userAvatar}>
            <img
              src="/assets/Logo.avif"
              alt="Case Prepared Logo"
              className={styles.logo}
            />
          </div>

          <button
            className={styles.startButton}
            disabled={!mediaStatus.video || !mediaStatus.audio || isLoading}
            onClick={handleStartLesson}
          >
            Start Interview
          </button>

          {startError && <p className={styles.startError}>{startError}</p>}
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h3>About this lesson</h3>
        <p>
          {lesson.short_description ||
            "Learn key consulting frameworks and techniques through this interactive case study."}
        </p>
        <a href="#" className={styles.officialLink}>
          Official case study from {lesson.company}
        </a>
      </div>

      <div className={styles.interviewDetails}>
        <h3>About the case</h3>

        <div className={styles.casePreview}>
          <div className={styles.caseImageContainer}>
            <img
              src={lesson.image_url || "/assets/case-preview.jpg"}
              alt={lesson.title}
              className={styles.caseImage}
            />
            <div className={styles.caseImageFooter}>
              <h5>{caseType}</h5>
              <p>
                {CASE_TYPE_DESCRIPTIONS[caseType] || DEFAULT_CASE_DESCRIPTION}
              </p>
            </div>
          </div>
          <div className={styles.caseContent}>
            <div className={styles.caseHeader}>
              <div className={styles.caseHeaderLeft}>
                <h4>
                  {lesson.company} - {caseType}
                </h4>
                <div className={styles.caseMeta}>
                  <span>{formatDuration(duration)}</span>
                  <span>{lesson.difficulty}</span>
                </div>
              </div>
            </div>

            <p className={styles.caseDescription}>
              {lesson.long_description ||
                lesson.short_description ||
                "This case will guide you through solving a realistic consulting problem using industry-standard frameworks and approaches."}
            </p>

            <div className={styles.startInterviewBtnContainer}>
              <button
                className={styles.startInterviewBtn}
                onClick={handleStartLesson}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
