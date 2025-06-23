import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { completeInterviewWithAnalytics, InterviewCompleteResponse } from "../../utils/interviewService";
import LoadingSpinner from "../common/LoadingSpinner";
import Footer from "../common/Footer";
import styles from "../../styles/PostQuestion.module.css";

interface LocationState {
  interview?: any;
  session?: any;
  metrics?: any;
  transcript?: any[];
  transcripts?: Array<{
    speaker: 'user' | 'ai' | 'system';
    text: string;
    timestamp: string;
  }>;
  conversationId?: string;
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

interface ProcessingMetadata {
  processed_at: string;
  interview_id?: string;
  gpt_model: string;
  word_count: number;
  char_count: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens: number;
}

interface AnalyticsData {
  analytics: TranscriptAnalysis;
  processing_metadata: ProcessingMetadata;
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

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract data from location state
  const {
    interview,
    session,
    metrics,
    transcript,
    transcripts,
    conversationId
  } = locationState;

  // Function to convert transcript data to string format
  const formatTranscriptText = (): string => {
    if (transcripts && transcripts.length > 0) {
      // Use the structured transcripts for better formatting
      return transcripts
        .map(item => {
          const speaker = item.speaker === 'ai' ? 'Interviewer' : 'Candidate';
          return `${speaker}: ${item.text}`;
        })
        .join('\n\n');
    } else if (transcript && Array.isArray(transcript)) {
      // Fallback to transcript array if available
      return transcript
        .map(item => {
          if (typeof item === 'string') return item;
          if (item.role && item.message) {
            const speaker = item.role === 'assistant' ? 'Interviewer' : 'Candidate';
            return `${speaker}: ${item.message}`;
          }
          return JSON.stringify(item);
        })
        .join('\n\n');
    } else {
      return '';
    }
  };

  useEffect(() => {   
    const transcriptText = formatTranscriptText();
    
    if (!interviewId) {
      setError("Missing interview ID. Please try the interview again.");
      setIsProcessing(false);
      return;
    }

    if (!transcriptText.trim()) {
      setError("No transcript data available for analysis. Please try the interview again.");
      setIsProcessing(false);
      return;
    }

    // Generate analytics with the simplified approach
    generateAnalytics(transcriptText);
  }, [interviewId, transcripts, transcript]);

  const generateAnalytics = async (transcriptText: string) => {
    if (!transcriptText.trim()) {
      setError("No transcript data available for analysis");
      setIsProcessing(false);
      return;
    }

    try {
      // Use the new simplified analytics endpoint
      const result = await completeInterviewWithAnalytics(
        transcriptText,
        interviewId
      );

      // Set analytics data directly from the simplified response
      setAnalyticsData({
        analytics: result.analytics,
        processing_metadata: result.processing_metadata
      });
      setIsProcessing(false);

    } catch (error: any) {
      
      // Handle specific error types with simplified approach
      if (error.message.includes('Transcript text is required') || 
          error.message.includes('transcript is available')) {
        setError("Interview transcript is not available. Please ensure the interview completed properly.");
      } else if (error.message.includes('subscription required')) {
        setError("Active subscription required for analytics.");
      } else if (error.message.includes('Analytics service is temporarily unavailable')) {
        setError("Analytics service is temporarily unavailable. Please try again in a moment.");
      } else {
        setError(`Analytics generation failed: ${error.message.split(':').pop()?.trim() || 'Please try again later'}`);
      }
      setIsProcessing(false);
    }
  };



  const handleRetryAnalytics = () => {
    setError(null);
    setIsProcessing(true);
    const transcriptText = formatTranscriptText();
    generateAnalytics(transcriptText);
  };

  const handleBackToInterviews = () => {
    navigate("/interviews");
  };

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

  // Parse title to get the case name
  const title = interview?.title || "Case Interview";
  const titleParts = title.split(" - ");
  const caseName = titleParts.length > 1 ? titleParts[0] : title;
  const caseType = titleParts.length > 1 ? titleParts[1] : "Case Interview";

  // Calculate duration - get from metrics or default
  const duration = metrics?.duration 
    ? `${Math.floor(metrics.duration / 60)}m ${metrics.duration % 60}s`
    : interview?.demo ? "2m" : "20m";

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
            {interview?.demo ? "Demo Interview" : "Official Consulting Case Interview Practice"}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Left column - Analytics Report */}
        <div className={styles.reportColumn}>
          <h2 className={styles.reportHeading}>Your Performance Report</h2>

          {error ? (
            <div className={styles.errorContainer}>
              <h3>Unable to Load Analytics</h3>
              <p>{error}</p>
              <button onClick={handleRetryAnalytics} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : analyticsData?.analytics ? (
            <div className={styles.competencies}>
              {Object.entries(analyticsData.analytics)
                .filter(([key]) => key !== "id" && key !== "created_at" && key !== "updated_at")
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
                      <div className={`${styles.competencyPill} ${getCompetencyClass(key)}`}>
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

              {/* Processing metadata display */}

              
            </div>
          ) : isProcessing ? (
            <div className={styles.processingContainer}>
              <h3>AI Analysis in Progress</h3>
              <p>Your interview is being analyzed in the background...</p>
              <div className={styles.processingPlaceholder}>
                <div className={styles.placeholderItem}>
                  <div className={styles.placeholderPill}></div>
                  <div className={styles.placeholderText}></div>
                </div>
                <div className={styles.placeholderItem}>
                  <div className={styles.placeholderPill}></div>
                  <div className={styles.placeholderText}></div>
                </div>
                <div className={styles.placeholderItem}>
                  <div className={styles.placeholderPill}></div>
                  <div className={styles.placeholderText}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noAnalysisContainer}>
              <h3>No Analytics Available</h3>
              <p>We weren't able to generate analytics for this interview session.</p>
              <p>This can happen if the interview was too short or there was insufficient conversation data.</p>
            </div>
          )}
        </div>

        {/* Right column - Action */}
        <div className={styles.actionColumn}>
          <div className={styles.actionCard}>
            <h3 className={styles.congratulations}>
              Interview Complete!
            </h3>
            <p className={styles.completionMessage}>
              {analyticsData 
                ? "Review your detailed performance analysis on the left."
                : error 
                ? "Your interview was completed successfully."
                : isProcessing
                ? "Your AI analysis is being generated in the background..."
                : "Interview completed successfully!"
              }
            </p>
            
            <button
              className={styles.actionButton}
              onClick={handleBackToInterviews}
            >
              Back to Interviews
            </button>

            {interview && (
              <a
                href={`/interview/${interview.id}`}
                className={styles.backLink}
              >
                Try this interview again
              </a>
            )}
          </div>
        </div>
      </div>

      <Footer
        tagline="Get expert-level AI feedback on your case interviews"
        showSections={true}
        showResources={true}
        showOther={true}
      />
    </div>
  );
};

export default PostQuestionScreen;
