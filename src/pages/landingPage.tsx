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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://caseprepared.com/#organization",
        name: "Case Prepared",
        url: "https://caseprepared.com",
        logo: {
          "@type": "ImageObject",
          url: "https://caseprepared.com/assets/Logo.png",
          width: 512,
          height: 512,
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://caseprepared.com/#website",
        url: "https://caseprepared.com",
        name: "Case Prepared",
        publisher: {
          "@id": "https://caseprepared.com/#organization",
        },
      },
      {
        "@type": "WebPage",
        "@id": "https://caseprepared.com/#webpage",
        url: "https://caseprepared.com",
        name: "Crack the case with AI mock interviews | Case Prepared",
        isPartOf: {
          "@id": "https://caseprepared.com/#website",
        },
        about: {
          "@id": "https://caseprepared.com/#organization",
        },
        description:
          "Practice makes perfect. Successful consulting candidates often have over 30 mock interviews before the real one.",
      },
    ],
  };

  React.useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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
