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
  const [pulseScale, setPulseScale] = useState(1);

  // Animate the visualizer based on speaking state and volume
  useEffect(() => {
    if (isSpeaking && isConnected) {
      // Create pulsing animation when AI is speaking
      const interval = setInterval(() => {
        setPulseScale(prev => {
          const variation = 0.1 + (volume * 0.3); // Scale based on volume
          return prev === 1 ? 1 + variation : 1;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setPulseScale(1);
    }
  }, [isSpeaking, isConnected, volume]);

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
        <div 
          className={`${styles.outerCircle} ${isSpeaking ? styles.speaking : ''}`}
          style={{ 
            transform: `scale(${pulseScale})`,
            borderColor: getStatusColor()
          }}
        >
          <div 
            className={styles.innerCircle}
            style={{ backgroundColor: getStatusColor() }}
          >
            <div className={styles.aiIcon}>
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                color="white"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Ripple effects for speaking animation */}
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
