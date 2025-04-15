import React from "react";
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

interface InterviewCardPublicProps {
  card: InterviewCard;
  loading: Record<number, boolean>;
  onInterviewClick: (card: InterviewCard) => void;
}

const InterviewCardPublic: React.FC<InterviewCardPublicProps> = ({
  card,
  loading,
  onInterviewClick,
}) => {
  return (
    <div
      key={card.id}
      className={styles.card}
      onClick={() => onInterviewClick(card)}
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
              onInterviewClick(card);
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
  );
};

export default InterviewCardPublic; 