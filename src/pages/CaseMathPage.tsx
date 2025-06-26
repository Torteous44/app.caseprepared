import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import Lottie from "lottie-react";
import { getRandomQuestions, CaseMathQuestion, getDifficultyBasedSuccessRate } from "../data/caseMathQuestions";
import styles from "../styles/CaseMathPage.module.css";
import errorAnimation from "../assets/animations/error.json";

// Success checkmark icon from CheckoutSuccess
const CheckCircleIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#10B981"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.feedbackIcon}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// Exit icon for the exit button
const ExitIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

interface TestMetrics {
  correct: number;
  wrong: number;
  answered: number;
}

// Provocative messages for wrong answers
const wrongAnswerMessages = [
  "You may want to brush up on your case math if you're going to compete with them.",
  "Your competition probably got this right while drinking their morning coffee.",
  "This is basic math that consultants do in their sleep. Time to step up?",
  "McKinsey analysts solve these during lunch breaks. Just saying.",
  "Maybe stick to easier problems until you can handle the pressure.",
  "Your future colleagues are probably laughing at this mistake.",
  "This is exactly why some people don't make it past the first round.",
  "Even Excel could solve this faster than you just did.",
  "Hope you're better at case studies than basic arithmetic.",
  "Your calculator is judging you right now.",
  "This is the kind of mistake that ends interviews early.",
  "Maybe consulting isn't for everyone. Just a thought.",
  "Your parents' investment in your education is feeling risky right now.",
  "Time to hit the books harder than your competition is hitting theirs."
];

// Provocative messages for correct answers
const correctAnswerMessages = [
  "Not bad, but your competition got it faster.",
  "Correct, but barely. Don't get too comfortable.",
  "Right answer, but that took you way too long.",
  "Good job, though a real consultant would've done it in half the time.",
  "Accurate, but your speed needs serious work.",
  "Congrats, you can do basic math. The bar is getting lower.",
  "Right, but your celebration is premature. The hard questions are coming.",
  "Correct, but your hesitation was visible from space.",
  "Nice work, though your competition probably didn't need to think that hard.",
  "Solid answer, but let's see if you can maintain this under real pressure.",
  "Right, but that mental math speed won't impress any partners.",
  "Good, but remember: being right slowly is still wrong in consulting.",
  "Correct, though you're sweating more than someone doing basic addition should.",
  "Right answer, wrong energy. Confidence is half the battle."
];

// Consulting firm compatibility based on score
const getConsultingCompatibility = (percentage: number) => {
  if (percentage >= 80) {
    return {
      level: "MBB Potential",
      emoji: "🏆",
      message: "You're operating at elite level. McKinsey, BCG, and Bain are watching.",
      subtitle: "Time to polish that resume and practice your case studies.",
      color: "#10B981" // Green
    };
  } else if (percentage >= 60) {
    return {
      level: "Deloitte Bound",
      emoji: "📊", 
      message: "Solid Big 4 material, but the MBB dream needs more work.",
      subtitle: "You'd fit right in at Deloitte, but aim higher if you dare.",
      color: "#3B82F6" // Blue
    };
  } else if (percentage >= 40) {
    return {
      level: "Big 4 Hopeful",
      emoji: "🤞",
      message: "You've got the basics, but speed and accuracy need serious work.",
      subtitle: "PwC might give you a chance if you practice religiously.",
      color: "#F59E0B" // Orange
    };
  } else {
    return {
      level: "Netflix & Chill",
      emoji: "🛋️",
      message: "Maybe consulting isn't your calling. Have you considered other careers?",
      subtitle: "At least you're good at finding the couch. That's a skill, right?",
      color: "#EF4444" // Red
    };
  }
};

