import React from "react";
import styles from "../../styles/about-page/AboutMission.module.css";

const AboutMission: React.FC = () => {
  return (
    <section className={styles.missionContainer}>
      <h2 className={styles.sectionHeading}>Our Mission</h2>

      <div className={styles.missionContent}>
        <p className={styles.missionText}>
          Case Prepared is dedicated to revolutionizing the way professionals
          prepare for interviews.{" "}
          <span className={styles.platformText}>
            Our platform combines artificial intelligence with proven interview
            techniques to
          </span>{" "}
          provide personalized, interactive practice experiences that boost
          confidence and improve outcomes.
        </p>
      </div>

      <div className={styles.benefits}>
        <div className={styles.benefitItem}>
          <div className={styles.benefitIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.benefitContent}>
            <h3 className={styles.benefitTitle}>Interviews:</h3>
            <p className={styles.benefitText}>
              Leverage AI to have real mock interviews
            </p>
          </div>
        </div>

        <div className={styles.benefitItem}>
          <div className={styles.benefitIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.benefitContent}>
            <h3 className={styles.benefitTitle}>Availability:</h3>
            <p className={styles.benefitText}>
              Thousands of official cases from top companies
            </p>
          </div>
        </div>

        <div className={styles.benefitItem}>
          <div className={styles.benefitIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.benefitContent}>
            <h3 className={styles.benefitTitle}>Availability:</h3>
            <p className={styles.benefitText}>
              Interview anywhere, at any time
            </p>
          </div>
        </div>

        <div className={styles.benefitItem}>
          <div className={styles.benefitIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 10L12 15L17 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15V3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.benefitContent}>
            <h3 className={styles.benefitTitle}>Insights:</h3>
            <p className={styles.benefitText}>
              Get detailed feedback on your progress
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMission;
