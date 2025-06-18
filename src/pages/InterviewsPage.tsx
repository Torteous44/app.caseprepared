import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InterviewsPage.module.css";
import { useAuth } from "../contexts/AuthContext";
import { InterviewCard, LoadingSpinner, Footer } from "../components";
import { StripeContext } from "../contexts/StripeContext";
import {
  fetchLessons,
  convertLessonToCardFormat,
  Lesson,
} from "../utils/lessonService";

// Define demo interview cards
interface DemoInterview {
  id: string;
  company: string;
  logo: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  buttonText: string;
  case_type: string;
  difficulty: string;
  duration: number;
}

// Extended type for demo interviews when adding progress fields
interface EnhancedDemoInterview extends DemoInterview {
  progress_status: string | null;
  progress_data: {
    current_question: number;
    questions_completed: number[];
  } | null;
  interview_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  questions_completed: number | null;
  total_questions: number;
  image_url?: string;
  description_short?: string;
  completionStatus?: string | null;
}

// Define demo interview templates
const demoInterviews: DemoInterview[] = [
  {
    id: "market-entry",
    company: "BCG",
    logo: "/assets/interviewCards/Logos/BCG.svg",
    title: "Betacer Market Entry - BCG Case",
    subtitle: "Official Interview",
    description:
      "A major U.S. electronics manufacturer is considering entering the video-game market given low growth in various electronics segments. Evaluate whether this market entry strategy is wise.",
    thumbnail: "/assets/interviewCards/image@2x-1.webp",
    buttonText: "Mock Interview",
    case_type: "Market Entry",
    difficulty: "Medium",
    duration: 30,
  },
  {
    id: "profitability",
    company: "McKinsey",
    logo: "/assets/interviewCards/Logos/Mckinsey.svg",
    title: "Premier Oil - McKinsey Case",
    subtitle: "Official Interview",
    description:
      "The pandemic-induced collapse in oil prices has sharply reduced profitability of a major UK-based offshore oil producer. Design a profitability improvement plan focusing on cost reduction strategies.",
    thumbnail: "/assets/interviewCards/image@2x.webp",
    buttonText: "Mock Interview",
    case_type: "Profitability",
    difficulty: "Hard",
    duration: 45,
  },
  {
    id: "merger",
    company: "Bain",
    logo: "/assets/interviewCards/Logos/Bain.svg",
    title: "Henderson Electric - Bain Case",
    subtitle: "Official Interview",
    description:
      "An industrial air conditioning company has low sales of their IoT monitoring software despite strong overall revenue. Develop a growth strategy to boost software sales and overcome market adoption barriers.",
    thumbnail: "/assets/interviewCards/image@2x-2.webp",
    buttonText: "Mock Interview",
    case_type: "Merger & Acquisition",
    difficulty: "Easy",
    duration: 35,
  },
];

const AuthenticatedInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasSubscription } = useAuth();
  const stripeContext = useContext(StripeContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [demoTemplates, setDemoTemplates] = useState<EnhancedDemoInterview[]>(
    []
  );
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState<boolean>(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has subscription and load appropriate content
    const loadContent = async () => {
      setLoading(true);

      try {
        // Prepare demo templates with enhanced properties
        const enhancedDemos = demoInterviews.map((demo) => ({
          ...demo,
          progress_status: null,
          progress_data: null,
          interview_id: null,
          started_at: null,
          completed_at: null,
          questions_completed: null,
          total_questions: 5,
          completionStatus: null,
          image_url: demo.thumbnail,
          description_short: demo.description,
        }));

        setDemoTemplates(enhancedDemos);

        if (hasSubscription) {
          // User has subscription, fetch lessons
          await loadLessons();
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load interview content"
        );
      } finally {
        setLoading(false);
      }
    };

    // Only proceed with API calls if we're authenticated
    if (isAuthenticated) {
      loadContent();
    } else if (loading && !isAuthenticated) {
      // If still loading auth state, don't do anything yet
      console.log("Waiting for authentication to complete...");
    } else {
      // If auth is done loading and we're not authenticated, set up demo templates
      console.log("User not authenticated, showing demo templates only");
      const enhancedDemos = demoInterviews.map((demo) => ({
        ...demo,
        progress_status: null,
        progress_data: null,
        interview_id: null,
        started_at: null,
        completed_at: null,
        questions_completed: null,
        total_questions: 5,
        completionStatus: null,
        image_url: demo.thumbnail,
        description_short: demo.description,
      }));

      setDemoTemplates(enhancedDemos);
      setLoading(false);
    }
  }, [isAuthenticated, hasSubscription, navigate]);

  // Function to load lessons from the API
  const loadLessons = async () => {
    setLessonsLoading(true);
    setLessonsError(null);

    try {
      const lessonsData = await fetchLessons();

      // Convert lessons to the format expected by InterviewCard
      const formattedLessons = lessonsData.map(convertLessonToCardFormat);

      setLessons(formattedLessons);
    } catch (err) {
      console.error("Error fetching lessons:", err);
      setLessonsError(
        err instanceof Error ? err.message : "Failed to load lessons"
      );
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleRetry = () => {
    loadLessons();
  };

  const handleDemoInterviewClick = async (interview: DemoInterview) => {
    setLoadingStates((prev) => ({ ...prev, [interview.id]: true }));
    setError(null);

    try {
      // Map the demo interview ID to the corresponding hardcoded interview ID
      // This maps to the IDs used in InterviewPage.tsx
      const interviewIdMap: Record<string, string> = {
        "market-entry": "2", // BCG - Climate Case
        profitability: "1", // McKinsey - Beautify
        merger: "3", // Bain - Coffee Shop
      };

      const interviewId = interviewIdMap[interview.id];

      if (!interviewId) {
        throw new Error("Invalid demo interview type");
      }

      // Navigate to the interview page with the ID using the same flow as public page
      navigate(`/interview/${interviewId}`, {
        state: {
          isDemo: true,
          demoType: interview.id,
          card: {
            code: interview.id,
          },
        },
      });
    } catch (err) {
      console.error("Error starting demo interview:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start demo interview. Please try again or contact support."
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [interview.id]: false }));
    }
  };

  const handleUpgradeClick = () => {
    navigate("/subscription");
  };

  const handleInterviewAction = (interview: EnhancedDemoInterview) => {
    // For demo interviews, we need to convert to the original format
    const demoInterview = demoInterviews.find(
      (demo) => demo.id === interview.id
    );
    if (demoInterview) {
      handleDemoInterviewClick(demoInterview);
    }
  };

  // Function to handle starting a lesson
  const handleStartLesson = async (lessonId: string) => {
    setLoadingStates((prev) => ({ ...prev, [lessonId]: true }));

    try {
      // Navigate to the lesson page
      navigate(`/interview/${lessonId}`);
    } catch (err) {
      console.error("Error starting lesson:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start lesson. Please try again."
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [lessonId]: false }));
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "User"}!</h1>
          <p>Loading available interview case studies...</p>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if content couldn't be loaded
  if (error && lessons.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "User"}!</h1>
          <p>Ready to start practicing?</p>
        </div>

        <div className={styles.errorState}>
          <h3>Unable to load interview content</h3>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={handleRetry}>
            Retry
          </button>
          <button
            className={styles.contactButton}
            onClick={() => navigate("/contact")}
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {hasSubscription ? (
          <>
            <h1>Welcome back, {user?.full_name?.split(" ")[0] || "Friend"}!</h1>
            <p>Continue practicing with our premium case interviews</p>
          </>
        ) : (
          <>
            <h1>Welcome back, {user?.full_name?.split(" ")[0] || "Friend"}!</h1>
            <p>Ready to start practicing?</p>
          </>
        )}
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Display demo interview templates for non-subscribers */}
      {!hasSubscription && demoTemplates.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Interview Templates</h2>
          <div className={styles.interviewCards}>
            {demoTemplates.map((interview) => (
              <InterviewCard
                key={interview.id}
                id={interview.id}
                company={interview.company}
                logo={
                  interview.logo || "/assets/interviewCards/Logos/default.svg"
                }
                title={interview.title}
                description={
                  interview.description || interview.description_short || ""
                }
                image_url={interview.image_url}
                thumbnail={interview.thumbnail}
                buttonText={interview.buttonText || "Mock Interview"}
                isLoading={loadingStates[interview.id]}
                progress_status={interview.progress_status}
                completionStatus={null}
                onClick={() => handleInterviewAction(interview)}
                onButtonClick={(e) => {
                  e.stopPropagation();
                  handleInterviewAction(interview);
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Display lessons if user has subscription */}
      {hasSubscription && (
        <>
          {lessonsLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner />
              <p>Loading lessons...</p>
            </div>
          ) : lessonsError ? (
            <div className={styles.errorMessage}>
              {lessonsError}
              <button
                className={styles.retryButton}
                onClick={loadLessons}
                style={{ marginLeft: "10px" }}
              >
                Retry
              </button>
            </div>
          ) : lessons.length > 0 ? (
            <div className={styles.interviewCards}>
              {lessons.map((lesson) => (
                <InterviewCard
                  key={`lesson-${lesson.id}`}
                  id={lesson.id}
                  company={lesson.company}
                  logo={lesson.logo}
                  title={lesson.title}
                  description={lesson.description}
                  image_url={lesson.image_url}
                  buttonText={lesson.buttonText}
                  isLoading={loadingStates[lesson.id]}
                  onClick={() => handleStartLesson(lesson.id)}
                  onButtonClick={(e) => {
                    e.stopPropagation();
                    handleStartLesson(lesson.id);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No lessons available at this time. Check back later!</p>
            </div>
          )}
        </>
      )}

      {!hasSubscription && (
        <>
          <div className={styles.header} style={{ marginTop: "2rem" }}>
            <h2>
              Access all interviews with{" "}
              <span style={{ color: "var(--blue-primary)" }}>Premium</span>
            </h2>
            <p>Upgrade today to unlock our complete case library.</p>
          </div>
          <div
            className={styles.interviewCards}
            style={{ position: "relative" }}
          >
            <div className={styles.gradientOverlay}></div>
            {[
              {
                id: "4",
                company: "McKinsey",
                logo: "/assets/interviewCards/Logos/Mckinsey.svg",
                title: "Tech Transformation - McKinsey Case",
                subtitle: "Premium",
                description:
                  "A major retail chain needs to modernize its IT infrastructure to support online growth. Develop a technology roadmap and identify key investment priorities.",
                thumbnail: "/assets/interviewCards/Deloitte.webp",
                buttonText: "Premium Access",
              },
              {
                id: "5",
                company: "Accenture",
                logo: "/assets/interviewCards/Logos/Accenture.svg",
                title: "Digital Banking - Accenture Case",
                subtitle: "Premium",
                description:
                  "A traditional bank is losing market share to fintech startups. Develop a digital strategy to help them compete in the evolving financial services landscape.",
                thumbnail: "/assets/interviewCards/Accenture.webp",
                buttonText: "Premium Access",
              },
              {
                id: "6",
                company: "Bain & Company",
                logo: "/assets/interviewCards/Logos/Bain.svg",
                title: "Healthcare Innovation - Bain & Company Case",
                subtitle: "Premium",
                description:
                  "A healthcare provider wants to leverage AI to improve patient outcomes. Identify key application areas and develop an implementation roadmap.",
                thumbnail: "/assets/interviewCards/BainHealthcare.webp",
                buttonText: "Premium Access",
              },
              {
                id: "7",
                company: "Kearney",
                logo: "/assets/interviewCards/Logos/Kearney.svg",
                title: "Retail Expansion - Kearney Case",
                subtitle: "Premium",
                description:
                  "A luxury retail brand wants to expand into emerging markets. Evaluate potential countries, entry strategies, and develop a five-year growth plan.",
                thumbnail: "/assets/interviewCards/KearneyLux.webp",
                buttonText: "Premium Access",
              },
              {
                id: "8",
                company: "McKinsey",
                logo: "/assets/interviewCards/Logos/Mckinsey.svg",
                title: "Airline Profitability - McKinsey Case",
                subtitle: "Premium",
                description:
                  "A major airline is facing declining profits despite increasing passenger numbers. Identify cost-saving opportunities and revenue enhancement strategies.",
                thumbnail: "/assets/interviewCards/airline.webp",
                buttonText: "Premium Access",
              },
              {
                id: "9",
                company: "BCG",
                logo: "/assets/interviewCards/Logos/BCG.svg",
                title: "Pharmaceutical Launch - BCG Case",
                subtitle: "Premium",
                description:
                  "A pharmaceutical company is preparing to launch a new drug. Evaluate the market potential, pricing strategy, and marketing approach to maximize ROI.",
                thumbnail: "/assets/interviewCards/McKinseyPharma.webp",
                buttonText: "Premium Access",
              },
            ].map((card) => (
              <InterviewCard
                key={`premium-${card.id}`}
                id={card.id}
                company={card.company}
                logo={card.logo}
                title={card.title}
                description={card.description}
                thumbnail={card.thumbnail}
                buttonText={card.buttonText}
                isPremium={true}
                completionStatus={card.subtitle}
                onClick={() => navigate("/subscription")}
                onButtonClick={(e) => {
                  e.stopPropagation();
                  navigate("/subscription");
                }}
              />
            ))}
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default AuthenticatedInterviewsPage;
