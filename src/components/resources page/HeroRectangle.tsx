import React, { useState, useEffect } from "react";
import styles from "../../styles/resources page/HeroRectangle.module.css";

const HeroRectangle: React.FC = () => {
  const texts = [
    "Let's begin the case",
    "Can you walk me through...",
    "How would you approach...",
    "Tell me what the company should..."
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start exit animation
      setIsVisible(false);
      
      // Wait longer before changing text to allow complete fade out
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
        // Add small delay before starting enter animation
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }, 600); // Longer exit duration
      
    }, 2000); // Slower text changes - every 4 seconds

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className={styles.container}>
      <div className={styles.backgroundRectangle}>
        <div className={styles.wireframeElement1} />
        <div className={styles.wireframeElement2} />
        <div className={styles.wireframeElement3} />
        <div className={styles.wireframeElement4} />
      </div>
      
      <div className={styles.rectangle}>
        <div className={styles.aiLabel}>CasePrepared AI</div>
        
        <div className={styles.logoContainer}>
          <img src="/assets/Logo.png" alt="Logo" className={styles.logo} />
        </div>
        
        <div className={styles.textContainer}>
          <div 
            key={currentIndex}
            className={`${styles.textTag} ${isVisible ? styles.visible : styles.hidden}`}
          >
            {texts[currentIndex]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroRectangle; 