import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/InterviewPage.module.css";

interface InterviewData {
  id: number | string;
  company: string;
  title: string;
  description: string;
  duration: string;
  official: string;
  code: string;
}

interface CaseSection {
  heading: string;
  content: string;
  subContent?: string;
  listItems?: string[];
  additionalContent?: string;
}

interface CaseContent {
  title: string;
  sections: CaseSection[];
}

interface CaseContentMap {
  [key: string]: CaseContent;
}

// Question interface for question cards
interface QuestionData {
  id: number;
  title: string;
  description: string;
  status: "completed" | "current" | "locked";
}

// Hardcoded interview data
const interviewsData: { [key: string]: InterviewData } = {
  "1": {
    id: 1,
    company: "McKinsey",
    title: "Premier Oil - McKinsey Case",
    description:
      "The pandemic-induced collapse in oil prices has sharply reduced profitability of a major UK-based offshore oil producer. Design a profitability improvement plan focusing on cost reduction strategies.",
    duration: "20m",
    official: "Official McKinsey Consulting Case practice",
    code: "C05A",
  },
  "2": {
    id: 2,
    company: "BCG",
    title: "Betacer Market Entry - BCG Case",
    description:
      "A major U.S. electronics manufacturer is considering entering the video-game market given low growth in various electronics segments. Evaluate whether this market entry strategy is wise.",
    duration: "25m",
    official: "Official BCG Consulting Case practice",
    code: "C396",
  },
  "3": {
    id: 3,
    company: "Bain",
    title: "Henderson Electric - Bain Case",
    description:
      "An industrial air conditioning company has low sales of their IoT monitoring software despite strong overall revenue. Develop a growth strategy to boost software sales and overcome market adoption barriers.",
    duration: "22m",
    official: "Official Bain Consulting Case practice",
    code: "7F23",
  },
};

// Map codes to interview IDs
const codeToId: { [key: string]: string } = {
  "6276": "1",
  A72B: "2",
  "3DE0": "3",
  // Demo interview codes
  profitability: "1",
  "market-entry": "2",
  merger: "3",
};

// Map interview IDs to demo types
const idToDemoType: { [key: string]: string } = {
  "1": "market-entry",
  "2": "merger",
  "3": "profitability",
};

const BASE_URL = "https://casepreparedcrud.onrender.com";
const DEMO_API_BASE_URL = "https://casepreparedcrud.onrender.com/api/v1/demo"; // Demo API base URL

// Case-specific content
const caseContent: CaseContentMap = {
  mckinsey: {
    title: "About this Case",
    sections: [
      {
        heading: "Client goal",
        content:
          "Our client is Premier Oil, a major UK-based offshore upstream oil and gas producer. The pandemic-induced collapse in oil prices has sharply reduced their profitability, and the CEO has brought in a team to design a profitability improvement plan.",
      },
      {
        heading: "Situation description",
        content:
          "Premier Oil operates rigs in seven areas in the North Sea. The company has assets only in the North Sea and doesn't plan to adjust its portfolio. Their profitability for 2020 was -12% (losses), which was common in the industry that year.",
        subContent: "Additional context:",
        listItems: [
          "No specific profitability improvement goal has been provided",
          "Client is an independent oil and gas company owned by various strategic investors",
          "The company needs to focus on cost reduction as there's limited opportunity to increase sales",
          "Maintenance costs for offshore platforms have been increasing",
        ],
        additionalContent:
          "Given the limited ability to impact revenue, cost management will be a key focus area for improving profitability.",
      },
    ],
  },
  bcg: {
    title: "About this Case",
    sections: [
      {
        heading: "Client goal",
        content:
          "Our client is Betacer, a major U.S. electronics manufacturer that offers laptop and desktop PCs, tablets, smartphones, monitors, projectors and cloud solutions. Given low growth in various electronics segments, they are considering entering the U.S. video-game market and need advice on whether this is wise.",
      },
      {
        heading: "Market context",
        content:
          "The U.S. video-game market was worth $41B in 2020, while the global market was $175B and grew rapidly that year. The market is fragmented with many major players.",
        additionalContent:
          "The client wants payback within 2 years after market entry and plans to target the mass market, not hardcore gamers. We need to evaluate if entering this market aligns with their capabilities and financial goals.",
      },
    ],
  },
  bain: {
    title: "About this Case",
    sections: [
      {
        heading: "Client goal",
        content:
          "Our client is Henderson Electric, a company that offers industrial air conditioning units, maintenance services, and Internet-of-Things (IoT) enabled software to monitor system functionality in real-time. While overall sales are $1B, their software revenue remains low, and the CEO has hired a team to design a revenue growth plan to boost sales of their IoT-enabled software.",
      },
      {
        heading: "Business context",
        content:
          "The client's software alerts customers on system issues and maintenance needs. Importantly, their software works with equipment from other manufacturers as well, not just their own.",
      },
      {
        heading: "Market situation",
        content:
          "Henderson Electric serves diverse facilities including food processing, medicine production, computer chip manufacturing, and other industrial settings. Out of 16,000 large manufacturing facilities in the U.S., only 4,000 have adopted software to monitor their air conditioning units. Understanding barriers to adoption will be critical for developing growth strategies.",
      },
    ],
  },
};

