import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/NotFoundPage.module.css";

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.errorCode}>404</h1>
        <p className={styles.description}>Page not found</p>
        <Link to="/" className={styles.primaryButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
