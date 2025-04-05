import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/InterviewPage.module.css";
import axios from "axios";

interface InterviewData {
  id: number | string;
  company: string;
  title: string;
  description: string;
  duration: string;
  official: string;
  code: string;
}

// Hardcoded interview data
const interviewsData: { [key: string]: InterviewData } = {
  "1": {
    id: 1,
    company: "McKinsey",
    title: "Beautify - McKinsey Case",
    description:
      "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers.",
    duration: "20m",
    official: "Official McKinsey Consulting Case practice",
    code: "6276",
  },
  "2": {
    id: 2,
    company: "BCG",
    title: "Climate Case - BCG Case",
    description:
      "The CEO of a global company wants to reduce their environmental impact. Build the business case for setting a climate target and determine what initiatives to undertake to achieve it.",
    duration: "25m",
    official: "Official BCG Consulting Case practice",
    code: "A72B",
  },
  "3": {
    id: 3,
    company: "Bain",
    title: "Coffee Shop Co. - Bain Case",
    description:
      "A specialty coffee company wants to accelerate growth. Identify key market opportunities, evaluate profitability levers, and recommend a strategy to expand their footprint.",
    duration: "22m",
    official: "Official Bain Consulting Case practice",
    code: "3DE0",
  },
};

// Map codes to interview IDs
const codeToId: { [key: string]: string } = {
  "6276": "1",
  A72B: "2",
  "3DE0": "3",
};

const BASE_URL = "https://demobackend-p2e1.onrender.com";

const InterviewPage: React.FC = () => {
  const { id, code } = useParams<{ id?: string; code?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};

  // Determine which interview to show based on params or state
  const [interview, setInterview] = useState<InterviewData | null>(() => {
    // If we have location state with card data, use that
    if (locationState.card) {
      const cardCode = locationState.card.code;
      const cardId = codeToId[cardCode];
      return cardId ? interviewsData[cardId] : null;
    }

    // If we have a code param, use hardcoded data
    if (code) {
      const mappedId = codeToId[code];
      return mappedId ? interviewsData[mappedId] : null;
    }

    // If we have an id param, use hardcoded data
    if (id) {
      return interviewsData[id] || null;
    }

    return null;
  });

  // Keep track of the actual backend ID
  const [backendId, setBackendId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStatus, setMediaStatus] = useState<{
    video: boolean;
    audio: boolean;
    error?: string;
  }>({
    video: false,
    audio: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);

  // Fetch just the interview ID if needed
  useEffect(() => {
    if (interview && !backendId) {
      const fetchInterviewId = async () => {
        setIsLoading(true);
        try {
          // Only fetch the backend ID using the code
          const response = await fetch(
            `${BASE_URL}/interviews/code/${interview.code}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to load interview ID");
          }

          const data = await response.json();
          setBackendId(data.id);
        } catch (err) {
          console.error("Error fetching interview ID:", err);
          setStartError(
            err instanceof Error ? err.message : "Failed to load interview ID"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchInterviewId();
    }
  }, [interview]);

  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setMediaStatus({ video: true, audio: true });
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setMediaStatus({
          video: false,
          audio: false,
          error:
            "Could not access camera or microphone. Please allow permissions.",
        });
      }
    };

    setupMedia();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleStartInterview = async () => {
    if (!interview) {
      setStartError("Interview data is missing.");
      return;
    }

    // Use the backendId if available, otherwise use the interview code
    const interviewIdToUse = backendId || interview.code;

    if (!interviewIdToUse) {
      setStartError("Interview ID is missing.");
      return;
    }

    setIsLoading(true);
    setStartError(null);

    try {
      // Stop the local stream to release camera/mic before navigation
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const response = await fetch(`${BASE_URL}/sessions/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interview_id: interviewIdToUse,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to start session");
      }

      if (!data.id) {
        throw new Error("No session ID received");
      }

      // Navigate to the correct session route
      navigate(`/interview/session/${data.id}`, {
        state: {
          title: interview.title,
        },
      });
    } catch (error: any) {
      console.error("Failed to start session:", error);
      setStartError(
        error instanceof Error
          ? error.message
          : "Failed to start the interview session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !interview) {
    return <div className={styles.container}>Loading interview data...</div>;
  }

  if (!interview) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>
          {startError || "Interview not found"}
        </div>
        <Link to="/interviews" className={styles.backLink}>
          Back to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumbs}>
        <Link to="/interviews">Mock interviews</Link>
        <span className={styles.separator}>&gt;</span>
        <span>{interview.title.split(" - ")[0]}</span>
      </div>

      <h1 className={styles.title}>{interview.title}</h1>

      <div className={styles.tags}>
        <span className={styles.duration}>{interview.duration}</span>
        <span className={styles.official}>{interview.official}</span>
      </div>

      <div className={styles.interviewLayout}>
        <div className={styles.cameraContainer}>
          <div className={styles.camera}>
            {mediaStatus.error ? (
              <div className={styles.cameraError}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"
                    fill="#FF4D4F"
                  />
                </svg>
                <p>{mediaStatus.error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className={styles.retryButton}
                >
                  Retry
                </button>
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={styles.videoFeed}
              />
            )}
          </div>
          <p className={styles.cameraInstructions}>
            {mediaStatus.video && mediaStatus.audio
              ? "Camera and microphone are ready!"
              : "Please enable your microphone and camera."}
          </p>
        </div>

        <div className={styles.interviewInfo}>
          <h2 className={styles.aboutTitle}>Ready to Join?</h2>

          <div className={styles.userAvatar}>
            <div className={styles.avatar}></div>
          </div>

          <button
            className={styles.startButton}
            disabled={!mediaStatus.video || !mediaStatus.audio || isLoading}
            onClick={handleStartInterview}
          >
            {isLoading ? "Starting..." : "Start Interview"}
          </button>

          {startError && <p className={styles.startError}>{startError}</p>}

          <div className={styles.aboutSection}>
            <h3>About this interview</h3>
            <p>{interview.description}</p>
            <a href="#" className={styles.officialLink}>
              Official mock interview from {interview.company}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
