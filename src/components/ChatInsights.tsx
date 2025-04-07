import React from 'react';
import styles from '../styles/ChatInsights.module.css';

interface ChatInsightsProps {
  text: string;
  strokeColor: string;
}

const ChatInsights: React.FC<ChatInsightsProps> = ({
  text,
  strokeColor = '#0066FF'
}) => {
  // Split the text into "Insights" label and the actual message
  const [label, message] = text.split(': ');

  return (
    <div className={styles.insightsContainer}>
      <div 
        className={styles.insightsBubble}
        style={{ 
          borderColor: strokeColor,
          '--stroke-color': strokeColor
        } as React.CSSProperties}
      >
        <div className={styles.insightsRow}>
          <span className={styles.iconWrapper} style={{ color: strokeColor }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 67 67"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M27.3946 44.3987L25.125 52.3438L22.8554 44.3987C22.2688 42.3464 21.1689 40.4774 19.6596 38.9682C18.1504 37.4589 16.2814 36.359 14.2291 35.7724L6.28125 33.5L14.2263 31.2304C16.2786 30.6438 18.1476 29.5439 19.6568 28.0346C21.1661 26.5254 22.266 24.6564 22.8526 22.6041L25.125 14.6563L27.3946 22.6013C27.9812 24.6536 29.0811 26.5226 30.5904 28.0318C32.0996 29.5411 33.9686 30.641 36.0209 31.2276L43.9688 33.5L36.0237 35.7696C33.9714 36.3562 32.1024 37.4561 30.5932 38.9654C29.0839 40.4746 27.984 42.3436 27.3974 44.3959L27.3946 44.3987ZM50.973 24.3294L50.25 27.2188L49.527 24.3294C49.1131 22.6728 48.2568 21.1598 47.0497 19.9521C45.8425 18.7445 44.3299 17.8876 42.6734 17.473L39.7813 16.75L42.6734 16.027C44.3299 15.6124 45.8425 14.7555 47.0497 13.5479C48.2568 12.3402 49.1131 10.8272 49.527 9.17063L50.25 6.28125L50.973 9.17063C51.3871 10.8276 52.2438 12.3408 53.4515 13.5485C54.6592 14.7562 56.1724 15.6129 57.8294 16.027L60.7188 16.75L57.8294 17.473C56.1724 17.8871 54.6592 18.7438 53.4515 19.9515C52.2438 21.1592 51.3871 22.6724 50.973 24.3294ZM47.1624 57.4162L46.0625 60.7188L44.9626 57.4162C44.6542 56.4911 44.1347 55.6506 43.4452 54.9611C42.7557 54.2715 41.9151 53.752 40.99 53.4437L37.6875 52.3438L40.99 51.2438C41.9151 50.9355 42.7557 50.416 43.4452 49.7265C44.1347 49.0369 44.6542 48.1964 44.9626 47.2713L46.0625 43.9688L47.1624 47.2713C47.4708 48.1964 47.9903 49.0369 48.6798 49.7265C49.3693 50.416 50.2099 50.9355 51.135 51.2438L54.4375 52.3438L51.135 53.4437C50.2099 53.752 49.3693 54.2715 48.6798 54.9611C47.9903 55.6506 47.4708 56.4911 47.1624 57.4162Z" 
                stroke="currentColor" 
                strokeWidth="5.58333" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.label} style={{ color: strokeColor }}>
            {label}:
          </span>
          <span className={styles.message}>
            {message}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInsights; 