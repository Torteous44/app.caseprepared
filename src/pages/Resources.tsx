import React from "react";
// Assuming styles.css exists or will be created in the same directory or accessible path
import "../styles.css";

// Placeholder imports for components - these will need to be created
import ResourcesHero from "../components/resources page/ResourcesHero"; // Assuming path
import ResourcesMeasurements from "../components/resources page/ResourcesMeasurements";
import ResourcesBlog from "../components/resources page/ResourcesBlog";
import Footer from "../components/common/Footer";
import ResourcesLibrarySection from "../components/resources page/ResourcesLibrarySection";

const Resources: React.FC = () => {
  return (
    <div className="resources-page">
      <ResourcesHero />
      <ResourcesLibrarySection />
      <ResourcesMeasurements />
      <ResourcesBlog />
      <Footer />
    </div>
  );
};

export default Resources;
