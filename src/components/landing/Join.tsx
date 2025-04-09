import React from "react";
import styles from "../../styles/landing page/Join.module.css";
import { useModal } from "../../contexts/ModalContext";

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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Join: React.FC = () => {
  const { openModal } = useModal();

  const handleJoinClick = () => {
    openModal("register");
  };

  return (
    <section className={styles["join-section"]}>
      <div className={styles["join-container"]}>
        <div className={styles["membership-card"]}>
          <div className={styles["card-header"]}>
            <span className={styles["membership-label"]}>
              CasePrepared Membership
            </span>
            <div>
              <span className={styles["price"]}>$40.00</span>
              <span className={styles["per-month"]}>per month</span>
            </div>
            <p className={styles["trial-text"]}>Free for the first 7 days</p>
          </div>

          <ul className={styles["feature-list"]}>
            <li className={styles["feature-item"]}>
              <CheckIcon /> Practice with realistic mock interviews
            </li>
            <li className={styles["feature-item"]}>
              <CheckIcon /> Get real-time performance insights
            </li>
            <li className={styles["feature-item"]}>
              <CheckIcon /> Receive AI-powered interview analysis
            </li>
            <li className={styles["feature-item"]}>
              <CheckIcon /> Access professional guidance
            </li>
          </ul>

          <button className={styles["cta-button"]} onClick={handleJoinClick}>
            Start Free Trial
          </button>
        </div>

        <div className={styles["content-side"]}>
          <h2 className={styles["join-title"]}>
            Start Your Interview Preparation Journey
          </h2>
          <p className={styles["join-subtitle"]}>
            Access our comprehensive interview preparation platform and improve
            your skills with AI-powered feedback
          </p>
        </div>
      </div>
    </section>
  );
};

export default Join;