// Demo questions for each interview type
const demoQuestions: { [key: string]: QuestionData[] } = {
  // For Bain Coffee Shop case
  profitability: [
    {
      id: 1,
      title: "Opening",
      description:
        "Understand Henderson Electric's IoT software and the challenge of low software sales.",
      status: "current",
    },
    {
      id: 2,
      title: "Structuring Analysis",
      description:
        "Structure an approach to analyze the low sales of Henderson's software and develop recommendations.",
      status: "current",
    },
    {
      id: 3,
      title: "Growth Strategy",
      description:
        "Develop strategies to help Henderson Electric increase the sales of their monitoring software.",
      status: "current",
    },
    {
      id: 4,
      title: "Market Adoption Analysis",
      description:
        "Analyze why many manufacturing facilities haven't adopted software monitoring for their air conditioning units.",
      status: "current",
    },
  ],
  // For McKinsey Beautify case
  "market-entry": [
    {
      id: 1,
      title: "Opening",
      description:
        "Understand Premier Oil's profitability challenge after pandemic-induced collapse in oil prices.",
      status: "current",
    },
    {
      id: 2,
      title: "Initial Structuring",
      description:
        "Structure an approach to analyze Premier Oil's profitability improvement opportunities.",
      status: "current",
    },
    {
      id: 3,
      title: "Cost Breakdown",
      description:
        "Identify Premier Oil's major expense categories to focus cost reduction efforts.",
      status: "current",
    },
    {
      id: 4,
      title: "Maintenance Cost Analysis",
      description:
        "Analyze key drivers behind increasing maintenance costs for offshore platforms.",
      status: "current",
    },
  ],
  // For BCG Climate case
  merger: [
    {
      id: 1,
      title: "Opening",
      description:
        "Understand Betacer's interest in entering the U.S. video-game market given low growth in electronics segments.",
      status: "current",
    },
    {
      id: 2,
      title: "Market Entry Assessment",
      description:
        "Structure an approach to assess whether Betacer should enter the video-game market.",
      status: "current",
    },
    {
      id: 3,
      title: "Customer Adoption",
      description:
        "Identify key factors that would drive customer adoption in the video-game market.",
      status: "current",
    },
    {
      id: 4,
      title: "Synergy Analysis",
      description:
        "Evaluate potential synergies Betacer could capture by entering the video-game market.",
      status: "current",
    },
  ],
};

