import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InterviewsPage.module.css";
import { useAuth } from "../contexts/AuthContext";
import { InterviewCard, LoadingSpinner, Footer } from "../components";
import { StripeContext } from "../contexts/StripeContext";
import {
  fetchPremiumInterviews,
  convertInterviewToCardFormat,
  createInterviewSession,
} from "../utils/interviewService";
import { DEMO_INTERVIEWS, convertDemoToCardFormat } from "../data/demo";

// Helper function to get company logo based on company name
const getCompanyLogo = (company: string): string => {
  const normalizedCompany = company.toLowerCase();

  const companyLogos: Record<string, string> = {
    "mckinsey & company": "/assets/interviewCards/Logos/Mckinsey.svg",
    "mckinsey": "/assets/interviewCards/Logos/Mckinsey.svg",
    "bcg": "/assets/interviewCards/Logos/BCG.svg",
    "boston consulting group": "/assets/interviewCards/Logos/BCG.svg",
    "bain & company": "/assets/interviewCards/Logos/Bain.svg",
    "bain": "/assets/interviewCards/Logos/Bain.svg",
    "accenture": "/assets/interviewCards/Logos/Accenture.svg",
    "deloitte": "/assets/interviewCards/Logos/Deloitte.svg",
    "ey": "/assets/interviewCards/Logos/EY.svg",
    "ernst & young": "/assets/interviewCards/Logos/EY.svg",
    "kearney": "/assets/interviewCards/Logos/Kearney.svg",
    "a.t. kearney": "/assets/interviewCards/Logos/Kearney.svg",
    "pwc": "/assets/interviewCards/Logos/PWC.svg",
    "pricewaterhousecoopers": "/assets/interviewCards/Logos/PWC.svg",
    "oliver wyman": "/assets/interviewCards/Logos/Wyman.svg",
    "wyman": "/assets/interviewCards/Logos/Wyman.svg",
  };

  return (
    companyLogos[normalizedCompany] ||
    "/assets/interviewCards/Logos/BCG.svg" // Default logo
  );
};



const AuthenticatedInterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasSubscription } = useAuth();
  const stripeContext = useContext(StripeContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [premiumInterviews, setPremiumInterviews] = useState<any[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState<boolean>(false);
  const [interviewsError, setInterviewsError] = useState<string | null>(null);
  const [demoInterviews, setDemoInterviews] = useState<any[]>([]);

  useEffect(() => {
    const loadInterviews = async () => {
      setLoading(true);
      setInterviewsError(null);

      try {
        // Always load demo interviews for users without subscription
        if (!hasSubscription) {
          const formattedDemos = DEMO_INTERVIEWS.map(demoInterview => 
            convertDemoToCardFormat(demoInterview)
          );
          setDemoInterviews(formattedDemos);
        }

        // Load premium interviews if user has subscription
        if (hasSubscription) {
          const premium = await fetchPremiumInterviews();
          // Use premium interviews data directly since it already has the right format
          const formattedPremium = premium.map(interview => ({
            ...interview,
            description: interview.short_description, // Map short_description to description for InterviewCard
            logo: getCompanyLogo(interview.company || ''),
            buttonText: "Start Interview",
            isPremium: true
          }));
          setPremiumInterviews(formattedPremium);
        }
      } catch (err) {
        console.error("Error loading interviews:", err);
        setInterviewsError(
          err instanceof Error ? err.message : "Failed to load interviews"
        );
      } finally {
        setLoading(false);
      }
    };

    // Load interviews based on authentication and subscription status
    if (isAuthenticated) {
      loadInterviews();
    } else if (isAuthenticated === false) {
      // For non-authenticated users, still show demo interviews
      const formattedDemos = DEMO_INTERVIEWS.map(demoInterview => 
        convertDemoToCardFormat(demoInterview)
      );
      setDemoInterviews(formattedDemos);
      setLoading(false);
    }
  }, [isAuthenticated, hasSubscription]);

  const handleRetry = () => {
    // Retry loading interviews
    const loadInterviews = async () => {
      setInterviewsLoading(true);
      try {
        if (hasSubscription) {
          const premium = await fetchPremiumInterviews();
          const formattedPremium = premium.map(interview => ({
            ...interview,
            description: interview.short_description, // Map short_description to description for InterviewCard
            logo: getCompanyLogo(interview.company || ''),
            buttonText: "Start Interview",
            isPremium: true
          }));
          setPremiumInterviews(formattedPremium);
        }
      } catch (err) {
        setInterviewsError(err instanceof Error ? err.message : "Failed to load interviews");
      } finally {
        setInterviewsLoading(false);
      }
    };
    
    loadInterviews();
  };



  const handleUpgradeClick = () => {
    navigate("/subscription");
  };

  const handleStartInterview = async (interview: any) => {
    setLoadingStates((prev) => ({ ...prev, [interview.id]: true }));

    try {
      // For demo interviews, navigate directly to interview page
      if (interview.demo) {
        navigate(`/interview/${interview.id}`);
        return;
      }

      // Create interview session using the new API for premium interviews
      const session = await createInterviewSession(interview.id, !interview.isPremium);
      
      // Navigate to the session with the Eleven Labs WebSocket URL
      navigate("/interview/session/" + session.progress_id, {
        state: {
          interview: interview,
          session: session,
          ws_url: session.ws_url,
          elevenlabs_agent_id: session.elevenlabs_agent_id,
        },
      });
    } catch (error) {
      console.error("Error starting interview session:", error);
      if (error instanceof Error && error.message.includes('subscription')) {
        navigate("/pricing");
      } else {
        alert("Failed to start interview. Please try again.");
      }
    } finally {
      setLoadingStates((prev) => {
        const newState = { ...prev };
        delete newState[interview.id];
        return newState;
      });
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
  if (interviewsError && premiumInterviews.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "User"}!</h1>
          <p>Ready to start practicing?</p>
        </div>

        <div className={styles.errorState}>
          <h3>Unable to load interview content</h3>
          <p>{interviewsError}</p>
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

      {interviewsError && <div className={styles.errorMessage}>{interviewsError}</div>}

      {/* Display demo interviews for users without subscription */}
      {!hasSubscription && demoInterviews.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Free Demo Interviews</h2>
          <p className={styles.demoDescription}>
            Try our AI-powered case interviews for free. Each demo is limited to 1m 30s.
          </p>
          <div className={styles.interviewCards}>
            {demoInterviews.map((interview: any) => (
              <InterviewCard
                key={`demo-${interview.id}`}
                id={interview.id}
                company={interview.company}
                logo={interview.logo}
                title={interview.title}
                description={interview.description}
                image_url={interview.image_url}
                buttonText={interview.buttonText}
                isLoading={loadingStates[interview.id]}
                isPremium={false}
                completionStatus="Demo"
                onClick={() => handleStartInterview(interview)}
                onButtonClick={(e) => {
                  e.stopPropagation();
                  handleStartInterview(interview);
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Display premium interviews */}
      {hasSubscription && premiumInterviews.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Premium Interviews</h2>
          <div className={styles.interviewCards}>
            {premiumInterviews.map((interview: any) => (
              <InterviewCard
                key={`premium-${interview.id}`}
                id={interview.id}
                company={interview.company}
                logo={interview.logo}
                title={interview.title}
                description={interview.description}
                image_url={interview.image_url}
                buttonText={interview.buttonText}
                isLoading={loadingStates[interview.id]}
                isPremium={true}
                completion_status={interview.completion_status}
                completionStatus={interview.completionStatus}
                onClick={() => navigate(`/interview/${interview.id}`)}
                onButtonClick={(e) => {
                  e.stopPropagation();
                  navigate(`/interview/${interview.id}`);
                }}
              />
            ))}
          </div>
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
                onClick={() => navigate("/pricing")}
                onButtonClick={(e) => {
                  e.stopPropagation();
                  navigate("/pricing");
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
