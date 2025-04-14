import { Check } from "lucide-react"
import styles from "./PricingCard.module.css"
import { useModal } from "../../contexts/ModalContext"
import { useAuth } from "../../contexts/AuthContext"
import { useNavigate } from "react-router-dom"

export default function PricingCard() {
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    if (isAuthenticated) {
      // If authenticated, navigate to subscription page
      navigate("/subscription");
    } else {
      // If not authenticated, open registration modal
      openModal("register");
    }
  };

  return (
    <div className={styles.pricingCard}>
      {/* Header section */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <span className={styles.titleBlue}>CasePrepared</span>{" "}
            <span className={styles.titleGold}>Premium</span>
          </h2>
          <p className={styles.subtitle}>Our most popular plan</p>
        </div>
        <div className={styles.price}>
          <span className={styles.priceAmount}>€40.00</span>
          <span className={styles.pricePeriod}>/mo</span>
        </div>
      </div>

      {/* Features section */}
      <div className={styles.featuresSection}>
        <p className={styles.featuresTitle}>Everything you need to succeed:</p>

        <div className={styles.featuresGrid}>
          {/* Left column features */}
          <div className={styles.featureColumn}>
            <Feature text="100+ mock interviews" />
            <Feature text="Real time interview insights" />
            <Feature text="AI powered performance reviews" />
          </div>

          {/* Right column features */}
          <div className={styles.featureColumn}>
            <Feature text="Direct access to professionals" />
            <Feature text="Personalized feedback" />
            <Feature text="Interview preparation resources" />
          </div>
        </div>

        <div className={styles.trialText}>*Not happy? Cancel anytime</div>

        {/* CTA Button */}
        <div className={styles.ctaSection}>
          <button className={styles.ctaButton} onClick={handleSubscribe}>
            {isAuthenticated ? "Subscribe Now" : "Become a member"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className={styles.feature}>
      <div className={styles.checkIcon}>
        <Check size={16} color="white" />
      </div>
      <span className={styles.featureText}>{text}</span>
    </div>
  )
} 