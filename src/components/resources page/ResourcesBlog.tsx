import React from "react";
import { Link } from "react-router-dom";
import { blogPosts } from "../../data/blogData";
import "../../styles/resources page/ResourcesBlog.css";

const ResourcesBlog: React.FC = () => {
  // Only show the first 3 blog posts
  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <section className="resources-blog-section">
      <div className="resources-blog-container">
        <div className="resources-blog-header">
          <h2 className="resources-blog-title">CasePrepared Blog</h2>
          <p className="resources-blog-subtitle">
            Read our blog and learn how to prep for your case interview
          </p>
        </div>

        <div className="resources-blog-grid">
          {featuredPosts.map((post) => (
            <Link
              to={`/blog/${post.id}`}
              key={post.id}
              className="resources-blog-card"
            >
              <article>
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="resources-blog-image"
                />
                <div className="resources-blog-content">
                  <h3 className="resources-blog-post-title">{post.title}</h3>
                  <p className="resources-blog-excerpt">{post.excerpt}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <div className="resources-blog-actions">
          <Link to="/blogs" className="resources-blog-button">
            Read more articles
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesBlog;
