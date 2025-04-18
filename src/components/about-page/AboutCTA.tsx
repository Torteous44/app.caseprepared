import React from "react";
import styles from "../../styles/about-page/AboutCTA.module.css";
import { useModal } from "../../contexts/ModalContext";

const AboutCTA: React.FC = () => {
  const { openModal } = useModal();

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    openModal("register");
  };

  return (
    <section className={styles.ctaContainer}>
      <h2 className={styles.ctaHeading}>Ready to land your dream job?</h2>
      <p className={styles.ctaText}>
        Join students worldwide using CasePrepared
      </p>
      <button onClick={handleGetStarted} className={styles.ctaButton}>
        Get Started
      </button>
    </section>
  );
};

export default AboutCTA;
