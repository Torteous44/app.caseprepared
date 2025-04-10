import React, { useState, useEffect } from "react";
import styles from "../../styles/resources page/ResourcesHero.module.css";
import "../../styles.css"; // Import global styles for CSS variables
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

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

interface ResourcesHeroProps {
  title?: string;
  description?: string;
  metaDescription?: string;
}

const ResourcesHero: React.FC<ResourcesHeroProps> = ({
  title = "Consulting interview preparation that works",
  description = "Access our curated collection of frameworks, case examples, and AI-powered practice interviews designed to help you excel in consulting case interviews at top firms.",
  metaDescription = "Get expert consulting interview preparation resources, frameworks, and practice cases for McKinsey, BCG, Bain and other top consulting firms. Prepare with our AI-powered interview platform.",
}) => {
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

  const titleWithHighlight = title.replace(
    "preparation that works",
    "<span class='" + styles.highlight + "'>preparation that works</span>"
  );

  return (
    <>
      <Helmet>
        <title>Consulting Resources | ConsultAI</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content="consulting resources, consulting frameworks, case interview preparation, McKinsey, BCG, Bain, interview practice, consulting cases"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Consulting Interview Resources",
            description: metaDescription,
            provider: {
              "@type": "Organization",
              name: "ConsultAI",
              sameAs: window.location.origin,
            },
            offers: {
              "@type": "Offer",
              category: "Consulting Interview Preparation",
            },
          })}
        </script>
      </Helmet>
      <section className={styles.hero} aria-labelledby="resources-heading">
        <div className={styles.content}>
          <header className={styles.leftColumn}>
            <h1
              id="resources-heading"
              className={styles.title}
              dangerouslySetInnerHTML={{ __html: titleWithHighlight }}
            ></h1>
            <p className={styles.description}>{description}</p>
            <div className={styles.ctaContainer}>
              <Link to="/interviews">
                <button
                  className={styles.ctaButton}
                  aria-label="Start a consulting practice interview"
                >
                  Try a Practice Interview
                </button>
              </Link>
            </div>
          </header>

          <div className={styles.rightColumn}>
            <p className={styles.subtitle}>
              Our platform has helped candidates succeed at:
            </p>
            <div
              className={styles.logoGrid}
              role="list"
              aria-label="Partner consulting firms"
            >
              {allLogos.map((logo, index) => (
                <img
                  key={index}
                  src={logo}
                  alt={`${getCompanyName(logo)} consulting firm logo`}
                  className={styles.logo}
                  loading="lazy"
                  width="100"
                  height="50"
                  role="listitem"
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
    </>
  );
};

export default ResourcesHero;
