import React from "react";
// Assuming styles.css exists or will be created in the same directory or accessible path
import "../styles.css";

// Placeholder imports for components - these will need to be created
import ResourcesBlog from "../components/resources page/ResourcesBlog";
import Footer from "../components/common/Footer";
import ResourcesLibrarySection from "../components/resources page/ResourcesLibrarySection";
import CaseMathGameCard from "../components/resources page/CaseMathGameCard";

const Resources: React.FC = () => {
  return (
    <div className="resources-page">
      <ResourcesLibrarySection />

      <ResourcesBlog />

      <CaseMathGameCard />
      <Footer />
    </div>
  );
};

export default Resources;
