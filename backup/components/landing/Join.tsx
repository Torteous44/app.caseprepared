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
            Master Your <span className={styles.highlight}>Interview Performance</span>
          </h2>
          <p className={styles["join-subtitle"]}>
            Enterprise-grade interview preparation platform trusted by leading companies
          </p>
          
          <ul className={styles["benefits-list"]}>
            <li className={styles["benefit-item"]}>
              <div className={styles["benefit-icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>AI-powered feedback that identifies improvement areas in real-time</span>
            </li>
            <li className={styles["benefit-item"]}>
              <div className={styles["benefit-icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>20+ industry-specific case interviews with expert analysis</span>
            </li>
            <li className={styles["benefit-item"]}>
              <div className={styles["benefit-icon"]}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span>Proven frameworks developed by consulting industry experts</span>
            </li>
          </ul>
          
          <div className={styles["enterprise-badge"]}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px"}}>
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            Trusted by students worldwide
          </div>
        </div>
      </div>
    </section>
  );
};

export default Join;
