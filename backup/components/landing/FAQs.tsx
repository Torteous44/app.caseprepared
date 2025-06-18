import React, { useState } from "react";
import styles from "../../styles/landing page/FAQs.module.css";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQs: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: "What is the purpose of this mock interview system?",
      answer:
        "Our system is designed to simulate real consulting interviews, helping you practice and refine your responses across technical, behavioral, and case interview formats. It offers both quantitative scores and qualitative feedback to guide your improvement.",
    },
    {
      question: "How does the system provide real-time feedback?",
      answer:
        "The platform uses advanced NLP and tone analysis to monitor both what you say and how you say it. As you speak, the system analyzes your response for structure, clarity, and delivery, then provides immediate hints and coaching tips—such as suggestions to reduce filler words or to structure your answer more clearly.",
    },
    {
      question: "How is my data secured and used?",
      answer:
        "We take privacy and data security seriously. Your audio and transcript data are used solely to generate personalized feedback during your session and are stored temporarily in secure, ephemeral caches. Any persistent data, like performance logs, is anonymized and stored in compliance with industry-standard security protocols.",
    },
    {
      question: "What happens after I sign up and pay?",
      answer:
        "You'll be able to get started with your CasePrepared subscription as soon as you've completed your payment. We'll also send you a confirmation email with your paid invoice attached. Once you're in, you'll be able to enjoy your subscriber benefits right away. You'll get access to all of our premium cases and analysis services.",
    },
  ];

  const toggleItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Frequently Asked Questions</h2>
      <div className={styles.faqList}>
        {faqItems.map((item, index) => (
          <div
            key={index}
            className={`${styles.faqItem} ${
              expandedIndex === index ? styles.expanded : ""
            }`}
          >
            <div className={styles.question} onClick={() => toggleItem(index)}>
              <h3>{item.question}</h3>
              <div className={styles.arrow}>
                <svg
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 1L7 7L13 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div className={styles.answer}>
              <p>{item.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
