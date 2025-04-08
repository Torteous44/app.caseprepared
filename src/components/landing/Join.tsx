import React from "react";
import styles from "../../styles/landing page/Join.module.css";
import { useModal } from "../../contexts/ModalContext";

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.25 6.375L5.25 9.375L9.75 2.625"
      stroke="#E9C46A"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

const Join: React.FC = () => {
  const { openModal } = useModal();

  const uniLogos = [
    "/assets/uniLogos/image.svg",
    "/assets/uniLogos/image-1.svg",
    "/assets/uniLogos/image-2.svg",
    "/assets/uniLogos/image-3.svg",
    "/assets/uniLogos/image-4.svg",
    "/assets/uniLogos/image-5.svg",
    "/assets/uniLogos/image-6.svg",
    "/assets/uniLogos/image-7.svg",
    "/assets/uniLogos/image-8.svg",
  ];

  const handleJoinClick = () => {
    openModal("register");
  };

  return (
    <section className={styles["join-section"]}>
      <h2 className={styles["join-title"]}>
        Join the Membership and Ace Your Interviews
      </h2>
      <p className={styles["join-subtitle"]}>
        Become a member for only $40/m. Trusted by students from universities
        worldwide.
      </p>

      <div className={styles["join-container"]}>
        <div className={styles["membership-side"]}>
          <div className={styles["membership-card"]}>
            <div className={styles["card-header"]}>
              <span className={styles["membership-label"]}>
                CasePrepared Membership
              </span>
              <div>
                <span className={styles["price"]}>$40.00*</span>
                <span className={styles["per-month"]}>per month</span>
              </div>
              <p className={styles["trial-text"]}>*Free for the first 7 days</p>
            </div>

            <ul className={styles["feature-list"]}>
              <li className={styles["feature-item"]}>
                <CheckIcon /> 100+ mock interviews from official sources
              </li>
              <li className={styles["feature-item"]}>
                <CheckIcon /> Real time interview insights to track your
                performance
              </li>
              <li className={styles["feature-item"]}>
                <CheckIcon /> AI powered analysis after an interview completes
              </li>
              <li className={styles["feature-item"]}>
                <CheckIcon /> Direct access to professionals
              </li>
            </ul>

            <button className={styles["cta-button"]} onClick={handleJoinClick}>
              Become a member
            </button>
          </div>
        </div>

        <div className={styles["universities-side"]}>
          <div className={styles["university-logos"]}>
            {uniLogos.map((logo, index) => (
              <div
                key={index}
                className={`${styles["logo-container"]} ${
                  styles[`logo-${index + 1}`]
                }`}
              >
                <img
                  src={logo}
                  alt={`University Logo ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
          <h3 className={styles["university-title"]}>
            Join hundreds of students from top universities worldwide
          </h3>
        </div>
      </div>
    </section>
  );
};

export default Join;
