import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/InterviewsPage.module.css";

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

const BASE_URL = "https://demobackend-p2e1.onrender.com";

// Hardcoded interview cards with all display data
const interviewCards: InterviewCard[] = [
  {
    id: 1,
    company: "McKinsey",
    logo: "/assets/interviewCards/logos/McKinsey.svg",
    title: "Beautify - McKinsey Case",
    subtitle: "Official Interview",
    description:
      "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers.",
    thumbnail: "/assets/interviewCards/image@2x.webp",
    buttonText: "Mock Interview",
    code: "6276",
  },
  {
    id: 2,
    company: "BCG",
    logo: "/assets/interviewCards/logos/BCG.svg",
    title: "Climate Case - BCG Case",
    subtitle: "Official Interview",
    description:
      "The CEO of a global company wants to reduce their environmental impact. Build the business case for setting a climate target and determine what initiatives to undertake to achieve it.",
    thumbnail: "/assets/interviewCards/image@2x-1.webp",
    buttonText: "Mock Interview",
    code: "A72B",
  },
  {
    id: 3,
    company: "Bain",
    logo: "/assets/interviewCards/logos/Bain.svg",
    title: "Coffee Shop Co. - Bain Case",
    subtitle: "Official Interview",
    description:
      "A specialty coffee company wants to accelerate growth. Identify key market opportunities, evaluate profitability levers, and recommend a strategy to expand their footprint.",
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
      // Only fetch the ID from the API, to confirm it exists
      const response = await fetch(`${BASE_URL}/interviews/code/${card.code}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to load interview");
      }

      // We don't need the response data since we're using hardcoded info
      // Just navigate directly to the interview page with the card ID
      navigate(`/interview/${card.id}`);
    } catch (err) {
      console.error("Error fetching interview:", err);
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
          <div
            key={card.id}
            className={styles.card}
            onClick={() => handleInterviewClick(card)}
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
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking button
                    handleInterviewClick(card);
                  }}
                  disabled={loading[card.id]}
                  className={styles.mockButton}
                >
                  {loading[card.id] ? "Loading..." : card.buttonText}
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
    </div>
  );
};

export default InterviewsPage;
