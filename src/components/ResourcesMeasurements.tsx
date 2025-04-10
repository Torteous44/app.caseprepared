import React from "react";
import "../styles/ResourcesMeasurements.css";
import "../styles.css";

const ResourcesMeasurements: React.FC = () => {
  return (
    <section className="measurements-section">
      <div className="measurements-container">
        <h2 className="measurements-title">
          Built by consults for future consultants
        </h2>
        <p className="measurements-subtitle">
          Learn best practices for case interviews from consultants who've been
          through the process
        </p>

        <div className="measurements-header">
          <h3>What we measure and give feedback on</h3>
        </div>

        <div className="measurements-grid">
          {/* Structured Problem-Solving Column */}
          <div className="measurement-card">
            <div className="title-container">
              <div className="measurement-icon blue">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    fillOpacity="0.01"
                  />
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="var(--blue-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h4 className="blue-title">Structured Problem-Solving</h4>
            </div>
            <ul>
              <li>
                <strong>MECE Frameworks:</strong> Candidates break down problems
                using logical, Mutually Exclusive and Collectively Exhaustive
                categories.
              </li>
              <li>
                <strong>Clear Roadmap:</strong> They present a well-defined plan
                early on, then systematically follow it, adjusting as new data
                arises.
              </li>
            </ul>
            <div className="measurement-divider"></div>
            <h5>Why we focused on this</h5>
            <p>
              It shows the candidate can organize complex information,
              prioritize effectively, and avoid missing crucial issues or
              duplicating efforts.
            </p>
          </div>

          {/* Analytical & Quantitative Skills Column */}
          <div className="measurement-card">
            <div className="title-container">
              <div className="measurement-icon orange">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    fillOpacity="0.01"
                  />
                  <path
                    stroke="#ff9100"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"
                  />
                </svg>
              </div>
              <h4 className="orange-title">Analytical & Quantitative Skills</h4>
            </div>
            <ul>
              <li>
                <strong>Accurate Calculations:</strong> The candidate handles
                math confidently and cross-checks for plausibility.
              </li>
              <li>
                <strong>Data Interpretation:</strong> They turn numbers, charts,
                and exhibits into meaningful insights, always tying them back to
                the central hypothesis.
              </li>
            </ul>
            <div className="measurement-divider"></div>
            <h5>Why we focused on this</h5>
            <p>
              Consulting work relies heavily on data-driven decisions; a
              candidate must show competence under time pressure and in
              uncertain environments.
            </p>
          </div>

          {/* Business Judgment & Insight Column */}
          <div className="measurement-card">
            <div className="title-container">
              <div className="measurement-icon red">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="24"
                    height="24"
                    fill="white"
                    fillOpacity="0.01"
                  />
                  <path
                    stroke="#e91e63"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 18.5A2.493 2.493 0 0 1 7.51 20H7.5a2.468 2.468 0 0 1-2.4-3.154 2.98 2.98 0 0 1-.85-5.274 2.468 2.468 0 0 1 .92-3.182 2.477 2.477 0 0 1 1.876-3.344 2.5 2.5 0 0 1 3.41-1.856A2.5 2.5 0 0 1 12 5.5m0 13v-13m0 13a2.493 2.493 0 0 0 4.49 1.5h.01a2.468 2.468 0 0 0 2.403-3.154 2.98 2.98 0 0 0 .847-5.274 2.468 2.468 0 0 0-.921-3.182 2.477 2.477 0 0 0-1.875-3.344A2.5 2.5 0 0 0 14.5 3 2.5 2.5 0 0 0 12 5.5m-8 5a2.5 2.5 0 0 1 3.48-2.3m-.28 8.551a3 3 0 0 1-2.953-5.185M20 10.5a2.5 2.5 0 0 0-3.481-2.3m.28 8.551a3 3 0 0 0 2.954-5.185"
                  />
                </svg>
              </div>
              <h4 className="red-title">Business Judgment & Insight</h4>
            </div>
            <ul>
              <li>
                <strong>Practical Solutions:</strong> Ideas are grounded in
                real-world feasibility. Candidates sense-check their findings
                and consider potential risks.
              </li>
              <li>
                <strong>Contextual Awareness:</strong> They interpret results
                through the lens of competition, customer behavior, and market
                trends.
              </li>
            </ul>
            <div className="measurement-divider"></div>
            <h5>Why we focused on this</h5>
            <p>
              Strong business acumen ensures the candidate's recommendations are
              not just theoretically correct but viable and aligned with how
              businesses actually operate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesMeasurements;
