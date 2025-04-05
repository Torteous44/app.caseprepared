import React from "react";
import styles from "../styles/LandingPage.module.css";
import Hero from "../components/landing/Hero";
import UniBanner from "../components/landing/uniBanner";
import Interviews from "../components/landing/interviews";
import Analysis from "../components/landing/Analysis";
import Try from "../components/landing/Try";
import FAQs from "../components/landing/FAQs";
import Footer from "../components/landing/Footer";

const LandingPage: React.FC = () => {
  return (
    <div className={styles["landing-page"]}>
      <Hero
        title="Crack the case with AI mock interviews"
        subtitle="Practice makes perfect. Successful consulting candidates often have over 30 mock interviews before the real one."
      />

      <UniBanner />

      <Interviews />

      <Try />

      <Analysis />

      <FAQs />
      
      <Footer />
    </div>
  );
};

export default LandingPage;
