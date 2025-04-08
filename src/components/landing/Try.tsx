import React from "react";
import styles from "../../styles/landing page/Try.module.css";
import { Link } from "react-router-dom";
import LongPopupSequence from "./LongPopupSequence";

const Try: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.textContainer}>
          <p className={styles.subtitle}>
            Supercharge your case practice with AI
          </p>
          <h2 className={styles.title}>
            Practice Smarter with Real-Time AI Coaching
          </h2>
          <p className={styles.description}>
            Practice like it's the real thing and get coaching as you go, not
            just after it ends.
          </p>
          <Link to="/about" className={styles.button}>
            Learn More
          </Link>
        </div>
        <div className={styles.imageContainer}>
          <img
            src="/assets/VideoCall2.avif"
            alt="AI-powered real-time coaching during interview"
            className={styles.image}
          />
          <LongPopupSequence />
        </div>
      </div>
    </div>
  );
};

export default Try;
