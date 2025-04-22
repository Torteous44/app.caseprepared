import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InterviewsPage.module.css";
import Footer from "../components/common/Footer";
import InterviewCardPublic from "../components/InterviewCardPublic";

interface InterviewCard {
  id: number;
  company: string;
  logo: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  buttonText: string;
  code: string; // API code for looking up
}

const BASE_URL = "https://casepreparedcrud.onrender.com";

// Hardcoded interview cards with all display data
const interviewCards: InterviewCard[] = [
  {
    id: 1,
    company: "McKinsey",
    logo: "/assets/interviewCards/Logos/Mckinsey.svg",
    title: "Premier Oil - McKinsey Case",
    subtitle: "Official Interview",
    description:
      "The pandemic-induced collapse in oil prices has sharply reduced profitability of a major UK-based offshore oil producer. Design a profitability improvement plan focusing on cost reduction strategies.",
    thumbnail: "/assets/interviewCards/image@2x.webp",
    buttonText: "Mock Interview",
    code: "6276",
  },
  {
    id: 2,
    company: "BCG",
    logo: "/assets/interviewCards/Logos/BCG.svg",
    title: "Betacer Market Entry - BCG Case",
    subtitle: "Official Interview",
    description:
      "A major U.S. electronics manufacturer is considering entering the video-game market given low growth in various electronics segments. Evaluate whether this market entry strategy is wise.",
    thumbnail: "/assets/interviewCards/image@2x-1.webp",
    buttonText: "Mock Interview",
    code: "A72B",
  },
  {
    id: 3,
    company: "Bain",
    logo: "/assets/interviewCards/Logos/Bain.svg",
    title: "Henderson Electric - Bain Case",
    subtitle: "Official Interview",
    description:
      "An industrial air conditioning company has low sales of their IoT monitoring software despite strong overall revenue. Develop a growth strategy to boost software sales and overcome market adoption barriers.",
    thumbnail: "/assets/interviewCards/image@2x-2.webp",
    buttonText: "Mock Interview",
    code: "3DE0",
  },
];

const InterviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleInterviewClick = async (card: InterviewCard) => {
    setLoading((prev) => ({ ...prev, [card.id]: true }));
    setError(null);

    try {
      // Map the interview ID to the corresponding demo type
      const demoTypeMap: Record<number, string> = {
        1: "market-entry", // McKinsey - Beautify
        2: "merger", // BCG - Climate Case
        3: "profitability", // Bain - Coffee Shop
      };

      const demoType = demoTypeMap[card.id];

      if (!demoType) {
        throw new Error("Invalid interview type");
      }

      // Skip API call and directly navigate to the interview page with demo state
      navigate(`/interview/${card.id}`, {
        state: {
          isDemo: true,
          demoType: demoType,
          card: card,
        },
      });
    } catch (err) {
      console.error("Error handling interview:", err);
      setError(err instanceof Error ? err.message : "Failed to load interview");
    } finally {
      setLoading((prev) => ({ ...prev, [card.id]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Land your dream role today.</h1>
        <p>Practice mock interviews with real-world cases from top firms.</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.interviewCards}>
        {interviewCards.map((card) => (
          <InterviewCardPublic
            key={card.id}
            card={card}
            loading={loading}
            onInterviewClick={handleInterviewClick}
          />
        ))}
      </div>

      <div className={styles.header} style={{ marginTop: "2rem" }}>
        <h2>
          Access all interviews with{" "}
          <span style={{ color: "var(--blue-primary)" }}>Premium</span>
        </h2>
        <p>Upgrade today to unlock our complete case library.</p>
        <button
          onClick={() => navigate("/pricing")}
          className={styles.getPremiumButton}
          style={{
            backgroundColor: "var(--blue-primary)",
            color: "white",
            border: "none",
            borderRadius: "var(--border-radius)",
            padding: "12px 36px",
            margin: "20px 0",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Get Premium
        </button>
      </div>

      <div className={styles.interviewCards} style={{ position: "relative" }}>
        <div
          className={styles.gradientOverlay}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        ></div>
        {[
          {
            id: 4,
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
            id: 5,
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
            id: 6,
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
            id: 7,
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
            id: 8,
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
            id: 9,
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
          <div
            key={`premium-${card.id}`}
            className={`${styles.card} ${styles.demoCard}`}
            style={{ position: "relative", zIndex: 0 }}
            onClick={() => navigate("/pricing")}
          >
            <div className={styles.cardHeader}>
              <img
                src={card.logo}
                alt={`${card.company} logo`}
                className={styles.logo}
              />
              <span className={styles.officialTag}>{card.subtitle}</span>
            </div>

            <div className={styles.cardImage}>
              <img src={card.thumbnail} alt={card.title} />
            </div>

            <div className={styles.cardContent}>
              <h3>{card.title}</h3>
              <p>{card.description}</p>

              <div className={styles.buttonWrapper}>
                <button
                  disabled={true}
                  className={`${styles.mockButton} ${styles.disabledButton}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/pricing");
                  }}
                >
                  {card.buttonText}
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
      <Footer />
    </div>
  );
};

export default InterviewsPage;
