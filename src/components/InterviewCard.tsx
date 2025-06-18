import React from "react";
import styles from "../styles/InterviewCard.module.css";

// Arrow icon component
const ArrowIcon: React.FC = () => (
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
);

// Define the props interface for the interview card
export interface InterviewCardProps {
  id: string;
  company: string;
  logo: string;
  title: string;
  description: string;
  image_url?: string;
  thumbnail?: string;
  buttonText: string;
  isLoading?: boolean;
  isPremium?: boolean;
  progress_status?: string | null;
  completionStatus?: string | null;
  onClick: () => void;
  onButtonClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  id,
  company,
  logo,
  title,
  description,
  image_url,
  thumbnail,
  buttonText,
  isLoading = false,
  isPremium = false,
  progress_status,
  completionStatus,
  onClick,
  onButtonClick,
}) => {
  // Use image_url if available, otherwise fall back to thumbnail
  const imageSource = image_url || thumbnail;

  return (
    <div
      className={`${styles.card} ${isPremium ? styles.demoCard : ""}`}
      onClick={onClick}
    >
      <div className={styles.cardHeader}>
        <img src={logo} alt={`${company} logo`} className={styles.logo} />
        <span className={styles.officialTag}>
          {completionStatus || "Official Interview"}
        </span>
      </div>

      <div className={styles.cardImage}>
        <img src={imageSource} alt={title} />
        {progress_status && (
          <span
            className={`${styles.statusPill} ${
              progress_status === "completed"
                ? styles.completed
                : styles.incomplete
            }`}
          >
            {progress_status === "completed" ? "Completed" : "In Progress"}
          </span>
        )}
      </div>

      <div className={styles.cardContent}>
        <h3>{title}</h3>
        <p>{description}</p>

        <div className={styles.buttonWrapper}>
          <button
            onClick={onButtonClick}
            disabled={isLoading || isPremium}
            className={`${styles.mockButton} ${
              isPremium ? styles.disabledButton : ""
            }`}
          >
            {isLoading ? "Loading..." : buttonText}
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
