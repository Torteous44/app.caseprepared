import React from "react";
import "./LoadingSpinner.css";

// Loading component with proper styling
const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="dot-container">
        <div className="dot dot1"></div>
        <div className="dot dot2"></div>
        <div className="dot dot3"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
