import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/PostQuestion.module.css";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

interface LocationState {
  title?: string;
  questionNumber?: number;
  nextQuestionNumber?: number;
  totalQuestions?: number;
  isAllCompleted?: boolean;
  completedQuestions?: number[];
  transcriptAnalysis?: TranscriptAnalysis | null;
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
  [key: string]: any;
}

// Icons for each competency
const StructureIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 4h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm0 5h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2zm0 5h12a1 1 0 0 0 0-2H2a1 1 0 0 0 0 2z" />
  </svg>
);

const CommunicationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 0C3.6 0 0 3.1 0 7c0 1.9.9 3.7 2.3 4.9-.1.9-.4 2.3-1.4 3.6 2.1-.3 3.5-1.1 4.3-1.8.9.2 1.8.3 2.8.3 4.4 0 8-3.1 8-7s-3.6-7-8-7z" />
  </svg>
);

const HypothesisIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM6.77 6.11a1.5 1.5 0 012.46 1.7c-.26.42-.77.75-1.26 1.05-.5.3-.98.87-1 1.44a.75.75 0 001.5.1c0-.1.07-.17.36-.36.65-.4 1.64-.95 2.18-1.89a3 3 0 10-5.17-3.08.75.75 0 001.41.5c-.01-.01 0-.03.02-.03z" />
  </svg>
);

const QualitativeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M14.5 5.5h-3v-3a1 1 0 00-1-1h-5a1 1 0 00-1 1v3h-3a1 1 0 00-1 1v5a1 1 0 001 1h3v3a1 1 0 001 1h5a1 1 0 001-1v-3h3a1 1 0 001-1v-5a1 1 0 00-1-1zm-10-2h3v2h-3v-2zm3 10h-3v-2h3v2zm6-4h-3v-2h-3v2h-3v-2h3v-2h3v2h3v2z" />
  </svg>
);

const AdaptabilityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M14.854 4.854a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 4H3.5A2.5 2.5 0 0 0 1 6.5v8a.5.5 0 0 0 1 0v-8A1.5 1.5 0 0 1 3.5 5h9.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4z" />
  </svg>
);