const CaseMathPage: React.FC = () => {
  const [testStarted, setTestStarted] = useState(false);
  const [questions, setQuestions] = useState<CaseMathQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const [timerWidth, setTimerWidth] = useState(0);
  const [metrics, setMetrics] = useState<TestMetrics>({ correct: 0, wrong: 0, answered: 0 });
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong'>('correct');
  const [showCompletion, setShowCompletion] = useState(false);
  const [currentSuccessRate, setCurrentSuccessRate] = useState<number>(0);
  const [currentFeedbackMessage, setCurrentFeedbackMessage] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentQuestionIndex];

  const handleStartTest = () => {
    // Prepare test data and start immediately
    setQuestions(getRandomQuestions(10));
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setMetrics({ correct: 0, wrong: 0, answered: 0 });
    setTestStarted(true);
    startTimer();
  };

  const handleExitTest = () => {
    // Clear all timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    
    // Reset all state
    setTestStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setTimeLeft(15);
    setTimerWidth(0);
    setMetrics({ correct: 0, wrong: 0, answered: 0 });
    setShowFeedback(false);
    setShowCompletion(false);
  };

  const checkAnswer = (answer: string): boolean => {
    if (!currentQuestion) return false;
    
    const userNumericAnswer = parseFloat(answer.replace(/[,$%]/g, ''));
    const correctAnswer = currentQuestion.answer;
    
    // Allow for small rounding differences (within 0.01 or 1% tolerance)
    const tolerance = Math.max(0.01, Math.abs(correctAnswer) * 0.01);
    return Math.abs(userNumericAnswer - correctAnswer) <= tolerance;
  };

  const showAnswerFeedback = (isCorrect: boolean) => {
    setFeedbackType(isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    
    // Select random provocative message
    if (isCorrect) {
      const randomMessage = correctAnswerMessages[Math.floor(Math.random() * correctAnswerMessages.length)];
      setCurrentFeedbackMessage(randomMessage);
    } else {
      const randomMessage = wrongAnswerMessages[Math.floor(Math.random() * wrongAnswerMessages.length)];
      setCurrentFeedbackMessage(randomMessage);
      
      // Generate success rate for wrong answers
      if (currentQuestion) {
        const successRate = getDifficultyBasedSuccessRate(currentQuestion.difficulty);
        setCurrentSuccessRate(successRate);
      }
    }
    
    // Update metrics
    setMetrics(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
      answered: prev.answered + 1
    }));

    // Hide feedback after different durations based on correctness
    const feedbackDuration = isCorrect ? 2000 : 2500; // 2s for correct, 2.5s for incorrect
    feedbackTimeoutRef.current = setTimeout(() => {
      setShowFeedback(false);
      proceedToNextQuestion();
    }, feedbackDuration);
  };

  const proceedToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer("");
      startTimer();
    } else {
      // Test finished - show completion dialog
      setTestStarted(false);
      setShowCompletion(true);
    }
  };

  const getPerformanceMessage = () => {
    const percentage = (metrics.correct / metrics.answered) * 100;
    if (percentage >= 80) return "Excellent work! You're ready for case interviews.";
    if (percentage >= 60) return "Good job! Keep practicing to sharpen your skills.";
    if (percentage >= 40) return "Not bad! A bit more practice will help you improve.";
    return "Keep practicing! Math speed comes with repetition.";
  };

  const handleClose = () => {
    window.location.href = "/";
  };

  const startTimer = () => {
    setTimeLeft(15);
    setTimerWidth(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    let timeRemaining = 15;
    timerRef.current = setInterval(() => {
      timeRemaining -= 0.1;
      const progress = ((15 - timeRemaining) / 15) * 100;
      setTimerWidth(progress);
      setTimeLeft(timeRemaining);

      if (timeRemaining <= 0) {
        handleTimeUp();
      }
    }, 100);
  };

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Time's up - mark as wrong and show feedback
    showAnswerFeedback(false);
  };

  const handleAnswerSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      const isCorrect = checkAnswer(userAnswer.trim());
      showAnswerFeedback(isCorrect);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.page}>
      <Navbar />
      
      <div className={styles.content}>
        <div className={styles.container}>
          {!testStarted ? (
            // Welcome Screen
            <>
              <div className={`${styles.interface} ${styles.welcomeInterface}`}>
                {/* Falling Emoji Animation */}
                <div className={styles.emojiContainer}>
                  <div className={`${styles.fallingEmoji} ${styles.emoji1}`}>🧮</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji2}`}>📊</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji3}`}>📈</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji4}`}>💼</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji5}`}>📝</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji6}`}>💰</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji7}`}>📋</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji8}`}>⏰</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji9}`}>🎯</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji10}`}>💡</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji11}`}>🔢</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji12}`}>📐</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji13}`}>✖️</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji14}`}>➕</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji15}`}>➗</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji16}`}>📏</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji17}`}>💹</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji18}`}>🧠</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji19}`}>⚡</div>
                  <div className={`${styles.fallingEmoji} ${styles.emoji20}`}>🚀</div>
                </div>

                <div className={styles.welcomeContent}>
                  <h1 className={styles.title}>
                    Practice Case Math for your Interviews
                  </h1>
                  <p className={styles.testSubtitle}>
                    10 questions. 15 seconds each.
                  </p>
                  <button 
                    className={styles.startButton}
                    onClick={handleStartTest}
                  >
                    Start the Test
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Test Interface
            currentQuestion && (
              <div className={styles.interface}>
                {/* Exit button in top right */}
                <button 
                  className={styles.exitButton}
                  onClick={handleExitTest}
                >
                  <ExitIcon />
                  Exit
                </button>

                {/* Category in top left */}
                <div className={styles.category}>
                  <span className={styles.categoryEmoji}>{currentQuestion.category.emoji}</span>
                  <span>{currentQuestion.category.name}</span>
                </div>

                {/* Question in center upper */}
                <div className={styles.question}>
                  {currentQuestion.question}
                </div>

                {/* Answer input in dead center */}
                <div className={styles.answerContainer}>
                  <input
                    type="text"
                    className={styles.answerInput}
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={handleAnswerSubmit}
                    placeholder="Enter your answer"
                    autoFocus
                    disabled={showFeedback}
                  />
                </div>

                {/* Metrics in bottom left */}
                <div className={styles.metrics}>
                  <div className={styles.metricItem}>
                    <div className={`${styles.metricValue} ${styles.correctValue}`}>
                      {metrics.correct}
                    </div>
                    <div className={styles.metricLabel}>Correct</div>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={`${styles.metricValue} ${styles.wrongValue}`}>
                      {metrics.wrong}
                    </div>
                    <div className={styles.metricLabel}>Wrong</div>
                  </div>
                  <div className={styles.metricItem}>
                    <div className={styles.metricValue}>
                      {metrics.answered}
                    </div>
                    <div className={styles.metricLabel}>Answered</div>
                  </div>
                </div>

                {/* Timer bar at bottom */}
                <div className={styles.timerContainer}>
                  <div 
                    className={styles.timerBar}
                    style={{ width: `${timerWidth}%` }}
                  />
                </div>

                {/* Feedback overlay */}
                {showFeedback && (
                  <div className={styles.feedbackOverlay}>
                    <div className={styles.feedbackContent}>
                      {feedbackType === 'correct' ? (
                        <>
                          <CheckCircleIcon />
                          <div className={`${styles.feedbackText} ${styles.feedbackCorrect}`}>
                            Correct!
                          </div>
                          <div className={styles.difficultyStatContainer}>
                            <div className={styles.difficultyMessage}>
                              {currentFeedbackMessage}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <Lottie 
                            animationData={errorAnimation} 
                            className={styles.feedbackIcon}
                            loop={false}
                          />
                          <div className={`${styles.feedbackText} ${styles.feedbackWrong}`}>
                            Wrong!
                          </div>
                          <div className={styles.correctAnswerText}>
                            Correct answer: {currentQuestion.answer.toLocaleString()}{currentQuestion.unit || ''}
                          </div>
                          <div className={styles.difficultyStatContainer}>
                            <div className={styles.difficultyPercentage}>
                              {currentSuccessRate}% of users got that question correct
                            </div>
                            <div className={styles.difficultyMessage}>
                              {currentFeedbackMessage}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
        
        {!testStarted && (
          <div className={styles.explanationSection}>
            <div className={styles.explanationContainer}>
              <div className={styles.subheading}>Master case math fundamentals</div>
              <h2 className={styles.explanationTitle}>
                Speed and accuracy under pressure
              </h2>
              <p className={styles.explanationSubtitle}>
                Practice essential calculation skills that form the foundation of successful case interview performance
              </p>
              
              <div className={styles.featuresGrid}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--blue-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17l10 5 10-5" stroke="var(--blue-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12l10 5 10-5" stroke="var(--blue-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4>Timed Practice</h4>
                  <p>15-second time limits simulate real interview pressure and help build calculation speed</p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 11H3v8h6v-8z" stroke="var(--orange-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 11h-6v8h6v-8z" stroke="var(--orange-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3H6v16h6V3z" stroke="var(--orange-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4>Real-Time Feedback</h4>
                  <p>Instant feedback with correct answers and performance insights help you learn from mistakes</p>
                </div>
                
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="var(--red-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4>Core Topics</h4>
                  <p>Revenue calculations, capacity planning, financial analysis, and essential business math</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Completion Dialog */}
      {showCompletion && (
        <div className={styles.completionOverlay}>
          <div className={styles.completionDialog}>
            <img
              src="/assets/Logo Text.svg"
              alt="Case Prepared"
              className={styles.completionLogo}
            />
            
            {(() => {
              const percentage = Math.round((metrics.correct / metrics.answered) * 100);
              const compatibility = getConsultingCompatibility(percentage);
              
              return (
                <>
                  <div className={styles.compatibilitySection}>
                    <div className={styles.compatibilityEmoji}>{compatibility.emoji}</div>
                    <h1 className={styles.compatibilityTitle} style={{ color: compatibility.color }}>
                      {compatibility.level}
                    </h1>
                    <p className={styles.compatibilityMessage}>
                      {compatibility.message}
                    </p>
                    <p className={styles.compatibilitySubtitle}>
                      {compatibility.subtitle}
                    </p>
                  </div>
                  
                  <div className={styles.resultsGrid}>
                    <div className={styles.resultItem}>
                      <div className={`${styles.resultValue} ${styles.resultCorrect}`}>
                        {metrics.correct}
                      </div>
                      <div className={styles.resultLabel}>Correct</div>
                    </div>
                    <div className={styles.resultItem}>
                      <div className={`${styles.resultValue} ${styles.resultWrong}`}>
                        {metrics.wrong}
                      </div>
                      <div className={styles.resultLabel}>Wrong</div>
                    </div>
                    <div className={styles.resultItem}>
                      <div className={styles.resultValue} style={{ color: compatibility.color }}>
                        {percentage}%
                      </div>
                      <div className={styles.resultLabel}>Score</div>
                    </div>
                  </div>
                </>
              );
            })()}
            
            <button 
              className={styles.closeButton}
              onClick={handleClose}
            >
              Take Screenshot & Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseMathPage; 