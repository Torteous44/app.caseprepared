import React from 'react';
import InsightCard from '../components/landing/InsightCard';
import LongPopup from '../components/landing/LongPopup';
import ChatInsights from '../components/ChatInsights';
import styles from '../styles/Playground.module.css';

// Icons for the components
const DrilldownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

const TimeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

const Playground: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Component Playground</h1>
      
      <section className={styles.section}>
        <h2>ChatInsights Examples</h2>
        <div className={styles.cardGrid}>
          <ChatInsights
            text="Insights: Use MECE to structure: split analysis into internal (operations) and external (competition) factors."
            strokeColor="#0066FF"
          />
          <ChatInsights
            text="Insights: Time check - 2 minutes remaining. Focus on key recommendations."
            strokeColor="#FF6B00"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>InsightCard Examples</h2>
        <div className={styles.cardGrid}>
          <InsightCard
            message="Drilldown: Great analysis! You've identified the key drivers of cost reduction."
            strokeColor="#0066FF"
            icon={<DrilldownIcon />}
          />
          <InsightCard
            message="Time: Watch your pacing. Try to be more concise in your responses."
            strokeColor="#FF6B00"
            icon={<TimeIcon />}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>LongPopup Examples</h2>
        <div className={styles.cardGrid}>
          <LongPopup
            category="Analysis"
            text="Your framework is well structured and comprehensive."
            strokeColor="#0066FF"
            icon={<DrilldownIcon />}
          />
          <LongPopup
            category="Time Management"
            text="2 minutes remaining, start wrapping up your conclusion."
            strokeColor="#FF6B00"
            icon={<TimeIcon />}
          />
        </div>
      </section>
    </div>
  );
};

export default Playground; 