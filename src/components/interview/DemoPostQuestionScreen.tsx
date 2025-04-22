import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../../styles/PostQuestion.module.css";
import Footer from "../../components/common/Footer";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

// Types
interface LocationState {
  title?: string;
  questionNumber?: number;
  nextQuestionNumber?: number;
  demoType?: string;
}

interface AnalysisSection {
  title: string;
  description: string;
}

interface DemoAnalysis {
  structure: AnalysisSection;
  communication: AnalysisSection;
  hypothesis_driven_approach: AnalysisSection;
  qualitative_analysis: AnalysisSection;
  adaptability: AnalysisSection;
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

// Hardcoded analysis options that will be randomly selected
const demoAnalysisOptions: DemoAnalysis[] = [
  // Option 1
  {
    structure: {
      title: "Good Structure",
      description:
        "You demonstrated a clear approach to the problem. Consider using more frameworks to organize your thoughts and ensure you cover all angles systematically.",
    },
    communication: {
      title: "Clear Communication",
      description:
        "Your explanations were clear and concise. To improve further, practice summarizing key points at regular intervals to keep the interviewer engaged and demonstrate your structured thinking.",
    },
    hypothesis_driven_approach: {
      title: "Developing Hypotheses",
      description:
        "You formed some initial hypotheses. Next time, try to be more explicit about your hypotheses early on and test them systematically throughout your analysis.",
    },
    qualitative_analysis: {
      title: "Strong Qualitative Skills",
      description:
        "You showed good qualitative reasoning. To enhance this further, practice connecting qualitative insights to quantitative elements of the case, strengthening the overall analysis.",
    },
    adaptability: {
      title: "Adaptable Thinking",
      description:
        "You adjusted well to new information. Continue developing this skill by practicing cases with unexpected twists or constraints to build your adaptability in pressured situations.",
    },
  },
  // Option 2
  {
    structure: {
      title: "Developing Structure",
      description:
        "Your approach had some structure, but could benefit from more clear segmentation. Try using the MECE principle (Mutually Exclusive, Collectively Exhaustive) to ensure comprehensive coverage of all aspects.",
    },
    communication: {
      title: "Effective Communicator",
      description:
        "You communicated your ideas well. For further improvement, practice more concise explanations of complex concepts and use visual aids like frameworks when appropriate.",
    },
    hypothesis_driven_approach: {
      title: "Hypothesis Foundations",
      description:
        "You're beginning to use hypotheses in your approach. To strengthen this, start each case by explicitly stating 2-3 potential hypotheses and methodically test each throughout your analysis.",
    },
    qualitative_analysis: {
      title: "Balanced Analysis",
      description:
        "Your qualitative reasoning showed good insights. Consider adding more industry-specific factors to your analysis to demonstrate business acumen and contextual understanding.",
    },
    adaptability: {
      title: "Quick Adjustment",
      description:
        "You showed ability to pivot when needed. Continue developing this by practicing how to gracefully incorporate new information mid-analysis without losing your structural approach.",
    },
  },
  // Option 3
  {
    structure: {
      title: "Structured Approach",
      description:
        "You showed a methodical approach. To elevate your structure, consider starting with a clear roadmap of your analysis plan and refer back to it throughout the case to demonstrate systematic thinking.",
    },
    communication: {
      title: "Articulate Presentation",
      description:
        "Your communication was generally effective. Practice more active listening and paraphrasing to ensure you fully understand the question before proceeding with your analysis.",
    },
    hypothesis_driven_approach: {
      title: "Strategic Hypothesizing",
      description:
        "You formulated reasonable hypotheses. Work on prioritizing which hypotheses to test first based on potential impact and ease of validation to show strategic thinking.",
    },
    qualitative_analysis: {
      title: "Insightful Analysis",
      description:
        "You demonstrated good qualitative reasoning. Try incorporating more stakeholder perspectives in your analysis to show comprehensive understanding of business implications.",
    },
    adaptability: {
      title: "Flexible Thinking",
      description:
        "You adapted to changing information well. Continue practicing by challenging yourself with cases that have multiple viable solutions to strengthen your comfort with ambiguity.",
    },
  },
  // Option 4
  {
    structure: {
      title: "Developing Framework",
      description:
        "You applied some structure to your analysis. Consider using established frameworks like the profitability framework, Porter's Five Forces, or market entry frameworks to provide a more comprehensive approach to the problem.",
    },
    communication: {
      title: "Confident Delivery",
      description:
        "You communicated with confidence, but could improve clarity when explaining complex ideas. Try using the pyramid principle: lead with the conclusion, then provide supporting points in descending order of importance.",
    },
    hypothesis_driven_approach: {
      title: "Building Hypotheses",
      description:
        "Your approach showed some hypothesis testing. To strengthen this skill, explicitly state your initial hypothesis at the beginning, then systematically validate or invalidate it with data points throughout your analysis.",
    },
    qualitative_analysis: {
      title: "Contextual Analysis",
      description:
        "Your qualitative reasoning incorporated some industry context. Enhance this by considering competitive landscape, customer segments, and macro trends that could impact the business situation.",
    },
    adaptability: {
      title: "Responsive Thinking",
      description:
        "You adapted to new information when prompted. Work on proactively asking for relevant data that could change your approach, demonstrating that you anticipate potential pivots in your analysis.",
    },
  },
  // Option 5
  {
    structure: {
      title: "Emerging Structure",
      description:
        "Your approach had basic structure but lacked cohesiveness. Practice using issue trees to break down complex problems into component parts and ensure you cover all relevant aspects systematically.",
    },
    communication: {
      title: "Developing Communication",
      description:
        "Your communication showed potential but had moments of uncertainty. Try using the 'signposting' technique to clearly indicate transitions between different parts of your analysis to keep your interviewer oriented.",
    },
    hypothesis_driven_approach: {
      title: "Initial Hypothesizing",
      description:
        "You began to form hypotheses during your analysis. Strengthen this skill by explicitly stating what data you would need to test each hypothesis, showing a clear connection between assumptions and evidence.",
    },
    qualitative_analysis: {
      title: "Foundational Analysis",
      description:
        "Your qualitative analysis covered basic factors. Expand your thinking to include second-order effects and interdependencies between different aspects of the business to demonstrate deeper strategic thinking.",
    },
    adaptability: {
      title: "Growing Adaptability",
      description:
        "You showed some ability to adjust your thinking. Practice responding to unexpected constraints or information by quickly reprioritizing your analysis path while maintaining the overall structure of your approach.",
    },
  },
  // Option 6
  {
    structure: {
      title: "Strong Framework",
      description:
        "You applied a clear framework effectively. To further enhance your structure, customize standard frameworks to fit the specific case context rather than applying them rigidly, showing both mastery of concepts and adaptability.",
    },
    communication: {
      title: "Excellent Communication",
      description:
        "Your communication was clear and persuasive. Continue developing your ability to use analogies and visual explanations for complex concepts, making your insights more accessible and memorable to the interviewer.",
    },
    hypothesis_driven_approach: {
      title: "Advanced Hypothesis Testing",
      description:
        "You effectively created and tested multiple hypotheses. Further refine this skill by explicitly ranking hypotheses by probability and potential impact, demonstrating prioritization in your problem-solving approach.",
    },
    qualitative_analysis: {
      title: "Comprehensive Analysis",
      description:
        "Your qualitative analysis was thorough. To elevate further, practice connecting qualitative insights to quantitative implications, showing how non-numeric factors translate to business metrics and outcomes.",
    },
    adaptability: {
      title: "Highly Adaptable",
      description:
        "You demonstrated strong adaptability throughout the case. Continue developing this by practicing cases with multiple unexpected twists, training yourself to smoothly pivot while maintaining the thread of your original analysis.",
    },
  },
  // Option 7
  {
    structure: {
      title: "Methodical Approach",
      description:
        "You took a systematic approach to the problem. Consider developing segmentation skills further by identifying which segments are most relevant to the case objective and focusing your analysis accordingly.",
    },
    communication: {
      title: "Clear Presenter",
      description:
        "You communicated key points effectively. Work on calibrating the level of detail based on the interviewer's signals, elaborating when needed and being concise elsewhere to demonstrate judgment and awareness.",
    },
    hypothesis_driven_approach: {
      title: "Logical Hypothesizing",
      description:
        "Your hypothesis development showed logical progression. To enhance this skill, practice explicitly stating the assumptions underlying your hypotheses and identifying which assumptions, if incorrect, would most significantly impact your conclusion.",
    },
    qualitative_analysis: {
      title: "Nuanced Analysis",
      description:
        "Your qualitative reasoning captured important nuances. Continue developing your ability to identify tensions and tradeoffs between different objectives or stakeholders, demonstrating sophisticated business judgment.",
    },
    adaptability: {
      title: "Strategic Flexibility",
      description:
        "You adjusted your approach strategically when needed. Further strengthen this by practicing how to gracefully acknowledge when initial hypotheses need revision without losing credibility or momentum in your analysis.",
    },
  },
];

const DemoPostQuestionScreen: React.FC = () => {
  const { demoTypeId } = useParams<{ demoTypeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = (location.state || {}) as LocationState;

  // Show loading animation briefly for realism
  const [isLoading, setIsLoading] = useState(true);
  const [demoAnalysis, setDemoAnalysis] = useState<DemoAnalysis | null>(null);

  // Check if user is coming from DemoRealtimeConnect
  useEffect(() => {
    const demoCallCompleted =
      localStorage.getItem("demo_call_completed") === "true";
    const timestamp = localStorage.getItem("demo_call_timestamp");

    // If there's no flag or the timestamp is more than 5 minutes old, redirect
    if (
      !demoCallCompleted ||
      (timestamp && Date.now() - parseInt(timestamp) > 5 * 60 * 1000)
    ) {
      // Clear the flag
      localStorage.removeItem("demo_call_completed");
      localStorage.removeItem("demo_call_timestamp");

      // Redirect to interviews page
      navigate("/interviews");
      return;
    }

    // If user is properly authenticated, load the page normally
  }, [navigate]);

  // Extract data from location state
  const {
    title = "Case Interview",
    questionNumber = 1,
    nextQuestionNumber = questionNumber + 1,
    demoType = demoTypeId,
  } = locationState;

  // Parse title to get the case name
  const titleParts = title.split(" - ");
  const caseName = titleParts.length > 1 ? titleParts[0] : title;
  const caseType = titleParts.length > 1 ? titleParts[1] : "Case Interview";

  // Calculate duration - 20m is a placeholder
  const duration = "20m";

  // Simulate loading and then randomly select an analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      // Randomly select one of the analysis options
      const randomIndex = Math.floor(
        Math.random() * demoAnalysisOptions.length
      );
      setDemoAnalysis(demoAnalysisOptions[randomIndex]);
      setIsLoading(false);

      // Clear the demo call flags after successful load to prevent re-access
      setTimeout(() => {
        localStorage.removeItem("demo_call_completed");
        localStorage.removeItem("demo_call_timestamp");
      }, 2000);
    }, 2000); // 2 second delay for loading effect

