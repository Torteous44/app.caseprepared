import React, { useState, useEffect } from 'react';
import LongPopup from './LongPopup';
import styles from '../../styles/LongPopupSequence.module.css';

// Reuse icons from InsightSequence
const TimeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const StructureIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
  </svg>
);

const DrilldownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

const popups = [
  {
    id: 1,
    category: "Structure",
    text: "Organize your ideas more clearly.",
    strokeColor: "#00C853", // Green
    icon: <StructureIcon />
  },
  {
    id: 2,
    category: "Time",
    text: "2 minutes remaining, start wrapping up.",
    strokeColor: "#FF6B00", // Orange
    icon: <TimeIcon />
  },
  {
    id: 3,
    category: "Drilldown",
    text: "Drive the case more. Be confident.",
    strokeColor: "#0066FF", // Blue
    icon: <DrilldownIcon />
  }
];

const LongPopupSequence: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Initial delay before starting the sequence
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const cyclePopups = () => {
      setIsAnimating(true);
      
      // Show the current popup
      setTimeout(() => {
        setIsAnimating(false);
        
        // Keep the current popup visible for a while
        setTimeout(() => {
          // Hide the current popup
          setIsAnimating(true);
          
          // Move to the next popup after hiding
          setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % popups.length);
            setIsAnimating(false);
          }, 500); // Time for exit animation
        }, 4000); // Time to keep visible
      }, 500); // Time for entrance animation
    };

    const interval = setInterval(cyclePopups, 5000); // Total cycle time
    
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const currentPopup = popups[currentIndex];
  
  return (
    <div className={`${styles.popupSequence} ${isAnimating ? styles.animating : ''}`}>
      <LongPopup 
        category={currentPopup.category}
        text={currentPopup.text}
        strokeColor={currentPopup.strokeColor}
        icon={currentPopup.icon}
      />
    </div>
  );
};

export default LongPopupSequence; 