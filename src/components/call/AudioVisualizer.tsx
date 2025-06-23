import React, { useEffect, useRef } from "react";
import { motion, useSpring, useTransform, useMotionValue, useAnimationFrame } from "motion/react";
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
  // Motion values for better performance
  const volumeMotionValue = useMotionValue(0);
  const timeRef = useRef(0);
  
  // Determine if user is speaking (not AI speaking but has volume)
  // Increased threshold for better detection
  const isUserSpeaking = !isSpeaking && isConnected && volume > 0.1;

  // Use transform to derive scale from volume - more declarative and performant
  const baseScale = useTransform(
    volumeMotionValue, 
    [0, 0.1, 1], 
    [1, 1, 1.25]
  );
  
  // Spring animation for smooth scaling
  const scale = useSpring(baseScale, { 
    stiffness: 200, 
    damping: 15,
    mass: 0.8
  });

  // Use useAnimationFrame instead of requestAnimationFrame
  useAnimationFrame(() => {
    // Smooth interpolation of volume
    const targetVolume = volume;
    const currentVolume = volumeMotionValue.get();
    
    // Smooth interpolation with different factors for AI vs user
    const lerpFactor = isSpeaking ? 0.25 : 0.15; 
    const newVolume = currentVolume + (targetVolume - currentVolume) * lerpFactor;
    
    volumeMotionValue.set(newVolume);

    // Add organic movement when user is speaking
    if (isUserSpeaking) {
      timeRef.current += 0.02;
      
      // Create subtle, organic movement
      const volumeIntensity = Math.max(0, newVolume - 0.1);
      const normalizedIntensity = Math.min(volumeIntensity / 0.9, 1);
      
      // Calculate organic variation
      const organicVariation = Math.sin(timeRef.current * 3.7) * 0.03 + 
                              Math.cos(timeRef.current * 2.3) * 0.02;
      
      // Apply organic variation to scale
      const finalScale = 1 + (normalizedIntensity * 0.25) + organicVariation;
      baseScale.set(Math.min(finalScale, 1.3));
    } else if (isSpeaking) {
      // AI is speaking - use fixed scale
      baseScale.set(1);
    } else {
      // No one is speaking - return to base scale
      baseScale.set(1);
      timeRef.current = 0;
    }
  });


  const getStatusColor = () => {
    return "#174EA6"; // Always blue
  };

  // Transform volume to status dot scale
  const statusDotScale = useTransform(
    volumeMotionValue,
    [0, 1],
    [1, 1.3],
    { clamp: true }
  );

  // For debugging
  const debugText = isUserSpeaking ? "User Speaking" : (isSpeaking ? "AI Speaking" : "Silent");

  return (
    <div className={styles.container}>
      <div className={styles.visualizerWrapper}>
        {/* Main Circle with organic motion */}
        <motion.div 
          className={styles.mainCircle}
          style={{ 
            backgroundColor: getStatusColor(),
            scale
          }}
        />

        {/* Ripple effects - only show when AI is speaking */}
        {isSpeaking && (
          <>
            <div className={`${styles.ripple} ${styles.ripple1}`} />
            <div className={`${styles.ripple} ${styles.ripple2}`} />
            <div className={`${styles.ripple} ${styles.ripple3}`} />
          </>
        )}
      </div>


      
      {/* Debug info - only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
          <div>Status: {status}</div>
          <div>Volume: {volume.toFixed(2)}</div>
          <div>Speaking: {debugText}</div>
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer;
