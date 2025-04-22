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
    title: "Beautify - McKinsey Case",
    description:
      "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers.",
    duration: "20m",
    official: "Official McKinsey Consulting Case practice",
    code: "C05A",
  },
  "2": {
    id: 2,
    company: "BCG",
    title: "Climate Case - BCG Case",
    description:
      "The CEO of a global company wants to reduce their environmental impact. Build the business case for setting a climate target and determine what initiatives to undertake to achieve it.",
    duration: "25m",
    official: "Official BCG Consulting Case practice",
    code: "C396",
  },
  "3": {
    id: 3,
    company: "Bain",
    title: "Coffee Shop Co. - Bain Case",
    description:
      "A specialty coffee company wants to accelerate growth. Identify key market opportunities, evaluate profitability levers, and recommend a strategy to expand their footprint.",
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
          "Our client is Beautify. Beautify has approached McKinsey for help with exploring new ways to approach its customers.",
      },
      {
        heading: "Situation description",
        content:
          "Beautify is a global prestige cosmetics company that sells its products mainly inside high-end department stores such as Harrods and Shanghai No. 1. It also has a presence online with specialty retailers like Sephora. Beautify produces a number of makeup, fragrance, and skin care products sold under several different brands.",
        subContent:
          "In department stores, beauty consultants play a critical role with consumers:",
        listItems: [
          'approaching "passive" customers',
          "demonstrating their knowledge of the products",
          "actively selling the products",
          "maintaining a loyal customer base of repeat buyers",
        ],
        additionalContent:
          "These consultants are hired directly by Beautify or through specialist, third-party agencies that find new recruits for a fee. Beautify is then responsible for selecting, training, and paying the consultants. Within Beautify, beauty consultants are managed independently by each brand in each country. For example, this may mean a consultant might be part of the Chanel team in a store. However, consumers are shifting more to online shopping, and too many beauty consultants are left working in empty department stores.",
      },
    ],
  },
  bcg: {
    title: "About this Case",
    sections: [
      {
        heading: "Introduction",
        content:
          "Our client is a global consumer goods company. The company's products include a wide variety of personal care products (e.g., hair care, skin care, cosmetics). The client's CEO feels strongly that her company needs to develop a plan to reduce its environmental impact and do its part in the fight against climate change, and has engaged BCG to help her create a business case for setting a science-based target to reduce the company's impact and determine what initiatives to undertake to achieve that target.",
      },
      {
        heading: "Context",
        content:
          "Science-based targets provide a clearly-defined pathway for companies to reduce greenhouse gas emissions, helping prevent the worst impacts of climate change and future-proof business growth.",
        additionalContent:
          "Targets are considered science based if they are in line with what the latest climate science deems necessary to meet the goals of the Paris Agreement – limiting global warming to well-below 2°C above pre-industrial levels and pursuing efforts to limit warming to 1.5°C.",
      },
    ],
  },
  bain: {
    title: "About this Case",
    sections: [
      {
        heading: "Introduction",
        content:
          "You're having lunch with an old friend from university, and she's looking for some business advice. She is thinking of opening a coffee shop in Cambridge, England, a large university city an hour and a half away from London.",
      },
      {
        heading: "The Challenge",
        content:
          "She sees potential in this business but wants your help in determining whether opening a coffee shop is a good idea. Cambridge is a vibrant city with a large student population, but it also has a competitive coffee shop market with both local and national chains.",
      },
      {
        heading: "What to Consider",
        content:
          "As you help your friend evaluate this opportunity, consider factors such as market demand, competition, location options, startup costs, operational requirements, and potential revenue streams. Your analysis should help determine if this venture is viable and what strategy would give it the best chance of success.",
      },
    ],
  },
};

// Demo questions for each interview type
const demoQuestions: { [key: string]: QuestionData[] } = {
  profitability: [
    {
      id: 1,
      title: "Problem Structuring",
      description:
        "Structure the problem to identify key factors affecting beauty consultants' effectiveness.",
      status: "current",
    },
    {
      id: 2,
      title: "Data Analysis",
      description:
        "Analyze customer behavior and preferences for virtual vs in-store interactions.",
      status: "current",
    },
    {
      id: 3,
      title: "Strategy Development",
      description:
        "Develop recommendations for beauty consultants in a digital environment.",
      status: "current",
    },
    {
      id: 4,
      title: "Implementation Plan",
      description:
        "Create an implementation roadmap for training beauty consultants.",
      status: "current",
    },
  ],
  "market-entry": [
    {
      id: 1,
      title: "Environmental Impact Analysis",
      description:
        "Assess the company's current environmental footprint and identify key impact areas.",
      status: "current",
    },
    {
      id: 2,
      title: "Target Setting",
      description:
        "Determine appropriate science-based targets for emissions reduction.",
      status: "current",
    },
    {
      id: 3,
      title: "Initiative Prioritization",
      description:
        "Identify and prioritize initiatives to achieve the climate targets.",
      status: "current",
    },
    {
      id: 4,
      title: "Business Case Development",
      description:
        "Build a business case for climate action including costs and benefits.",
      status: "current",
    },
  ],
  merger: [
    {
      id: 1,
      title: "Market Assessment",
      description:
        "Evaluate the coffee shop market in Cambridge and identify growth opportunities.",
      status: "current",
    },
    {
      id: 2,
      title: "Competitor Analysis",
      description:
        "Analyze existing coffee shops and identify competitive advantages.",
      status: "current",
    },
    {
      id: 3,
      title: "Financial Modeling",
      description: "Develop financial projections for the coffee shop venture.",
      status: "current",
    },
    {
      id: 4,
      title: "Location Strategy",
      description: "Determine optimal locations and expansion strategy.",
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
