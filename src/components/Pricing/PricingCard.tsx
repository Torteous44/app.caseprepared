import { Check } from "lucide-react";
import styles from "./PricingCard.module.css";
import { useNavigate } from "react-router-dom";

// Check icon component to match PricingCards.tsx
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8L6.5 11.5L13 4.5"
      stroke="var(--blue-primary)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PricingCard() {
  const navigate = useNavigate();

  const handleJoinToday = () => {
    navigate("/pricing");
  };

  return (
    <div className={styles.pricingCard}>
      <div className={`${styles.premiumCard}`}>
        <div className={`${styles.badgePill} ${styles.premiumBadge}`}>
          Premium
        </div>
        <h3 className={styles.cardTitle}>Access all case interviews</h3>
        <ul className={styles.cardFeatures}>
          <li>
            <CheckIcon /> 20+ case interviews
          </li>
          <li>
            <CheckIcon /> Full interview analysis
          </li>
          <li>
            <CheckIcon /> Interview preparation resources
          </li>
        </ul>
        <div className={styles.divider}></div>
        <p className={styles.callToAction}>
          Join thousands of students in cracking their case interviews
        </p>
        <button
          className={`${styles.cardButton} ${styles.premiumButton}`}
          onClick={handleJoinToday}
        >
          Join Today
        </button>
      </div>
    </div>
  );
}
