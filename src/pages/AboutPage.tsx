import React from "react";
import AboutHero from "../components/about-page/AboutHero";
import AboutStory from "../components/about-page/AboutStory";
import AboutHowItWorks from "../components/about-page/AboutHowItWorks";
import AboutMission from "../components/about-page/AboutMission";
import AboutCTA from "../components/about-page/AboutCTA";
import Footer from "../components/common/Footer";
import styles from "../styles/about-page/AboutPage.module.css";

const AboutPage: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      <AboutHero />
      <div className={styles.mainContent}>
        <AboutStory />
        <AboutHowItWorks />
        <AboutMission />
        <AboutCTA />
      </div>
      <Footer />
    </div>
  );
};

export default AboutPage;
