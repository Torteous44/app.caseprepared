import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/AuthenticatedInterviewPage.module.css";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

// API base URL defined in AuthContext
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

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

interface Interview {
  id: string;
  user_id: string;
  template_id: string;
  status: string;
  progress_data: {
    current_question: number;
    questions_completed: number[];
  };
  started_at: string;
  completed_at: string | null;
  template?: Template; // Added template property for combined endpoint
}

interface Template {
  id: string;
  case_type: string;
  lead_type: string;
  difficulty: string;
  company: string;
  industry: string;
  image_url: string;
  title: string;
  description_short: string;
  description_long: string;
  duration: number;
  version: string;
  prompt: string;
  structure: {
    [key: string]: {
      prompt: string;
      context: string;
    };
  };
}

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

const AuthenticatedInterviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
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

  // Fetch interview with template details using the new combined endpoint
  useEffect(() => {
    const fetchInterviewData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!id) {
          throw new Error("No interview ID provided");
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Use the new endpoint that returns both interview and template data
        const response = await fetch(
          `${API_BASE_URL}/api/v1/interviews/${id}/with-template`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to load interview data");
        }

        const data = await response.json();

        // Set interview data
        setInterview(data);

        // Set template data from the nested template property
        if (data.template) {
          setTemplate(data.template);

          // Create case content from template data
          const generatedContent: CaseContent = {
            sections: [
              {
                heading: "Case Overview",
                content:
                  data.template.description_long ||
                  data.template.description_short,
              },
            ],
          };

          setCaseContent(generatedContent);
        } else {
          throw new Error("Template data not found in the response");
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

    if (isAuthenticated) {
      fetchInterviewData();
    } else {
      navigate("/login");
    }
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

  const handleStartInterview = async () => {
    if (!interview || !template) {
      setStartError("Interview data is missing.");
      return;
    }

    setStartError(null);

    try {
      // Stop the local stream to release camera/mic before navigation
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Navigate to the AuthenticatedRealtimeConnect component with the current question
      navigate(`/interview/authenticated-session/${interview.id}`, {
        state: {
          title: template.title,
          questionNumber: interview.progress_data.current_question,
        },
      });
    } catch (error: any) {
      console.error("Failed to start session:", error);
      setStartError(
        error instanceof Error
          ? error.message
          : "Failed to start the interview session"
      );
    }
  };

  const formatDuration = (minutes: number): string => {
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !interview || !template) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          {error || "Interview not found"}
        </div>
        <Link to="/interviews" className={styles.backLink}>
          Back to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link to="/interviews">Mock Interviews</Link>
        <span className={styles.separator}>&gt;</span>
        <span>{template.title}</span>
      </div>

      <h1 className={styles.title}>{template.title}</h1>

      <div className={styles.tags}>
        <span className={styles.duration}>
          {formatDuration(template.duration)}
        </span>
        <span className={styles.official}>
          Official {template.company} Consulting Case practice
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
            onClick={handleStartInterview}
          >
            {interview.progress_data.current_question > 1
              ? "Continue Interview"
              : "Start Interview"}
          </button>

          {startError && <p className={styles.startError}>{startError}</p>}
        </div>
      </div>

      <div className={styles.aboutSection}>
        <h3>About this interview</h3>
        <p>
          {template.description_short ||
            "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers."}
        </p>
        <a href="#" className={styles.officialLink}>
          Official mock interview from {template.company || "McKinsey"}
        </a>
      </div>

      <div className={styles.interviewDetails}>
        <h3>About the case</h3>

        <div className={styles.casePreview}>
          <div className={styles.caseImageContainer}>
            <img
              src={template.image_url || "/assets/case-preview.jpg"}
              alt={template.title}
              className={styles.caseImage}
            />
            <div className={styles.caseImageFooter}>
              <h5>{template.case_type || "Market Sizing"}</h5>
              <p>
                {CASE_TYPE_DESCRIPTIONS[template.case_type || ""] ||
                  CASE_TYPE_DESCRIPTIONS["Market Sizing"] ||
                  DEFAULT_CASE_DESCRIPTION}
              </p>
            </div>
          </div>
          <div className={styles.caseContent}>
            <div className={styles.caseHeader}>
              <div className={styles.caseHeaderLeft}>
                <h4>
                  {template.company || "McKinsey"} -{" "}
                  {template.case_type || "Case Title"}
                </h4>
                <div className={styles.caseMeta}>
                  <span>{formatDuration(template.duration || 20)}</span>
                  <span>{template.difficulty || "Easy"}</span>
                </div>
              </div>
              <div className={styles.caseStatus}>
                <span
                  className={`${styles.statusBadge} ${
                    interview.status === "completed" ? styles.completed : ""
                  }`}
                >
                  {interview.status === "completed" ? "Complete" : "Incomplete"}
                </span>
              </div>
            </div>

            <p className={styles.caseDescription}>
              {template.description_long ||
                "Description about the case, more in detail, just general yap about what it is. Vorem Impusm dolerus dolar impus murne Vorem Impusm dolerus dolar impus murne Vorem Impusm dolerus dolar impus murne"}
            </p>

            <div className={styles.startInterviewBtnContainer}>
              <button
                className={styles.startInterviewBtn}
                onClick={handleStartInterview}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>

        <div className={styles.caseStructure}>
          <h3>Case Structure</h3>
          <p>Questions from the interview</p>

          <div className={styles.questions}>
            {template.structure &&
              Object.entries(template.structure).map(([key, value], index) => {
                const questionNum = parseInt(key.replace("question", ""));

                // Determine question status
                const isCompleted =
                  interview.progress_data.questions_completed.includes(
                    questionNum
                  );
                const isCurrent =
                  interview.progress_data.current_question === questionNum;
                const isUpcoming =
                  questionNum > interview.progress_data.current_question;

                // Extract question text from prompt
                const promptText = value.prompt;

                // Look for content between <title> tags
                const titleMatch = promptText.match(/<title>(.*?)<\/title>/);
                const questionTitle = titleMatch ? titleMatch[1].trim() : "";

                return (
                  <div key={index} className={styles.questionCard}>
                    <div
                      className={`${styles.questionStatus} ${
                        isCompleted
                          ? styles.completed
                          : isCurrent
                          ? styles.current
                          : styles.incomplete
                      }`}
                    >
                      {isCompleted
                        ? "Completed"
                        : isCurrent
                        ? "Current"
                        : "Incomplete"}
                    </div>
                    <h4>Question #{questionNum}</h4>
                    <h5>{questionTitle}</h5>
                    <button
                      className={styles.startQuestion}
                      onClick={() => {
                        // Navigate to the AuthenticatedRealtimeConnect component with the specific question
                        if (localStreamRef.current) {
                          localStreamRef.current
                            .getTracks()
                            .forEach((track) => track.stop());
                        }
                        navigate(
                          `/interview/authenticated-session/${interview.id}`,
                          {
                            state: {
                              title: template.title,
                              questionNumber: questionNum,
                            },
                          }
                        );
                      }}
                    >
                      Start Question
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedInterviewPage;
