import React, { useState, useEffect, useCallback, useRef } from "react";
import InsightCard from "./InsightCard";
import styles from "../../styles/InsightSequence.module.css";

interface Insight {
  id: number;
  message: string;
  strokeColor: string;
  icon: React.ReactNode;
}

// Time icon
const TimeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

// Grid/Structure icon
const StructureIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
  </svg>
);

// Drilldown/Analysis icon
const DrilldownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

const insights: Insight[] = [
  {
    id: 1,
    message:
      "Drilldown: Missed opportunity. You identified the issue, now drive into root causes to show real insight.",
    strokeColor: "#0066FF",
    icon: <DrilldownIcon />,
  },
  {
    id: 2,
    message:
      "Structure: You missed a key branch. Try using MECE to break this down more completely and clearly.",
    strokeColor: "#00C853",
    icon: <StructureIcon />,
  },
  {
    id: 3,
    message:
      "Time: Your answers are too long. Keep your communication crisp, aim for clarity in 2–3 sentences max.",
    strokeColor: "#FF6B00",
    icon: <TimeIcon />,
  },
];

const ANIMATION_DURATION = 500;
const DISPLAY_DURATION = 3000;
const CYCLE_DURATION = 4000;
const INITIAL_DELAY = 1000;

const InsightSequence: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const safeSetState = useCallback((setter: Function) => {
    if (mountedRef.current) {
      setter();
    }
  }, []);

  const cycleInsights = useCallback(() => {
    if (!mountedRef.current) return;

    safeSetState(() => setIsAnimating(true));

    timeoutRef.current = setTimeout(() => {
      safeSetState(() => setIsAnimating(false));

      timeoutRef.current = setTimeout(() => {
        safeSetState(() => setIsAnimating(true));

        timeoutRef.current = setTimeout(() => {
          safeSetState(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % insights.length);
            setIsAnimating(false);
          });
        }, ANIMATION_DURATION);
      }, DISPLAY_DURATION);
    }, ANIMATION_DURATION);
  }, [safeSetState]);

  useEffect(() => {
    mountedRef.current = true;

    timeoutRef.current = setTimeout(() => {
      safeSetState(() => {
        setIsVisible(true);
        setIsInitialized(true);
      });
    }, INITIAL_DELAY);

    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers, safeSetState]);

  useEffect(() => {
    if (!isVisible || !isInitialized) return;

    cycleInsights();
    intervalRef.current = setInterval(cycleInsights, CYCLE_DURATION);

    return () => clearTimers();
  }, [isVisible, isInitialized, cycleInsights, clearTimers]);

  // Handle component visibility changes (e.g., tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimers();
      } else if (isInitialized) {
        cycleInsights();
        intervalRef.current = setInterval(cycleInsights, CYCLE_DURATION);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isInitialized, cycleInsights, clearTimers]);

  if (!isVisible || !insights.length) return null;

  const currentInsight = insights[currentIndex];

  return (
    <div
      className={`${styles.insightSequence} ${
        isAnimating ? styles.animating : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <InsightCard
        message={currentInsight.message}
        strokeColor={currentInsight.strokeColor}
        icon={currentInsight.icon}
      />
    </div>
  );
};

export default InsightSequence;
