import React, { useEffect, useState } from "react";
import styles from "../../styles/AudioVisualizer.module.css";

interface AudioVisualizerProps {
  isConnected: boolean;
  isSpeaking: boolean;
  volume?: number;
  status?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isConnected,
  isSpeaking,
  volume = 0,
  status = "disconnected"
}) => {
  const [circleScale, setCircleScale] = useState(1);

  // Determine if user is speaking (not AI speaking but has volume)
  const isUserSpeaking = !isSpeaking && isConnected && volume > 0.2;

  // Animate circle based on user speaking volume
  useEffect(() => {
    if (isUserSpeaking) {
      // User is speaking - scale the main circle based on volume
      const interval = setInterval(() => {
        // Scale circle based on volume (subtle scaling)
        const volumeScale = 1 + (volume - 0.2) * 0.2; // Convert 0.2-1.0 volume to 1.0-1.16 scale
        setCircleScale(Math.min(volumeScale, 1.3)); // Cap at 1.3x scale
      }, 50); // Frequent updates for responsiveness

      return () => clearInterval(interval);
    } else {
      // Reset scale when not user speaking
      setCircleScale(1);
    }
  }, [isUserSpeaking, volume]);

  const getStatusText = () => {
    if (!isConnected) return "Connecting...";
    if (isSpeaking) return "AI is speaking";
    return "Listening...";
  };

  const getStatusColor = () => {
    if (!isConnected) return "#fbbf24"; // Yellow
    if (isSpeaking) return "#3b82f6"; // Blue
    return "#10b981"; // Green
  };

  return (
    <div className={styles.container}>
      <div className={styles.visualizerWrapper}>
        {/* Main Circle - scales when user speaks, static when AI speaks */}
        <div 
          className={styles.mainCircle}
          style={{ 
            backgroundColor: getStatusColor(),
            transform: `scale(${circleScale})`,
            transition: isSpeaking ? 'none' : 'transform 0.1s ease'
          }}
        />

        {/* Ripple effects - only show when AI is speaking, originate from main circle */}
        {isSpeaking && (
          <>
            <div className={`${styles.ripple} ${styles.ripple1}`} />
            <div className={`${styles.ripple} ${styles.ripple2}`} />
            <div className={`${styles.ripple} ${styles.ripple3}`} />
          </>
        )}
      </div>

      <div className={styles.statusContainer}>
        <div 
          className={styles.statusDot}
          style={{ backgroundColor: getStatusColor() }}
        />
        <span className={styles.statusText}>{getStatusText()}</span>
      </div>

      <div className={styles.brandingContainer}>
        <span className={styles.brandingText}>CasePrepared AI Interview</span>
      </div>
    </div>
  );
};

export default AudioVisualizer;
