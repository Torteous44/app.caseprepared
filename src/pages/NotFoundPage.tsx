import React from "react";
import { Link } from "react-router-dom";

// Inline critical CSS for 404 page
const criticalStyles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    backgroundColor: "#fafafa",
  },
  content: {
    maxWidth: "400px",
    width: "100%",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "1.5rem",
  },
  errorCode: {
    fontSize: "5rem",
    fontWeight: 300,
    margin: 0,
    color: "#174EA6",
    lineHeight: 1,
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  primaryButton: {
    background: "transparent",
    color: "#333",
    fontWeight: 500,
    padding: "0.6rem 1.2rem",
    border: "1px solid #ddd",
    borderRadius: "4px",
    textDecoration: "none",
    transition: "all 0.2s ease",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
};

const NotFoundPage: React.FC = () => {
  return (
    <div style={criticalStyles.container}>
      <div style={criticalStyles.content}>
        <h1 style={criticalStyles.errorCode}>404</h1>
        <p style={criticalStyles.description}>Page not found</p>
        <Link to="/" style={criticalStyles.primaryButton}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
