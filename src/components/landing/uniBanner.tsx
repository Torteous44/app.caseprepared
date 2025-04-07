import React from "react";
import styles from "../../styles/UniBanner.module.css";

interface UniLogo {
  id: number;
  src: string;
  alt: string;
}

interface UniBannerProps {
  logos?: UniLogo[];
}

// Define university logos
const defaultLogos: UniLogo[] = [
  { id: 1, src: "/assets/uniBanner/Penn.avif", alt: "University Logo 1" },
  { id: 2, src: "/assets/uniBanner/Harvard.avif", alt: "University Logo 2" },
  { id: 3, src: "/assets/uniBanner/Stanford.avif", alt: "University Logo 3" },
  { id: 4, src: "/assets/uniBanner/Dartmouth.avif", alt: "University Logo 4" },
  { id: 5, src: "/assets/uniBanner/Oxford.avif", alt: "University Logo 5" },
  { id: 6, src: "/assets/uniBanner/Bocconi.avif", alt: "University Logo 6" },
  { id: 7, src: "/assets/uniBanner/Wharton.avif", alt: "University Logo 7" },
  { id: 8, src: "/assets/uniBanner/IE.avif", alt: "University Logo 8" },
];

const UniBanner: React.FC<UniBannerProps> = ({ logos = defaultLogos }) => {
  // Duplicate logos for infinite scrolling effect
  const duplicatedLogos = [...logos, ...logos];

  return (
    <div className={styles["uni-banner"]}>
      <h3>Trusted by students at top universities</h3>
      <div className={styles["scroll-container"]}>
        {/* Left gradient overlay */}
        <div className={styles["gradient-overlay-left"]}></div>

        {/* Scrolling logos */}
        <div className={styles["universities-container"]}>
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className={styles["university-item"]}
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

export default UniBanner;
