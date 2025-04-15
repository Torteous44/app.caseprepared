import React from "react";
import styles from "../../styles/landing page/Join.module.css";
import PricingCard from "../Pricing/PricingCard";

const Join: React.FC = () => {
  return (
    <section className={styles["join-section"]}>
      <div className={styles["join-container"]}>
        <PricingCard />

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
