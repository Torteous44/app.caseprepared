import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/about-page/AboutHowItWorks.module.css";

const AboutHowItWorks: React.FC = () => {
  return (
    <section className={styles.howItWorksContainer}>
      <h2 className={styles.sectionHeading}>How CasePrepared Works</h2>

      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.featureItem}>
            <p>
              <span className={styles.featureTitle}>
                Our AI-powered platform simulates real interview scenarios,{" "}
              </span>
              <span className={styles.featureDescription}>
                providing instant feedback on your responses. Unlike traditional
                methods that rely on generic advice, our system analyzes your
                specific answers, offering tailored recommendations for
                improvement.
              </span>
            </p>
          </div>

          <div className={styles.featureItem}>
            <p>
              <span className={styles.featureTitle}>
                Practice at your own pace, anytime, anywhere.{" "}
              </span>
              <span className={styles.featureDescription}>
                Choose from a variety of industry-specific interview templates
                or customize your own. Each session is designed to challenge you
                with questions that match the actual interviews in your field.
              </span>
            </p>
          </div>

          <div className={styles.featureItem}>
            <p>
              <span className={styles.featureTitle}>
                Track your progress over time with detailed performance
                analytics.{" "}
              </span>
              <span className={styles.featureDescription}>
                Identify patterns in your responses and focus your preparation
                on areas that need the most attention.
              </span>
            </p>
          </div>

          <Link to="/interviews" className={styles.tryButton}>
            Try an interview
          </Link>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.caseCard}>
            <div className={styles.caseHeader}>
              <img
                src="/assets/interviewCards/Logos/BCG.svg"
                alt="BCG Logo"
                className={styles.caseLogo}
              />
              <span className={styles.officialLabel}>Official Interview</span>
            </div>
            <div className={styles.caseImage}>
              <img
                src="/assets/interviewCards/image@2x-1.webp"
                alt="Climate Case Interview"
                className={styles.caseImg}
              />
            </div>
            <div className={styles.caseContent}>
              <h3 className={styles.caseTitle}>Climate Case - BCG Case</h3>
              <p className={styles.caseDescription}>
                The CEO of a global company wants to reduce their environmental
                impact. Build the business case for setting a climate target and
                determine what initiatives to undertake to achieve it.
              </p>
              <div className={styles.buttonWrapper}>
                <Link
                  to="/interviews/climate-case"
                  className={styles.mockButton}
                >
                  Mock Interview <span className={styles.arrowIcon}>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHowItWorks;
