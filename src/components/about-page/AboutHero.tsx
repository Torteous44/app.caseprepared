import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/about-page/AboutHero.module.css";

const AboutHero: React.FC = () => {
  return (
    <section className={styles.heroContainer}>
      <div className={styles.heroContent}>
        <h1 className={styles.mainHeading}>
          Helping students and graduates worldwide
          <br />
          <span className={styles.highlight}>
            break into management consulting
          </span>
        </h1>
        <p className={styles.subHeading}>
          The mock-interview service of tomorrow, helping students worldwide
          land their dream jobs
        </p>
        <Link to="/interviews" className={styles.ctaButton}>
          Join students worldwide
        </Link>
        <div className={styles.mapContainer}>
          <img
            src="/assets/World Map.svg"
            alt="World map showing global reach"
            className={styles.worldMap}
          />
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
