import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./styles/global.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Create root with type assertion
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Monitor core web vitals
reportWebVitals((metric) => {
  if (metric.name === "FCP" || metric.name === "LCP" || metric.name === "CLS") {
    // Send to your analytics service
    console.log(metric);
  }
});
