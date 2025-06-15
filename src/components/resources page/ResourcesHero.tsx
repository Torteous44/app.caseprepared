import React from "react";
import styles from "../../styles/resources page/ResourcesHero.module.css";
import "../../styles.css"; // Import global styles for CSS variables
import { Link } from "react-router-dom";
import CompaniesBanner from "./CompaniesBanner";
import HeroRectangle from "./HeroRectangle";

const ResourcesHero: React.FC = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <div className={styles.subheading}>Practice makes perfect</div>
          <h1 className={styles.title}>
            Consulting interview{" "}
            <span className={styles.highlight}>preparation that works.</span>
          </h1>
          <p className={styles.description}>
            Access our curated collection of AI powered practice interviews, consulting resources, and frameworks.
          </p>
          <div className={styles.ctaContainer}>
            <Link to="/interviews">
              <button className={styles.ctaButton}>
                Try a Practice Interview
              </button>
            </Link>
          </div>
        </div>
        <div className={styles.rightColumn}>
          <HeroRectangle />
        </div>
      </div>
      <CompaniesBanner />
    </section>
  );
};

export default ResourcesHero;
