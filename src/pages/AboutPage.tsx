import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import styles from "../styles/AboutPage.module.css";
import Footer from "../components/common/Footer";
import InterviewCardPublic from "../components/InterviewCardPublic";

// Sample interview card data
const sampleCard = {
  id: 1,
  company: "McKinsey",
  logo: "/assets/interviewCards/Logos/Mckinsey.svg",
  title: "Beautify - McKinsey Case",
  subtitle: "Official Interview",
  description:
    "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers.",
  thumbnail: "/assets/interviewCards/image@2x.webp",
  buttonText: "Try Interview",
  code: "6276",
};

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [loading, setLoading] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Following the same logic as in InterviewsPage.tsx
  const handleInterviewClick = async (card: any) => {
    setLoading((prev) => ({ ...prev, [card.id]: true }));
    setError(null);

    try {
      // For demo purposes, we'll just navigate to the interview page directly
      // In a real implementation, we'd make the API call to check if the interview exists
      navigate(`/interview/${card.id}`);
    } catch (err) {
      console.error("Error navigating to interview:", err);
      setError(err instanceof Error ? err.message : "Failed to load interview");
    } finally {
      setLoading((prev) => ({ ...prev, [card.id]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>About Case Prepared | AI-Powered Interview Training</title>
        <meta
          name="description"
          content="Learn about Case Prepared's mission to revolutionize interview preparation through AI-powered coaching and personalized feedback."
        />
        <link rel="canonical" href="https://caseprepared.com/about" />
      </Helmet>

      <div className={styles.content}>
        <div className={styles.heroContentContainer}>
          <div className={styles.headerContainer}>
            <h1 className={styles.mainHeader}>
              Helping students and graduates worldwide{" "}
              <span className={styles.highlight}>break into management consulting</span>
            </h1>
            <p className={styles.subHeader}>
              The mock-interview service of tomorrow, helping students worldwide land their dream jobs
            </p>
            <Link to="/pricing" className={styles.ctaButton}>
              Join students worldwide
            </Link>
            <div className={styles.mapContainer}>
              <img 
                src="/assets/World Map.svg" 
                alt="World Map showing global reach" 
                className={styles.worldMap}
              />
            </div>
          </div>
        </div>
        
        <div className={styles.storyContainer}>
          <div className={styles.storySection}>
            <h2 className={styles.storyHeader}>Our story</h2>
            <p className={styles.storyText}>
              We built CasePrepared because landing a consulting role requires practice, but <span className={styles.darkText}>good mock interview partners are hard to find. CasePrepared gives you full mock interviews, personalized analytics, and expert guides</span>, so you can prep with structure, track progress, and walk into every case confident.
            </p>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.estSection}>
            <p className={styles.estText}>Est. 2024</p>
            <p className={styles.estSubtext}>Helping students worldwide land their dream roles</p>
          </div>
        </div>
        
        <div className={styles.reviewsContainer}>
          <div className={styles.reviewQuote}>
            <span className={styles.blueText}>"CasePrepared was essential to my interview prep for McKinsey."</span> The consistent practice gave me the confidence to lead the case in interviews - and ultimately <span className={styles.blueText}>helped me land the offer.</span>
          </div>
          <div className={styles.reviewAttribution}>
            M. Singer, McKinsey offer (New Grad)
          </div>
        </div>
        
        <div className={styles.howItWorksSection}>
          <div className={styles.howItWorksContainer}>
            <h2 className={styles.storyHeader}>How CasePrepared Works</h2>
            <p className={styles.storyText}>
              <span className={styles.darkText}>Our AI-powered platform simulates real interview scenarios</span>, providing instant feedback on your responses. Unlike traditional methods that rely on generic advice, our system analyzes your specific answers, <span className={styles.darkText}>offering tailored recommendations for improvement.</span>
            </p>
            <p className={styles.storyText}>
              <span className={styles.darkText}>Practice at your own pace, anytime, anywhere.</span> Choose from a variety of industry-specific interview templates or customize your own. <span className={styles.darkText}>Each session is designed to challenge you with questions that match the actual interviews in your field.</span>
            </p>
            <p className={styles.storyText}>
              <span className={styles.darkText}>Track your progress over time with detailed performance analytics.</span> Identify patterns in your responses and focus your preparation on areas that need the most attention.
            </p>
            <Link to="/interviews" className={styles.ctaButton}>
              See more interviews 
            </Link>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <div className={styles.sampleCardContainer}>
            <InterviewCardPublic 
              card={sampleCard}
              loading={loading}
              onInterviewClick={handleInterviewClick}
            />
          </div>
        </div>
        
        <div className={styles.missionContainer}>
          <h2 className={styles.storyHeader}>Our Mission</h2>
          <p className={styles.storyText}>
            <span className={styles.darkText}>Case Prepared is dedicated to revolutionizing the way professionals prepare for interviews.</span> Our platform combines artificial intelligence with proven interview techniques to <span className={styles.darkText}>provide personalized, interactive practice experiences that boost confidence and improve outcomes.</span>
          </p>
          <div className={styles.logoContainer}>
            <img 
              src="/assets/Logo Text.svg" 
              alt="CasePrepared Logo" 
              className={styles.logoImage}
            />
          </div>
        </div>

        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaHeader}>Ready to land your dream job?</h2>
          <p className={styles.ctaText}>Join students worldwide using CasePrepared</p>
          <Link to="/pricing" className={styles.ctaButton}>
            Join today
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
