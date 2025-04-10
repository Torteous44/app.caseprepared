import React, { useState, useEffect } from "react";
import styles from "../../styles/resources page/ResourcesHero.module.css";
import "../../styles.css"; // Import global styles for CSS variables
import { Link } from "react-router-dom";

// Use the correct paths to the SVG logos
const allLogos = [
  "/assets/interviewCards/Logos/Bain.svg",
  "/assets/interviewCards/Logos/Mckinsey.svg",
  "/assets/interviewCards/Logos/BCG.svg",
  "/assets/interviewCards/Logos/Wyman.svg",
  "/assets/interviewCards/Logos/EY.svg",
  "/assets/interviewCards/Logos/PWC.svg",
];

// Helper function to extract company name from path
const getCompanyName = (path: string): string => {
  const parts = path.split("/");
  return parts[parts.length - 1].split(".")[0];
};

const ResourcesHero: React.FC = () => {
  const [loadedLogos, setLoadedLogos] = useState<{ [key: string]: boolean }>(
    {}
  );

  // Preload all SVG images
  useEffect(() => {
    allLogos.forEach((logoPath) => {
      const img = new Image();
      img.onload = () => {
        setLoadedLogos((prev) => ({
          ...prev,
          [logoPath]: true,
        }));
      };
      img.onerror = (e) => {
        console.error(`Failed to load logo: ${logoPath}`, e);
        setLoadedLogos((prev) => ({
          ...prev,
          [logoPath]: false,
        }));
      };
      img.src = logoPath;
    });
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.leftColumn}>
          <h1 className={styles.title}>
            Consulting interview{" "}
            <span className={styles.highlight}>preparation that works</span>
          </h1>
          <p className={styles.description}>
            Access our curated collection of frameworks, case examples, and
            industry insights designed to help you excel in consulting case
            interviews at top firms.
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
          <p className={styles.subtitle}>
            Our platform has helped candidates succeed at:
          </p>
          <div className={styles.logoGrid}>
            {allLogos.map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt={`${getCompanyName(logo)} Logo`}
                className={styles.logo}
                loading="lazy"
                onError={(e) => {
                  // Fallback handling if image fails to load
                  (e.target as HTMLImageElement).style.display = "none";
                  console.error(`Error loading logo: ${logo}`);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesHero;
