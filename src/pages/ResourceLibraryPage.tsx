import React from "react";
import { resourceLibrary } from "../data/resourceLibraryData";
import type { ResourceSection, ResourceItem } from "../data/resourceLibraryData";
import Footer from "../components/common/Footer";
import styles from "../styles/ResourceLibraryPage.module.css";
import "../styles.css";

const ResourceTypeIcon: React.FC<{ type: ResourceItem['type'] | 'game' }> = ({ type }) => {
  switch (type) {
    case 'pdf':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14,2 14,8 20,8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10,9 9,9 8,9"></polyline>
        </svg>
      );
    case 'link':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      );
    case 'video':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>
      );
    case 'book':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      );
    case 'tool':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      );
    case 'game':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <circle cx="8" cy="14" r="1"></circle>
          <circle cx="16" cy="14" r="1"></circle>
          <circle cx="12" cy="10" r="1"></circle>
          <circle cx="8" cy="10" r="1"></circle>
          <circle cx="16" cy="10" r="1"></circle>
        </svg>
      );
    default:
      return null;
  }
};

const ResourceCard: React.FC<{ resource: ResourceItem }> = ({ resource }) => {
  return (
    <a 
      href={resource.url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className={styles.resourceCard}
    >
      <div className={styles.resourceHeader}>
        <div className={styles.resourceIcon}>
          <ResourceTypeIcon type={resource.type} />
        </div>
        <div className={styles.resourceMeta}>
          <h3 className={styles.resourceTitle}>{resource.title}</h3>
          {resource.institution && (
            <p className={styles.resourceInstitution}>{resource.institution}</p>
          )}
        </div>
        {resource.year && (
          <span className={styles.resourceYear}>{resource.year}</span>
        )}
      </div>
      
             <p className={styles.resourceDescription}>{resource.description}</p>
      
      <div className={styles.resourceFooter}>
        <span className={styles.resourceType}>
          {resource.type.toUpperCase()}
        </span>
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
          className={styles.externalIcon}
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15,3 21,3 21,9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
      </div>
    </a>
  );
};

const ResourceSection: React.FC<{ section: ResourceSection }> = ({ section }) => {
  const isSingleItem = section.items.length === 1;
  
  return (
    <section className={styles.resourceSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <p className={styles.sectionDescription}>{section.description}</p>
      </div>
      
      <div className={`${styles.resourceGrid} ${isSingleItem ? styles.singleItem : ''}`}>
        {section.items.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
};



const ResourceLibraryPage: React.FC = () => {
  // Practice Games section data
  const practiceGamesSection: ResourceSection = {
    id: "practice-games",
    title: "CasePrepared Practice Games",
    description: "Games to help you think on your feet in the interview",
    icon: "game",
    featured: true,
    items: [
      {
        id: "casemath-braingame",
        title: "CaseMath BrainGame",
        url: "/casemath-braingame",
        description: "Practice your consulting math skills with rapid-fire calculations. Build speed and accuracy for case interview math under pressure.",
        type: "game" as any,
        tags: ["math", "practice", "speed", "consulting"]
      }
    ]
  };

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
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
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Free Resources
          </div>
          
          <h1 className={styles.heroTitle}>{resourceLibrary.title}</h1>
          <p className={styles.heroDescription}>{resourceLibrary.description}</p>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.container}>
          <ResourceSection section={practiceGamesSection} />
          {resourceLibrary.sections.map((section) => (
            <ResourceSection key={section.id} section={section} />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ResourceLibraryPage; 