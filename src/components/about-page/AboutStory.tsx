import React from "react";
import styles from "../../styles/about-page/AboutStory.module.css";

const AboutStory: React.FC = () => {
  return (
    <>
      <section className={styles.storyContainer}>
        <div className={styles.storySection}>
          <h2 className={styles.sectionHeading}>Our story</h2>
          <p className={styles.sectionText}>
            We built CasePrepared because landing a consulting role requires
            practice, but
            <strong>
              {" "}
              good mock interview partners are hard to find. CasePrepared gives
              you full mock interviews, personalized analytics, and expert
              guides
            </strong>
            , so you can prep with structure, track progress, and walk into
            every case confident.
          </p>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.estSection}>
          <h2 className={styles.estHeading}>Est. 2024</h2>
          <p className={styles.estText}>
            Helping students worldwide land their dream roles
          </p>
        </div>
      </section>

      <div className={styles.testimonialContainer}>
        <p className={styles.testimonialText}>
          "CasePrepared is{" "}
          <span className={styles.testimonialBlue}>exactly what I needed</span>{" "}
          to prepare for my McKinsey interviews. The structured approach and
          personalized feedback made all the difference."
        </p>
        <p className={styles.testimonialAuthor}>
          Sarah T. — McKinsey & Company, New York
        </p>
      </div>
    </>
  );
};

export default AboutStory;
