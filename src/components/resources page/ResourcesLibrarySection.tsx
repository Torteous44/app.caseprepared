import React from "react";
import { Link } from "react-router-dom";
import { getFeaturedResources, getResourceSectionById } from "../../data/resourceLibraryData";
import styles from "../../styles/resources page/ResourcesLibrarySection.module.css";
import "../../styles.css";

const ResourcesLibrarySection: React.FC = () => {
  // Get firm-specific case examples to show in preview
  const firmCases = getResourceSectionById("firm-case-examples");
  const featuredFirmCases = firmCases?.items.slice(0, 4) || [];

  return (
    <section className={styles.librarySection}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.textContent}>
            <div className={styles.badge}>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={styles.badgeIcon}
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              Curated Resources
            </div>
            
            <h2 className={styles.title}>
              The CasePrepared <span className={styles.highlight}>Resource Library</span>
            </h2>
            
            <p className={styles.description}>
              Everything you need to master consulting interviews—handpicked books, MBA casebooks, videos, and tools from top sources.
            </p>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
                <span>Expert-curated books & casebooks</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <span>Video tutorials & case walkthroughs</span>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                  </svg>
                </div>
                <span>Frameworks & tools from top consultants</span>
              </div>
            </div>
            
            <div className={styles.ctaContainer}>
              <Link to="/resources/library" className={styles.ctaButton}>
                Explore Resource Library
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.arrowIcon}
                >
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </Link>
              
              <p className={styles.ctaSubtext}>
                Access hundreds of premium resources at no cost
              </p>
            </div>
          </div>
          
          <div className={styles.visualContent}>
            <div className={styles.libraryCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3>Featured Resources</h3>
              </div>
              
              <div className={styles.resourcePreview}>
                {featuredFirmCases.map((resource) => (
                  <div key={resource.id} className={styles.previewItem}>
                    <div className={styles.previewIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                      </svg>
                    </div>
                    <div className={styles.previewContent}>
                      <span className={styles.previewTitle}>{resource.title}</span>
                      {resource.institution && (
                        <span className={styles.previewInstitution}>{resource.institution}</span>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className={styles.previewFooter}>
                  <span className={styles.previewMore}>
                    +{getFeaturedResources().length} more resources
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourcesLibrarySection; 