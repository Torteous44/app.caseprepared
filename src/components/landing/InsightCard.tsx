import React from "react";
import styles from "../../styles/landing page/InsightCard.module.css";

interface InsightCardProps {
  message: string;
  icon?: React.ReactNode;
  strokeColor?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  message,
  icon,
  strokeColor = "#0066FF",
}) => {
  // Default star icon as SVG
  const defaultIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );

  // Split the message into heading and body parts
  const [firstLine, ...bodyParts] = message.split(". ");
  const [label, headingText] = firstLine.split(": ");
  const bodyText = bodyParts.join(". ").trim();

  return (
    <div className={styles.insightContainer}>
      <div
        className={styles.insightBubble}
        style={
          {
            borderColor: strokeColor,
            "--stroke-color": strokeColor,
          } as React.CSSProperties
        }
      >
        <div className={styles.insightHeader}>
          <span className={styles.iconWrapper} style={{ color: strokeColor }}>
            {icon || defaultIcon}
          </span>
          <div className={styles.insightContent}>
            <div className={styles.insightHeading}>
              <span style={{ color: strokeColor }}>{label}: </span>
              <span>{headingText}</span>
            </div>
            <div className={styles.insightBody}>{bodyText}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
