import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/Hero.module.css";

interface HeroProps {
  title?: string;
  subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Crack the case with AI mock interviews",
  subtitle = "Practice makes perfect. Successful consulting candidates often have over 30 mock interviews before the real one.",
}) => {
  return (
    <div className={styles["hero-container"]}>
      <div className={styles["hero-content"]}>
        <div className={styles["hero-text"]}>
          <div className={styles["stats-pill"]}>
            <span>
              We've helped over 10,000 students pass their case interviews
            </span>
            <span className={styles["divider"]}></span>
            <button className={styles["read-more"]}>Read more</button>
          </div>

          <h1>{title}</h1>
          <p>{subtitle}</p>
          <Link to="/interviews" className={styles["button-primary"]}>
            Try an Interview
          </Link>
        </div>
        <div className={styles["hero-image"]}>
          <img
            src="/assets/heroVideoCall.png"
            alt="AI-powered mock interview interface"
            className={styles["video-call-image"]}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
