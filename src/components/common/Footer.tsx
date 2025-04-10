import React from "react";
import styles from "../../styles/common/Footer.module.css";

export interface FooterProps {
  tagline?: string;
  showSections?: boolean;
  showResources?: boolean;
  showOther?: boolean;
  customLinks?: {
    section: string;
    links: Array<{ title: string; href: string }>;
  }[];
}

const Footer: React.FC<FooterProps> = ({
  tagline = "Crack the case and land your dream role today.",
  showSections = true,
  showResources = true,
  showOther = true,
  customLinks = [],
}) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.mainContent}>
        <div className={styles.logoSection}>
          <img
            src="/assets/Logo Text.svg"
            alt="Case Prepared Logo"
            className={styles.logoSmall}
          />
          <p className={styles.tagline}>{tagline}</p>
          <a
            href="https://pavlosnetwork.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.companyLink}
          >
            A Pavlos Company
          </a>
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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z"
                fill="#666"
              />
            </svg>
          </a>
        </div>

        <div className={styles.linksContainer}>
          {showSections && (
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
          )}

          {showResources && (
            <div className={styles.linkColumn}>
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="mailto:contact@caseprepared.com">Contact us</a>
                </li>
              </ul>
            </div>
          )}

          {showOther && (
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
          )}

          {customLinks.map((section, index) => (
            <div key={index} className={styles.linkColumn}>
              <h3>{section.section}</h3>
              <ul>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a href={link.href}>{link.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footerContent}></div>
    </footer>
  );
};

export default Footer;
