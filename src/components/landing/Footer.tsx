import React from "react";
import styles from "../../styles/landing page/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.mainContent}>
        <div className={styles.logoSection}>
          <img
            src="/assets/Logo Text.svg"
            alt="Case Prepared Logo"
            className={styles.logoSmall}
          />
          <p className={styles.tagline}>
            Crack the case and land your dream role today.
          </p>
          <a
            href="mailto:contact@caseprepared.com"
            className={styles.emailLink}
          >
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.emailIconMinimal}
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"
                fill="#666"
              />
            </svg>
          </a>
        </div>

        <div className={styles.linksContainer}>
          <div className={styles.linkColumn}>
            <h3>Sections</h3>
            <ul>
              <li>
                <a href="/about">About us</a>
              </li>
              <li>
                <a href="/interviews">Mock Interviews</a>
              </li>
              <li>
                <a href="/blogs">CasePrepared Blog</a>
              </li>
            </ul>
          </div>

          <div className={styles.linkColumn}>
            <h3>Resources</h3>
            <ul>
              <li>
                <a href="mailto:contact@caseprepared.com">Contact us</a>
              </li>
            </ul>
          </div>

          <div className={styles.linkColumn}>
            <h3>Other</h3>
            <ul>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms and Conditions</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className={styles.footerContent}>
        <a
          href="https://pavlosnetwork.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.companyLink}
        >
          A Pavlos Company
        </a>
      </div>
    </footer>
  );
};

export default Footer;
