import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/Interviews.module.css";

interface InterviewCard {
  id: number;
  company: string;
  logo: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail: string;
  buttonText: string;
}

interface InterviewsProps {
  cards?: InterviewCard[];
}

const defaultCards: InterviewCard[] = [
  {
    id: 1,
    company: "McKinsey",
    logo: "/assets/interviewCards/logos/McKinsey.svg",
    title: "Beautify - McKinsey Case",
    subtitle: "Official Interview",
    description:
      "Evaluating whether a global beauty products company should be training in-store beauty consultants in the effective use of virtual channels to connect with customers.",
    thumbnail: "/assets/interviewCards/image@2x.webp",
    buttonText: "Mock Interview",
  },
  {
    id: 2,
    company: "BCG",
    logo: "/assets/interviewCards/logos/BCG.svg",
    title: "Climate Case - BCG Case",
    subtitle: "Official Interview",
    description:
      "The CEO of a global company wants to reduce their carbon footprint more than business-wise for selling a certain target and determine what initiatives to undertake to achieve it.",
    thumbnail: "/assets/interviewCards/image@2x-1.webp",
    buttonText: "Mock Interview",
  },
  {
    id: 3,
    company: "Bain",
    logo: "/assets/interviewCards/logos/Bain.svg",
    title: "Coffee Shop Co",
    subtitle: "Official Interview",
    description:
      "A specialty coffee shop chain experiencing profitability issues. Let's explore the root causes and develop a strategy to improve profitability levels, and support the founder's vision.",
    thumbnail: "/assets/interviewCards/image@2x-2.webp",
    buttonText: "Mock Interview",
  },
];

const Interviews: React.FC<InterviewsProps> = ({ cards = defaultCards }) => {
  return (
    <div className={styles["interviews-section"]}>
      <h2>
        Prep using only the best interviews from top consulting companies.
      </h2>
      <p className={styles["interviews-subtitle"]}>
        Practice with only real cases from the best companies.
      </p>

      <div className={styles["interviews-container"]}>
        {cards.map((card) => (
          <Link to={`/interview/${card.id}`} key={card.id}>
            <div key={card.id} className={styles["interview-card"]}>
              <div className={styles["card-header"]}>
                <div className={styles["logo-container"]}>
                  <img src={card.logo} alt={`${card.company} logo`} />
                </div>
                <p className={styles["card-tag"]}>{card.subtitle}</p>
              </div>

              <div className={styles["thumbnail-container"]}>
                <img src={card.thumbnail} alt={card.title} />
              </div>

              <div className={styles["card-body"]}>
                <h3 className={styles["card-title"]}>{card.title}</h3>
                <p className={styles["card-description"]}>{card.description}</p>
                <div className={styles["button-container"]}>
                  <Link
                    to={`/interview/${card.id}`}
                    className={styles["interview-button"]}
                  >
                    {card.buttonText}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 12L10 8L6 4"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Interviews;