const PostQuestionScreen: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state || {}) as LocationState;

  const [isLoading, setIsLoading] = useState(false);
  const [loadedAnalysis, setLoadedAnalysis] =
    useState<TranscriptAnalysis | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log("PostQuestionScreen mounted with:", {
      interviewId,
      locationState,
      path: location.pathname,
    });
  }, [interviewId, location]);

  // Extract data from location state
  const {
    title = "Case Interview",
    questionNumber = 1,
    nextQuestionNumber = questionNumber + 1,
    totalQuestions = 4,
    isAllCompleted = false,
    completedQuestions = [],
    transcriptAnalysis = null,
  } = locationState;

  // If transcriptAnalysis is not provided in location state, fetch it
  useEffect(() => {
    // Skip if we already have analysis data from navigation state
    if (transcriptAnalysis || loadedAnalysis) {
      console.log("Analysis already available, skipping fetch");
      return;
    }

    // Max polling attempts (10 attempts × 2 seconds = 20 seconds max)
    const MAX_POLLING_ATTEMPTS = 10;

    if (pollingAttempts >= MAX_POLLING_ATTEMPTS) {
      console.log("Max polling attempts reached, giving up");
      setIsLoading(false);
      return;
    }

    const fetchAnalysisData = async () => {
      try {
        if (!interviewId || !questionNumber) {
          console.warn(
            "Missing interviewId or questionNumber, can't fetch analysis"
          );
          return;
        }

        setIsLoading(true);
        setLoadError(null);

        // Get the auth token
        const token = localStorage.getItem("access_token");
        if (!token) {
          setLoadError("Authentication required");
          setIsLoading(false);
          return;
        }

        // Fetch the latest analysis from the API
        // This endpoint only accepts POST requests, not GET
        const response = await fetch(
          `${API_BASE_URL}/api/v1/transcript-analysis/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              // Send empty transcript to just retrieve the existing analysis
              transcript: "",
              interview_id: interviewId,
              question_number: questionNumber,
              retrieve_only: true, // Adding a flag to indicate we only want to retrieve
            }),
          }
        );

        if (!response.ok) {
          // If 404 (not found), we'll retry
          if (response.status === 404) {
            console.log(
              `Analysis not found yet, will retry (attempt ${
                pollingAttempts + 1
              })`
            );
            setPollingAttempts((prev) => prev + 1);
            return;
          }

          // Other errors we'll display
          throw new Error(`Failed to fetch analysis: ${response.status}`);
        }

        const data = await response.json();
        console.log("Successfully loaded transcript analysis", data);

        if (data && Object.keys(data).length > 0) {
          setLoadedAnalysis(data);
          setPollingAttempts(0); // Reset polling attempts
        } else {
          // If we got empty data, we'll retry
          console.log("Received empty analysis data, will retry");
          setPollingAttempts((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error fetching transcript analysis:", error);
        setLoadError(
          `Failed to load analysis data: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        // Only set loading to false if we're done polling or have data
        if (pollingAttempts >= MAX_POLLING_ATTEMPTS || loadedAnalysis) {
          setIsLoading(false);
        }
      }
    };

    // Start polling
    fetchAnalysisData();

    // Set up polling interval if we need to retry
    const pollingInterval = setTimeout(() => {
      if (!loadedAnalysis && pollingAttempts < MAX_POLLING_ATTEMPTS) {
        console.log(
          `Polling for analysis data (attempt ${pollingAttempts + 1})`
        );
        setPollingAttempts((prev) => prev + 1);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearTimeout(pollingInterval);
  }, [
    interviewId,
    questionNumber,
    transcriptAnalysis,
    loadedAnalysis,
    pollingAttempts,
  ]);

  // Parse title to get the case name
  const titleParts = title.split(" - ");
  const caseName = titleParts.length > 1 ? titleParts[0] : title;
  const caseType = titleParts.length > 1 ? titleParts[1] : "Case Interview";

  // Calculate duration - 20m is a placeholder, would normally come from API
  const duration = "20m";

  // Handle continuing to next question or returning to interviews
  const handleContinue = () => {
    if (isAllCompleted || questionNumber >= totalQuestions) {
      // Navigate to interviews page (final question)
      navigate(`/interviews`);
    } else {
      // Navigate to next question
      navigate(`/interview/authenticated-session/${interviewId}`, {
        state: {
          questionNumber: nextQuestionNumber,
          title: title,
        },
      });
    }
  };

  // Use loaded analysis if available, otherwise fall back to the one from location state
  const analysisToDisplay = loadedAnalysis || transcriptAnalysis;

  // Format section title to be more readable
  const formatSectionTitle = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get the appropriate icon for a competency
  const getCompetencyIcon = (key: string) => {
    switch (key) {
      case "structure":
        return <StructureIcon />;
      case "communication":
        return <CommunicationIcon />;
      case "hypothesis_driven_approach":
        return <HypothesisIcon />;
      case "qualitative_analysis":
        return <QualitativeIcon />;
      case "adaptability":
        return <AdaptabilityIcon />;
      default:
        return null;
    }
  };

  // Get the appropriate class for a competency
  const getCompetencyClass = (key: string): string => {
    switch (key) {
      case "structure":
        return styles.structure;
      case "communication":
        return styles.communication;
      case "hypothesis_driven_approach":
        return styles.hypothesis;
      case "qualitative_analysis":
        return styles.qualitative;
      case "adaptability":
        return styles.adaptability;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a href="/interviews">Mock Interviews</a>
        <span>&gt;</span>
        <a href="#">{caseName}</a>
      </div>

      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {caseName} – {caseType}
        </h1>
        <div className={styles.metadata}>
          <div className={styles.durationPill}>{duration}</div>
          <div className={styles.caseType}>
            Official Consulting Case Interview Practice
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Left column - Reports */}
        <div className={styles.reportColumn}>
          <h2 className={styles.reportHeading}>Your Report</h2>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Analyzing your performance...</p>
            </div>
          ) : loadError ? (
            <div className={styles.noAnalysisContainer}>
              <p>Error loading analysis: {loadError}</p>
              <p>
                Please try refreshing the page or contact support if the problem
                persists.
              </p>
            </div>
          ) : analysisToDisplay ? (
            <div className={styles.competencies}>
              {Object.entries(analysisToDisplay)
                .filter(
                  ([key]) =>
                    key !== "id" && key !== "created_at" && key !== "updated_at"
                )
                .map(([key, section]) => {
                  // Check if the section has the expected structure
                  const hasValidStructure =
                    section &&
                    typeof section === "object" &&
                    "title" in section &&
                    "description" in section;

                  if (!hasValidStructure) {
                    return null;
                  }

                  return (
                    <div key={key} className={styles.competencyItem}>
                      <div
                        className={`${
                          styles.competencyPill
                        } ${getCompetencyClass(key)}`}
                      >
                        <div className={styles.competencyIcon}>
                          {getCompetencyIcon(key)}
                        </div>
                        <div className={styles.competencyTitle}>
                          <span className={styles.competencyName}>
                            {formatSectionTitle(key)}
                          </span>
                          <span className={styles.competencySubtitle}>
                            {section.title}
                          </span>
                        </div>
                      </div>
                      <p className={styles.competencyFeedback}>
                        {section.description}
                      </p>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className={styles.noAnalysisContainer}>
              <p>No analysis available for this question.</p>
              <p>
                This may happen if the question was too short or there was an
                error processing the transcript.
              </p>
            </div>
          )}
        </div>

        {/* Right column - Action */}
        <div className={styles.actionColumn}>
          <div className={styles.actionCard}>
            <p className={styles.congratulation}>
              Hooray! You finished Question #{questionNumber}
            </p>
            <h3 className={styles.nextPrompt}>
              {isAllCompleted || questionNumber >= totalQuestions
                ? "All questions completed!"
                : `Ready to start Question #${nextQuestionNumber}?`}
            </h3>
            <button
              className={styles.actionButton}
              onClick={handleContinue}
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading
                ? "Loading Analysis..."
                : isAllCompleted || questionNumber >= totalQuestions
                ? "Back to Interviews"
                : "Start Interview"}
            </button>
            <a
              href={`/my-interview/${interviewId}`}
              className={styles.backLink}
            >
              Back to interview page
            </a>
          </div>
        </div>
      </div>

      {/* Keep the progress container for accessibility, but hide it with CSS */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <div
              key={index}
              className={`${styles.progressStep} ${
                completedQuestions.includes(index + 1) ? styles.completed : ""
              } ${questionNumber === index + 1 ? styles.current : ""}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
        <div className={styles.progressLabel}>
          {isAllCompleted
            ? "All questions completed!"
            : `${completedQuestions.length} of ${totalQuestions} questions completed`}
        </div>
      </div>
    </div>
  );
};

export default PostQuestionScreen;