const InterviewPage: React.FC = () => {
  const { id, company } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const isDemo = locationState.isDemo || false;
  const demoType = locationState.demoType || null;

  // Determine which interview to show based on params or state
  const [interview, setInterview] = useState<InterviewData | null>(() => {
    // If we have location state with card data, use that
    if (locationState.card) {
      const cardCode = locationState.card.code;
      const cardId = codeToId[cardCode];
      return cardId ? interviewsData[cardId] : null;
    }

    // If we have a code param, use hardcoded data
    if (company) {
      const mappedId = codeToId[company];
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

  // Track token loading state for each question
  const [questionTokenLoading, setQuestionTokenLoading] = useState<
    Record<string, boolean>
  >({});
  const [questionTokenError, setQuestionTokenError] = useState<string | null>(
    null
  );

  // Fetch just the interview ID if needed
  useEffect(() => {
    if (interview && !backendId && !isDemo) {
      // For demo mode, just use a fake backend ID
      setBackendId("demo-" + interview.id);
      setIsLoading(false);
    }
  }, [interview, isDemo]);

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

    setIsLoading(true);
    setStartError(null);

    try {
      // Stop the local stream to release camera/mic before navigation
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // All interviews are treated as demo interviews
      const demoTypeToUse = demoType || idToDemoType[interview.id.toString()];

      if (!demoTypeToUse) {
        throw new Error("Invalid demo interview type");
      }

      // For demo interviews, we don't need to create a session first
      // Instead, we directly navigate to the RealtimeConnect component
      navigate(`/interview/demo-session/${demoTypeToUse}`, {
        state: {
          title: interview.title,
          questionNumber: 1, // Explicitly start with the first question
          demoType: demoTypeToUse,
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

  // Get questions for the current interview
  const getQuestionsForInterview = (): QuestionData[] => {
    if (!interview) return [];

    const interviewId = interview.id.toString();
    const demoTypeForInterview = idToDemoType[interviewId];

    if (!demoTypeForInterview) return [];

    return demoQuestions[demoTypeForInterview] || [];
  };

  // Start a specific question
  const handleStartQuestion = async (questionNumber: number) => {
    if (!interview) {
      setQuestionTokenError("Interview data is missing.");
      return;
    }

    const demoTypeToUse = demoType || idToDemoType[interview.id.toString()];
    if (!demoTypeToUse) {
      setQuestionTokenError("Invalid demo interview type");
      return;
    }

    // Set loading state for this question
    setQuestionTokenLoading((prev) => ({ ...prev, [questionNumber]: true }));
    setQuestionTokenError(null);

    try {
      // Stop the local stream to release camera/mic before navigation
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Navigate to the correct demo session with the specific question number
      navigate(`/interview/demo-session/${demoTypeToUse}`, {
        state: {
          title: interview.title,
          questionNumber: questionNumber,
          demoType: demoTypeToUse,
        },
      });
    } catch (error: any) {
      console.error("Failed to start question:", error);
      setQuestionTokenError(
        error instanceof Error ? error.message : "Failed to start the question"
      );
    } finally {
      setQuestionTokenLoading((prev) => ({ ...prev, [questionNumber]: false }));
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
                style={{ transform: "scaleX(-1)" }}
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
            <img
              src="/assets/Logo.avif"
              alt="Case Prepared Logo"
              className={styles.logo}
            />
          </div>

          <button
            className={styles.startButton}
            disabled={!mediaStatus.video || !mediaStatus.audio || isLoading}
            onClick={handleStartInterview}
          >
            {isLoading ? "Starting..." : "Start Question 1"}
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

      <div className={styles.interviewDetails}>
        <h3>
          {caseContent[
            interview.company.toLowerCase() as keyof typeof caseContent
          ]?.title || "About this Case"}
        </h3>

        {caseContent[
          interview.company.toLowerCase() as keyof typeof caseContent
        ]?.sections.map((section, index) => (
          <div key={index}>
            <h4>{section.heading}</h4>
            <p>{section.content}</p>
            {section.subContent && (
              <>
                <p>{section.subContent}</p>
                <ul>
                  {section.listItems?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            {section.additionalContent && <p>{section.additionalContent}</p>}
          </div>
        ))}
      </div>

      {/* Question Cards Section */}
      <div className={styles.questionCardsSection}>
        <h3>Case Questions</h3>
        <p>Practice individual questions from this case</p>

        <div className={styles.questionCards}>
          {getQuestionsForInterview().map((question) => (
            <div
              key={question.id}
              className={`${styles.questionCard} ${
                styles[`status-${question.status}`]
              }`}
            >
              <div className={styles.questionCardHeader}>
                <span className={styles.questionNumber}>
                  Question {question.id}
                </span>
                <span className={styles.questionStatus}>
                  {question.status === "completed"
                    ? "Completed"
                    : question.status === "current"
                    ? "Available"
                    : "Locked"}
                </span>
              </div>

              <h4 className={styles.questionTitle}>{question.title}</h4>
              <p className={styles.questionDescription}>
                {question.description}
              </p>

              <button
                className={styles.startQuestionButton}
                onClick={() => handleStartQuestion(question.id)}
                disabled={questionTokenLoading[question.id]}
              >
                {questionTokenLoading[question.id]
                  ? "Starting..."
                  : "Start Question"}
              </button>
            </div>
          ))}
        </div>

        {questionTokenError && (
          <div className={styles.tokenError}>{questionTokenError}</div>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