    return () => clearTimeout(timer);
  }, []);

  // Handle continuing to next question or returning to interviews
  const handleContinue = () => {
    // For the demo, we'll assume just one question for demo sessions
    navigate("/subscription", {
      state: {
        fromDemo: true,
        demoType: demoType,
      },
    });
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

  // Checkout Button Component for premium subscription
  const CheckoutButton = ({ className }: { className?: string }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        // Call backend endpoint to create checkout session
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/subscriptions/create-checkout-session`,
          {
            price_id: "price_1RFeEdIzbD323IQGvtSOXEsy", // Premium plan price ID
            success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${window.location.origin}/checkout/cancel`,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Redirect to Stripe Checkout
        window.location.href = response.data.checkout_url;
      } catch (err) {
        console.error("Checkout error:", err);
        setError(
          `${
            err instanceof Error
              ? err.message
              : "Failed to start checkout process"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={className || ""}
          style={{
            backgroundColor: "#004494",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          {loading ? "Processing..." : "Get Premium"}
        </button>

        {error && (
          <div style={{ color: "red", marginTop: "10px" }}>{error}</div>
        )}
      </div>
    );
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
          ) : demoAnalysis ? (
            <div
              className={styles.competencies}
              style={{ position: "relative" }}
            >
              {/* Add gradient overlay with CTA */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.9) 60%, rgba(255,255,255,1) 100%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "20px",
                  zIndex: 10,
                }}
              >
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: "550",
                    color: "#333",
                    marginBottom: "15px",
                    fontFamily: "Inter",
                  }}
                >
                  Join today for full access
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    color: "#666",
                    marginBottom: "20px",
                    maxWidth: "400px",
                    fontFamily: "Inter",
                  }}
                >
                  Access insights and analytics into your interviews with
                  premium
                </p>
                <CheckoutButton />
              </div>

              {Object.entries(demoAnalysis).map(([key, section]) => (
                <div key={key} className={styles.competencyItem}>
                  <div
                    className={`${styles.competencyPill} ${getCompetencyClass(
                      key
                    )}`}
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
              ))}
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
              Congrats! You've completed your demo case interview
            </p>
            <h3 className={styles.nextPrompt}>
              Ready to unlock unlimited practice?
            </h3>
            <CheckoutButton className={styles.actionButton} />
            <a href="/interviews" className={styles.backLink}>
              Back to interviews
            </a>
          </div>
        </div>
      </div>

      {/* Progress container with only one step for demo */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressStep} ${styles.completed} ${styles.current}`}
          >
            1
          </div>
        </div>
        <div className={styles.progressLabel}>Demo question completed!</div>
      </div>

      {/* Add Footer */}
      <Footer
        tagline="Get expert-level feedback on your case interviews"
        showSections={true}
        showResources={true}
        showOther={true}
      />
    </div>
  );
};

export default DemoPostQuestionScreen;
