import React from "react";
import styles from "../../styles/about-page/AboutCTA.module.css";
import { Link } from "react-router-dom";

const AboutCTA: React.FC = () => {
  return (
    <section className={styles.ctaContainer}>
      <span className={styles.subheader}>Start Your Journey</span>
      <h2 className={styles.ctaHeading}>Ready to land your dream job?</h2>
      <p className={styles.ctaText}>
        Join students worldwide using CasePrepared
      </p>
      <Link to="/interviews" className={styles.ctaButton}>
        Get Started
      </Link>
    </section>
  );
};

export default AboutCTA;
