import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/landing page/Hero.module.css";
import InsightSequence from "./InsightSequence";
import { Helmet } from "react-helmet";

interface HeroProps {
  title?: string;
  subtitle?: string;
  metaDescription?: string;
}

const Hero: React.FC<HeroProps> = ({
  title = "Crack the case with AI mock interviews",
  subtitle = "Practice makes perfect. Successful consulting candidates often have over 30 mock interviews before the real one.",
  metaDescription = "Improve your consulting interview skills with AI-powered mock interviews. Practice case studies and prepare for top consulting firms like McKinsey, BCG, and Bain.",
}) => {
  const navigate = useNavigate();

  const handleTryInterview = () => {
    navigate("/interview/1"); // Navigate directly to McKinsey interview
  };

  return (
    <>
      <Helmet>
        <title>{title} | ConsultAI</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content="consulting interviews, case studies, mock interviews, McKinsey, BCG, Bain, MBB, consulting preparation"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "ConsultAI",
            description: metaDescription,
            url: window.location.origin,
            potentialAction: {
              "@type": "SearchAction",
              target: `${window.location.origin}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          })}
        </script>
      </Helmet>
      <section
        className={styles["hero-container"]}
        aria-labelledby="hero-heading"
      >
        <div className={styles["hero-content"]}>
          <header className={styles["hero-text"]}>
            <div className={styles["stats-pill"]} role="note">
              <span>We've helped students get into top MBB firms</span>
              <span className={styles["divider"]} aria-hidden="true"></span>
              <Link to="/resources" className={styles["read-more"]}>
                Read more
              </Link>
            </div>

            <h1 id="hero-heading">{title}</h1>
            <p>{subtitle}</p>
            <button
              onClick={handleTryInterview}
              className={styles["button-primary"]}
              aria-label="Start a mock interview simulation"
            >
              Try an Interview
            </button>
          </header>
          <div className={styles["hero-image"]}>
            <img
              src="/assets/HeroCall.avif"
              alt="Professional consultant engaging in an AI-powered mock interview with detailed feedback and analysis tools visible on screen"
              className={styles["video-call-image"]}
              loading="eager"
              width="500"
              height="300"
            />
            <div
              className={styles["insight-card-container"]}
              aria-label="Interview insights preview"
            >
              <InsightSequence />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
