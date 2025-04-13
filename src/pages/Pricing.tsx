import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Pricing.module.css";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.25 6.375L5.25 9.375L9.75 2.625"
      stroke="#E9C46A"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const Pricing: React.FC = () => {
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (isAuthenticated) {
      // If authenticated, navigate to subscription page
      navigate("/subscription");
    } else {
      // If not authenticated, open registration modal
      openModal("register");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Start landing offers today, through AI case interview practice
        </h1>
        <p>Choose the plan that best fits your preparation needs.</p>
      </div>

      <div className={styles.pricingGrid}>
        <div className={styles.pricingCard}>
          <h2>CasePrepared</h2>
          <div className={styles.price}>€40.00*</div>
          <div className={styles.period}>per month</div>
          <div className={styles.trialText}>*Free for the first 7 days</div>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <CheckIcon />
              100+ mock interviews
            </li>
            <li className={styles.featureItem}>
              <CheckIcon />
              Real time interview insights
            </li>
            <li className={styles.featureItem}>
              <CheckIcon />
              AI powered performance reviews
            </li>
            <li className={styles.featureItem}>
              <CheckIcon />
              Direct access to professionals
            </li>
          </ul>

          <button onClick={handleSubscribe} className={styles.memberButton}>
            {isAuthenticated ? "Subscribe Now" : "Become a member"}
          </button>
        </div>

        <div className={styles.infoBox}>
          <h2 className={styles.infoTitle}>
            Join students from all over the world, and land your dream role
            today.
          </h2>
          <p className={styles.infoText}>
            All it takes is practice. Successful candidates often do 30+ mock
            interviews before the real one.
          </p>
          <Link to="/interviews" className={styles.mockInterviewButton}>
            Start a Mock Interview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
