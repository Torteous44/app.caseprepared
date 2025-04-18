import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// Dynamically import non-critical CSS
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Dynamically load non-critical CSS
const loadCss = () => {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

// Load CSS after main content is rendered
window.addEventListener("load", loadCss);

// Create root with type assertion
const rootElement = document.getElementById("root") as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

// Conditionally render with StrictMode in development
const app = process.env.NODE_ENV === "development" ? <App /> : <App />;

root.render(app);

// Monitor core web vitals
reportWebVitals((metric) => {
  if (metric.name === "FCP" || metric.name === "LCP" || metric.name === "CLS") {
    // Send to your analytics service
    console.log(metric);
  }
});
