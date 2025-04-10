import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import styles from "../styles/AboutPage.module.css";

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // JSON-LD structured data for better SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Case Prepared",
    url: "https://caseprepared.com",
    logo: "https://caseprepared.com/assets/Logo.png",
    description:
      "Case Prepared helps professionals master their interviews through personalized AI-powered practice.",
    sameAs: [
      "https://twitter.com/caseprepared",
      "https://linkedin.com/company/caseprepared",
    ],
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>About Case Prepared | AI-Powered Interview Training</title>
        <meta
          name="description"
          content="Learn about Case Prepared's mission to revolutionize interview preparation through AI-powered coaching and personalized feedback."
        />
        <meta
          name="keywords"
          content="interview preparation, AI coaching, interview practice, career development"
        />
        <link rel="canonical" href="https://caseprepared.com/about" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://caseprepared.com/about" />
        <meta
          property="og:title"
          content="About Case Prepared | AI-Powered Interview Training"
        />
        <meta
          property="og:description"
          content="Learn about Case Prepared's mission to revolutionize interview preparation through AI-powered coaching and personalized feedback."
        />
        <meta
          property="og:image"
          content="https://caseprepared.com/assets/about-preview.png"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://caseprepared.com/about" />
        <meta
          property="twitter:title"
          content="About Case Prepared | AI-Powered Interview Training"
        />
        <meta
          property="twitter:description"
          content="Learn about Case Prepared's mission to revolutionize interview preparation through AI-powered coaching and personalized feedback."
        />
        <meta
          property="twitter:image"
          content="https://caseprepared.com/assets/about-preview.png"
        />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className={styles.header}>
        <h1 className={styles.title}>About Us</h1>
        <p className={styles.subtitle}>
          We're on a mission to help professionals master their interviews
          through personalized AI-powered practice.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            Case Prepared is dedicated to revolutionizing the way professionals
            prepare for interviews. Our platform combines artificial
            intelligence with proven interview techniques to provide
            personalized, interactive practice experiences that boost confidence
            and improve outcomes.
          </p>
        </div>

        <div className={styles.section}>
          <h2>How It Works</h2>
          <p>
            Our AI-powered platform simulates real interview scenarios,
            providing instant feedback on your responses. Unlike traditional
            methods that rely on generic advice, our system analyzes your
            specific answers, offering tailored recommendations for improvement.
          </p>
          <p>
            Practice at your own pace, anytime, anywhere. Choose from a variety
            of industry-specific interview templates or customize your own. Each
            session is designed to challenge you with questions that match the
            actual interviews in your field.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Real-Time Coaching</h2>
          <p>
            What sets Case Prepared apart is our real-time coaching feature. As
            you practice, our AI provides immediate guidance on your delivery,
            content, and overall presentation. This instant feedback loop
            accelerates your learning curve and helps you refine your responses
            on the spot.
          </p>
          <p>
            Track your progress over time with detailed performance analytics.
            Identify patterns in your responses and focus your preparation on
            areas that need the most attention.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Developed by Experts</h2>
          <p>
            Case Prepared was developed by a team of hiring managers, career
            coaches, and AI specialists who understand what makes a successful
            interview. Our algorithms are trained on thousands of real
            interviews and continuously updated to reflect the latest hiring
            trends.
          </p>
        </div>

        <div className={styles.ctaSection}>
          <h2>Ready to land your dream job?</h2>
          <Link to="/" className={styles.button}>
            Try an Interview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
