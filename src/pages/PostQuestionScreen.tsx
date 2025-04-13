import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "../styles/PostQuestionScreen.module.css";
import { useAuth } from "../contexts/AuthContext";

// API base URL defined in AuthContext
const API_BASE_URL = "https://casepreparedcrud.onrender.com";

interface LocationState {
  title?: string;
  questionNumber?: number;
  nextQuestionNumber?: number;
  totalQuestions?: number;
  isAllCompleted?: boolean;
  completedQuestions?: number[];
}

const PostQuestionScreen: React.FC = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const locationState = (location.state || {}) as LocationState;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionNumber = locationState.questionNumber || 1;
  const nextQuestionNumber =
    locationState.nextQuestionNumber || questionNumber + 1;
  const totalQuestions = locationState.totalQuestions || 4;
  const completedQuestions = locationState.completedQuestions || [];
  const isAllCompleted =
    locationState.isAllCompleted || questionNumber >= totalQuestions;
  const interviewTitle = locationState.title || "Case Interview";

  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    if (!interviewId) {
      console.error("No interview ID found in URL parameters");
      setError("Interview ID is missing. Please try again.");
      return;
    }

    // Log the data received from the previous screen
    console.log("PostQuestionScreen received state:", {
      interviewId,
      questionNumber,
      nextQuestionNumber,
      totalQuestions,
      completedQuestions:
        completedQuestions.length > 0 ? completedQuestions : "none",
      isAllCompleted,
      title: interviewTitle,
    });
  }, [
    isAuthenticated,
    navigate,
    interviewId,
    questionNumber,
    nextQuestionNumber,
    totalQuestions,
    completedQuestions,
    isAllCompleted,
    interviewTitle,
  ]);

  const handleNextQuestion = async () => {
    setIsLoading(true);
    setError(null);

    if (!interviewId) {
      setError("Interview ID is missing. Cannot continue to next question.");
      setIsLoading(false);
      return;
    }

    try {
      console.log(
        `Starting next question (${nextQuestionNumber}) for interview ${interviewId}`
      );

      // Navigate to the next question session
      navigate(`/interview/authenticated-session/${interviewId}`, {
        state: {
          title: interviewTitle,
          questionNumber: nextQuestionNumber,
        },
      });
    } catch (err) {
      console.error("Error advancing to next question:", err);
      setError("Failed to advance to the next question. Please try again.");
      setIsLoading(false);
    }
  };

  const handleBackToInterview = () => {
    navigate(`/my-interview/${interviewId}`);
  };

  // Calculate progress percentage based on completed questions
  const calculateProgress = () => {
    const completedCount = completedQuestions.length;
    return Math.round((completedCount / totalQuestions) * 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Question {questionNumber} Completed</h1>
        <p className={styles.subtitle}>Review your performance</p>
      </div>

      <div className={styles.analyticsContainer}>
        <div className={styles.analyticsCard}>
          <h2>Question Analysis</h2>
          <p className={styles.placeholderText}>
            Analytics for this question will appear here in a future update.
          </p>
          <div className={styles.placeholderChart}>
            <div
              className={styles.placeholderBar}
              style={{ height: "60%" }}
            ></div>
            <div
              className={styles.placeholderBar}
              style={{ height: "80%" }}
            ></div>
            <div
              className={styles.placeholderBar}
              style={{ height: "40%" }}
            ></div>
            <div
              className={styles.placeholderBar}
              style={{ height: "70%" }}
            ></div>
          </div>
        </div>
      </div>

      <div className={styles.progressInfo}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
        <span>
          Question {questionNumber}/{totalQuestions} Complete
        </span>
        <div className={styles.completedQuestions}>
          {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
            (num) => (
              <div
                key={num}
                className={`${styles.questionIndicator} ${
                  completedQuestions.includes(num) ? styles.completed : ""
                }`}
              >
                {num}
              </div>
            )
          )}
        </div>
      </div>

      <div className={styles.buttonsContainer}>
        {!isAllCompleted ? (
          <button
            className={styles.primaryButton}
            onClick={handleNextQuestion}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : `Start Question ${nextQuestionNumber}`}
          </button>
        ) : (
          <div className={styles.congratsMessage}>
            <h2>Congratulations!</h2>
            <p>You've completed all questions in this interview.</p>
          </div>
        )}

        <button
          className={styles.secondaryButton}
          onClick={handleBackToInterview}
        >
          Back to Interview Screen
        </button>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default PostQuestionScreen;
