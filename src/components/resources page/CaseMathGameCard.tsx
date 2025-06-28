import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/resources page/CaseMathGameCard.module.css";

const CaseMathGameCard: React.FC = () => {
  return (
    <section className={styles.gameSection}>
      <div className={styles.container}>
        <div className={styles.gameCard}>
          <div className={styles.cardContent}>
            <div className={styles.leftContent}>
              <div className={styles.badge}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.badgeIcon}
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                  <line x1="9" y1="9" x2="9.01" y2="9"></line>
                  <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
                Practice Tool
              </div>
              
              <h3 className={styles.title}>Case Math Brain Game</h3>
              
              <p className={styles.description}>
                Test your speed and accuracy with essential case math problems. Practice calculations under pressure with timed questions.
              </p>
            </div>
            
            <div className={styles.rightContent}>
              <Link to="/casemath-braingame" className={styles.playButton}>
                Start Practice
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CaseMathGameCard; 