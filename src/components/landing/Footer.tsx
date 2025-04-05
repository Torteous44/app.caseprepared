import React from "react";
import styles from "../../styles/Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <a 
          href="https://pavlosnetwork.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.companyLink}
        >
          A Pavlos Company
        </a>
        <span className={styles.dot}> • </span>
        <a 
          href="mailto:contact@caseprepared.com" 
          className={styles.contactLink}
        >
          Contact us
        </a>
      </div>
    </footer>
  );
};

export default Footer; 