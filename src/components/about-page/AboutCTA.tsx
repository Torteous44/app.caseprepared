import React from "react";
import styles from "../../styles/about-page/AboutCTA.module.css";
import { useModal } from "../../contexts/ModalContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const AboutCTA: React.FC = () => {
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal("register");
  };

  return (
    <section className={styles.ctaContainer}>
      <span className={styles.subheader}>Start Your Journey</span>
      <h2 className={styles.ctaHeading}>Ready to land your dream job?</h2>
      <p className={styles.ctaText}>
        Join students worldwide using CasePrepared
      </p>
      {isAuthenticated ? (
        <Link to="/interviews" className={styles.ctaButton}>
          Get Started
        </Link>
      ) : (
        <button onClick={handleGetStarted} className={styles.ctaButton}>
          Get Started
        </button>
      )}
    </section>
  );
};

export default AboutCTA;
