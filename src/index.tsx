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
  link.href = "/styles/global.css";
  document.head.appendChild(link);
};

// Load CSS after main content is rendered
window.addEventListener("load", loadCss);

// Support both hydration from react-snap and normal rendering
const rootElement = document.getElementById("root") as HTMLElement;

if (rootElement.hasChildNodes()) {
  // If the root element has children, it means the app was pre-rendered by react-snap
  // Use hydrateRoot instead of createRoot to avoid the double-rendering
  ReactDOM.hydrateRoot(rootElement, <App />);
} else {
  // Normal rendering path when not pre-rendered
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    process.env.NODE_ENV === "development" ? (
      <React.StrictMode>
        <App />
      </React.StrictMode>
    ) : (
      <App />
    )
  );
}

// Monitor core web vitals
reportWebVitals((metric) => {
  if (metric.name === "FCP" || metric.name === "LCP" || metric.name === "CLS") {
    // Send to your analytics service
    console.log(metric);
  }
});
