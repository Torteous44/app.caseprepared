import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Pricing.module.css";
import { useAuth } from "../contexts/AuthContext";

import PricingCardNew from "../components/Pricing/PricingCardNew";
import { BookOpen, BarChart2, Compass, Star } from "lucide-react";
import Footer from "../components/common/Footer";

const Pricing: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Check if user has an active subscription using the subscription data
  const hasSubscription = user?.subscription?.is_active || false;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.titleBlue}>Start landing offers today</span>,
          through AI case interview practice
        </h1>
        <p>Choose the plan that best fits your preparation needs.</p>
      </div>

      <div className={styles.newCardsContainer}>
        <PricingCardNew type="left" />
        <PricingCardNew type="right" />
      </div>

      <div className={styles.pricingGrid}>
        <div className={styles.leftContent}>
          <h2 className={styles.leftHeader}>Unlock all features</h2>
          <p className={styles.leftSubheader}>
            CasePrepared gives you everything you need to master consulting
            interviews, from full-length mocks to performance analytics. All in
            one platform built for aspiring consultants.
          </p>

          <ul className={styles.featureList}>
            <li className={styles.featureListItem}>
              <BookOpen className={styles.featureIcon} />
              <div>
                <span className={styles.featureTitle}>Full Case Library:</span>{" "}
                Access a growing library of structured mock interviews, modeled
                on real consulting firm case styles.
              </div>
            </li>
            <li className={styles.featureListItem}>
              <BarChart2 className={styles.featureIcon} />
              <div>
                <span className={styles.featureTitle}>
                  Performance Reports:
                </span>{" "}
                Track your progress with insights on speed, accuracy, and
                framework completeness, so you always know what to improve
                before your next interview.
              </div>
            </li>
            <li className={styles.featureListItem}>
              <Compass className={styles.featureIcon} />
              <div>
                <span className={styles.featureTitle}>
                  Guided Walkthroughs:
                </span>{" "}
                Don't just practice — learn. Each case comes with detailed
                frameworks, benchmark answers, and step-by-step guidance to help
                you internalize what great looks like.
              </div>
            </li>
          </ul>
        </div>

        <div className={styles.rightContent}>
          <Link to="/interviews">
            <div className={styles.caseCard}>
              <div className={styles.caseHeader}>
                <img
                  src="/assets/interviewCards/Logos/BCG.svg"
                  alt="BCG Logo"
                  className={styles.caseLogo}
                />
                <span className={styles.officialLabel}>Official Interview</span>
              </div>
              <div className={styles.caseImage}>
                <img
                  src="/assets/interviewCards/image@2x-1.webp"
                  alt="Climate Case Interview"
                  className={styles.caseImg}
                />
              </div>
              <div className={styles.caseContent}>
                <h3 className={styles.caseTitle}>Climate Case - BCG Case</h3>
                <p className={styles.caseDescription}>
                  The CEO of a global company wants to reduce their
                  environmental impact. Build the business case for setting a
                  climate target and determine what initiatives to undertake to
                  achieve it.
                </p>
                <div className={styles.buttonWrapper}>
                  <Link to="/interviews" className={styles.mockButton}>
                    Mock Interview <span className={styles.arrowIcon}>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className={styles.testimonialsSection}>
        <h2 className={styles.testimonialsTitle}>
          Still not convinced? Don't take our word for it.
        </h2>
        <div className={styles.testimonialsGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
            </div>
            <p className={styles.testimonialText}>
              "CasePrepared completely transformed my interview preparation. The
              AI feedback was incredibly detailed and helped me identify
              weaknesses I didn't even know I had."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>AC</div>
              <div className={styles.authorInfo}>
                <p className={styles.authorName}>A.C</p>
                <p className={styles.authorTitle}>BEL Consultant at Bain</p>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
            </div>
            <p className={styles.testimonialText}>
              "As someone with no consulting background, I was struggling with
              case interviews. The guided walkthroughs and performance analytics
              gave me the structure I needed."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>JR</div>
              <div className={styles.authorInfo}>
                <p className={styles.authorName}>J.R</p>
                <p className={styles.authorTitle}>Consultant at BCG</p>
              </div>
            </div>
          </div>

          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
              <Star className={styles.starIcon} fill="#FFD700" />
            </div>
            <p className={styles.testimonialText}>
              "The variety of case types and the detailed feedback helped me
              prepare for any scenario. I went from failing my first interviews
              to receiving multiple offers."
            </p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.authorAvatar}>SG</div>
              <div className={styles.authorInfo}>
                <p className={styles.authorName}>S.GS</p>
                <p className={styles.authorTitle}>Consultant at Bain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
