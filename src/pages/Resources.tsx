import React from "react";
// Assuming styles.css exists or will be created in the same directory or accessible path
import "../styles.css";

// Placeholder imports for components - these will need to be created
import ResourcesHero from "../components/ResourcesHero"; // Assuming path
import ResourcesMeasurements from "../components/ResourcesMeasurements";
import ResourcesBlog from "../components/ResourcesBlog";
import Footer from "../components/common/Footer";
// import Blog from '../components/Blog';

const Resources: React.FC = () => {
  return (
    <div className="resources-page">
      <ResourcesHero />
      <ResourcesMeasurements />
      <ResourcesBlog />
      <Footer />
    </div>
  );
};

export default Resources;
