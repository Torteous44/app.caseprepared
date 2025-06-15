import React from "react";
import styles from "../../styles/resources page/CompaniesBanner.module.css";

interface CompanyLogo {
  id: number;
  src: string;
  alt: string;
}

interface CompaniesBannerProps {
  logos?: CompanyLogo[];
}

// Define company logos
const defaultLogos: CompanyLogo[] = [
  { id: 1, src: "/assets/interviewCards/Logos/Bain.svg", alt: "Bain Logo" },
  { id: 2, src: "/assets/interviewCards/Logos/Mckinsey.svg", alt: "McKinsey Logo" },
  { id: 3, src: "/assets/interviewCards/Logos/BCG.svg", alt: "BCG Logo" },
  { id: 4, src: "/assets/interviewCards/Logos/Wyman.svg", alt: "Oliver Wyman Logo" },
  { id: 5, src: "/assets/interviewCards/Logos/EY.svg", alt: "EY Logo" },
  { id: 6, src: "/assets/interviewCards/Logos/PWC.svg", alt: "PWC Logo" },
];

const CompaniesBanner: React.FC<CompaniesBannerProps> = ({ logos = defaultLogos }) => {
  // Duplicate logos for infinite scrolling effect
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className={styles["companies-banner"]}>
      <h3>Our platform has helped candidates succeed at:</h3>
      <div className={styles["scroll-container"]}>
        {/* Left gradient overlay */}
        <div className={styles["gradient-overlay-left"]}></div>

        {/* Scrolling logos */}
        <div className={styles["companies-container"]}>
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className={styles["company-item"]}
            >
              <img src={logo.src} alt={logo.alt} />
            </div>
          ))}
        </div>

        {/* Right gradient overlay */}
        <div className={styles["gradient-overlay-right"]}></div>
      </div>
    </div>
  );
};

export default CompaniesBanner; 