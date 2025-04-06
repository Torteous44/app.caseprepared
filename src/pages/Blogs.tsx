import React from "react";
import { Link } from "react-router-dom";
import { blogPosts } from "../data/blogData";
import styles from "../styles/Blogs.module.css";

const Blogs: React.FC = () => {
  return (
    <div className={styles.blogsContainer}>
      <h1>Blog</h1>
      <div className={styles.blogsGrid}>
        {blogPosts.map((post) => (
          <Link
            to={`/blog/${post.id}`}
            key={post.id}
            style={{ textDecoration: "none" }}
          >
            <article className={styles.blogCard}>
              <img
                src={post.imageUrl}
                alt={post.title}
                className={styles.blogImage}
              />
              <div className={styles.blogContent}>
                <h2 className={styles.blogTitle}>{post.title}</h2>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <div className={styles.blogTags}>
                  {post.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div className={styles.blogMeta}>
                  <span>{post.author}</span>
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blogs;
