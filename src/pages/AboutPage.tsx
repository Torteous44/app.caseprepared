import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/AboutPage.module.css";

const AboutPage = () => {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Track mouse position with RAF for smoother performance
    let rafId: number | null = null;
    let currentX = 50;
    let currentY = 50;
    let targetX = 50;
    let targetY = 50;

    const updateSpotlight = () => {
      // Smooth interpolation for more natural movement
      currentX = currentX + (targetX - currentX) * 0.1;
      currentY = currentY + (targetY - currentY) * 0.1;

      // Apply the updated position
      header.style.setProperty("--mouse-x", `${currentX}%`);
      header.style.setProperty("--mouse-y", `${currentY}%`);

      rafId = requestAnimationFrame(updateSpotlight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = header.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate position percentages relative to the header
      targetX = (x / rect.width) * 100;
      targetY = (y / rect.height) * 100;

      // Start animation loop if not already running
      if (rafId === null) {
        rafId = requestAnimationFrame(updateSpotlight);
      }
    };

    const handleMouseLeave = () => {
      // Slowly return to center when mouse leaves
      targetX = 50;
      targetY = 50;
    };

    header.addEventListener("mousemove", handleMouseMove);
    header.addEventListener("mouseleave", handleMouseLeave);

    // Start with centered position
    rafId = requestAnimationFrame(updateSpotlight);

    return () => {
      header.removeEventListener("mousemove", handleMouseMove);
      header.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header} ref={headerRef}>
        <div className={styles.spotlight}></div>
        <h1 className={styles.title}>About Case Prepared</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            Interview AI is dedicated to revolutionizing the way professionals
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
            What sets Interview AI apart is our real-time coaching feature. As
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
            Interview AI was developed by a team of hiring managers, career
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
