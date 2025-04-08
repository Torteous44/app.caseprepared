import React from "react";
import styles from "../../styles/landing page/Analysis.module.css";

const Analysis: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.blueIcon}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
              </svg>
            </div>
            <h3>
              <span className={styles.highlight}>Get Smarter</span> with every
              try
            </h3>
          </div>
          <p className={styles.cardText}>
            Instantly learn what worked, what didn't, and how to fix it before
            your next case.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.orangeIcon}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>
            <h3>
              <span className={styles.highlight}>Analyze</span> your case
              performance.
            </h3>
          </div>
          <p className={styles.cardText}>
            Break down your performance across structure, math, clarity, and
            business insight, just like real interviewers.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.icon} ${styles.pinkIcon}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </div>
            <h3>
              <span className={styles.highlight}>Turn feedback</span> into
              progress:
            </h3>
          </div>
          <p className={styles.cardText}>
            Get clear, targeted recommendations on how to improve: no guesswork,
            just next steps that move you forward.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
