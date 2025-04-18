import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InterviewsPage.module.css";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/common/Footer";
import { StripeContext } from "../contexts/StripeContext";

// Define an interface for templates with progress data
interface TemplateWithProgress {
  id: string;
  case_type: string;
  lead_type: string;
  difficulty: string;
  company: string;
  industry: string;
  image_url: string;
  title: string;
  description_short: string;
  duration: number;
  version: string;

  // Progress fields
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

  // UI display properties (derived)
  subtitle?: string;
  buttonText?: string;
  logo?: string;
  description?: string;
  thumbnail?: string;
  completionStatus?: "Completed" | "Incomplete" | null;
}

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
  completionStatus?: "Completed" | "Incomplete" | null;
}

// API base URLs
const API_BASE_URL = "https://casepreparedcrud.onrender.com";
// Define demo interview templates
const demoInterviews: DemoInterview[] = [
  {
    id: "market-entry",
    company: "BCG",
    logo: "/assets/interviewCards/Logos/BCG.svg",
    title: "Climate Case - BCG Case",
    subtitle: "Official Interview",
    description:
      "The CEO of a global company wants to reduce their environmental impact. Build the business case for setting a climate target and determine what initiatives to undertake to achieve it.",
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
    title: "Beautify - McKinsey Case",
    subtitle: "Official Interview",
    description:
      "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers.",
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
    title: "Coffee Shop Co. - Bain Case",
    subtitle: "Official Interview",
    description:
      "A specialty coffee company wants to accelerate growth. Identify key market opportunities, evaluate profitability levers, and recommend a strategy to expand their footprint.",
    thumbnail: "/assets/interviewCards/image@2x-2.webp",
    buttonText: "Mock Interview",
    case_type: "Merger & Acquisition",
    difficulty: "Easy",
    duration: 35,
  },
];

const AuthenticatedInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const stripeContext = useContext(StripeContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateWithProgress[]>([]);
  const [demoTemplates, setDemoTemplates] = useState<EnhancedDemoInterview[]>(
    []
  );
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has subscription and load appropriate templates
    const checkUserAccess = async () => {
      setLoading(true);

      try {
        // Get authentication token
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Check user subscription status
        const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        console.log("User data:", userData); // Log user data for debugging

        // Update subscription check to match backend structure
        const userHasSubscription = userData.subscription?.is_active === true;
        setHasSubscription(userHasSubscription);

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

        if (userHasSubscription) {
          // User has subscription, fetch real templates with progress
          await fetchTemplatesWithProgress();
        }
      } catch (err) {
        console.error("Error checking user access:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load interview templates"
        );

        // Prepare demo templates with enhanced properties (fallback)
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
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      checkUserAccess();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Function to fetch templates with progress from backend (for subscribed users)
  const fetchTemplatesWithProgress = async () => {
    try {
      // Get authentication token
      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error(
          "No authentication token found. Please log in to access interview templates."
        );
      }

      // Fetch templates with progress in a single request
      const response = await fetch(
        `${API_BASE_URL}/api/v1/templates/with-progress`,
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
        throw new Error(
          errorData.detail || "Failed to load interview templates"
        );
      }

      const data = await response.json();

      // Process templates to add UI display properties
      const processedTemplates = data.map((template: TemplateWithProgress) => ({
        ...template,
        subtitle: getSubtitle(template),
        buttonText: getButtonText(template),
        logo: getCompanyLogo(template.company),
        completionStatus: getCompletionStatus(template),
        thumbnail: template.image_url, // Add thumbnail for consistency
      }));

      setTemplates(processedTemplates);
    } catch (err) {
      console.error("Error fetching templates:", err);
      throw err;
    }
  };

  // Helper function to determine completion status
  const getCompletionStatus = (
    template: TemplateWithProgress
  ): "Completed" | "Incomplete" | null => {
    if (!template.progress_status) return null;

    if (template.progress_status === "completed") {
      return "Completed";
    } else if (
      template.questions_completed &&
      template.questions_completed > 0
    ) {
      return "Incomplete";
    }

    return null;
  };

  // Helper function to determine button text based on interview status
  const getButtonText = (template: TemplateWithProgress): string => {
    if (template.interview_id && template.progress_status !== "completed") {
      return "Continue Interview";
    }
    return "Mock Interview";
  };

  // Helper function to get subtitle from template data
  const getSubtitle = (template: TemplateWithProgress): string => {
    return `${template.difficulty} · ${template.case_type} · ${template.duration} mins`;
  };

  // Helper function to get company logo based on company name
  const getCompanyLogo = (company: string): string => {
    // Normalize the company name for case-insensitive matching
    const normalizedCompany = company.toLowerCase();

    const companyLogos: Record<string, string> = {
      // Original mappings
      "mckinsey & company": "/assets/interviewCards/Logos/Mckinsey.svg",
      mckinsey: "/assets/interviewCards/Logos/Mckinsey.svg",
      bcg: "/assets/interviewCards/Logos/BCG.svg",
      "boston consulting group": "/assets/interviewCards/Logos/BCG.svg",
      "bain & company": "/assets/interviewCards/Logos/Bain.svg",
      bain: "/assets/interviewCards/Logos/Bain.svg",

      // Additional mappings based on available logos
      accenture: "/assets/interviewCards/Logos/Accenture.svg",
      deloitte: "/assets/interviewCards/Logos/Deloitte.svg",
      ey: "/assets/interviewCards/Logos/EY.svg",
      "ernst & young": "/assets/interviewCards/Logos/EY.svg",
      kearney: "/assets/interviewCards/Logos/Kearney.svg",
      "a.t. kearney": "/assets/interviewCards/Logos/Kearney.svg",
      pwc: "/assets/interviewCards/Logos/PWC.svg",
      pricewaterhousecoopers: "/assets/interviewCards/Logos/PWC.svg",
      "oliver wyman": "/assets/interviewCards/Logos/Wyman.svg",
      wyman: "/assets/interviewCards/Logos/Wyman.svg",
    };

    // Check if normalized company name exists in our mapping
    return (
      companyLogos[normalizedCompany] ||
      "/assets/interviewCards/Logos/default.svg"
    );
  };

  const handleStartInterview = async (
    templateId: string,
    existingInterviewId?: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [templateId]: true }));
    setError(null);

    try {
      // If we already have an interview ID from the template data, use that
      if (existingInterviewId) {
        navigate(`/my-interview/${existingInterviewId}`);
        return;
      }

      let interviewId;

      // Create a new interview session if user is authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem("access_token");

        if (token) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/v1/interviews/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                template_id: templateId,
              }),
            });

            if (response.ok) {
              const newInterview = await response.json();
              interviewId = newInterview.id;
            } else {
              const errorData = await response.json();
              throw new Error(
                errorData.detail || "Failed to create interview session"
              );
            }
          } catch (err) {
            console.error("Could not create interview session:", err);
            throw err;
          }
        }
      }

      // If we have an interview ID from the API, navigate to that
      // Otherwise, navigate directly to the template
      if (interviewId) {
        navigate(`/my-interview/${interviewId}`);
      } else {
        // For non-authenticated users or if API call failed, navigate directly to template
        navigate(`/interview/template/${templateId}`);
      }
    } catch (err) {
      console.error("Error starting interview:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start interview. Please try again or contact support."
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [templateId]: false }));
    }
  };

  const handleRetry = () => {
    fetchTemplatesWithProgress();
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

  const handleInterviewAction = (
    interview: TemplateWithProgress | EnhancedDemoInterview
  ) => {
    if (hasSubscription) {
      handleStartInterview(interview.id, interview.interview_id || undefined);
    } else {
      // For demo interviews, we need to convert to the original format
      const demoInterview = demoInterviews.find(
        (demo) => demo.id === interview.id
      );
      if (demoInterview) {
        handleDemoInterviewClick(demoInterview);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "User"}!</h1>
          <p>Loading available interview case studies...</p>
        </div>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  // Show error state if templates couldn't be loaded
  if (error && templates.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "User"}!</h1>
          <p>Ready to start practicing?</p>
        </div>

        <div className={styles.errorState}>
          <h3>Unable to load interview templates</h3>
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

  // Determine which interviews to display based on subscription status
  const interviewsToDisplay = hasSubscription ? templates : demoTemplates;

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

      <div className={styles.interviewCards}>
        {interviewsToDisplay.map((interview) => (
          <div
            key={interview.id}
            className={styles.card}
            onClick={() => handleInterviewAction(interview)}
          >
            <div className={styles.cardHeader}>
              <img
                src={interview.logo}
                alt={`${interview.company} logo`}
                className={styles.logo}
              />
              <span className={styles.officialTag}>
                {hasSubscription && interview.completionStatus
                  ? interview.completionStatus
                  : "Official Interview"}
              </span>
            </div>

            <div className={styles.cardImage}>
              <img
                src={interview.image_url || interview.thumbnail}
                alt={interview.title}
              />
            </div>

            <div className={styles.cardContent}>
              <h3>{interview.title}</h3>
              <p>{interview.description || interview.description_short}</p>

              <div className={styles.buttonWrapper}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInterviewAction(interview);
                  }}
                  disabled={loadingStates[interview.id]}
                  className={styles.mockButton}
                >
                  {loadingStates[interview.id]
                    ? "Loading..."
                    : interview.buttonText || "Mock Interview"}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!hasSubscription && (
        <div className={styles.premiumSection}>
          <h2>Access all interviews with premium</h2>
          <p>
            Get unlimited access to all premium cases in our library with our
            analytics features for $39.99/month
          </p>
          <button className={styles.upgradeButton} onClick={handleUpgradeClick}>
            Get Premium
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AuthenticatedInterviewsPage;
