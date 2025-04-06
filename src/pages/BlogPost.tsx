import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts } from "../data/blogData";
import styles from "../styles/BlogPost.module.css";

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find((post) => post.id === Number(id));

  React.useEffect(() => {
    if (!post) {
      navigate("/blogs");
    }
  }, [navigate, post]);

  if (!post) {
    return null;
  }

  return (
    <div className={styles.blogPostContainer}>
      <Link to="/blogs" className={styles.backButton}>
        ← Back to Blogs
      </Link>

      <header className={styles.blogHeader}>
        <h1 className={styles.blogTitle}>{post.title}</h1>
        <div className={styles.blogMeta}>
          <span>By {post.author}</span>
          <span>•</span>
          <span>
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </header>

      <img src={post.imageUrl} alt={post.title} className={styles.blogImage} />

      <div className={styles.blogContent}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className={styles.mdHeading1}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className={styles.mdHeading2}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className={styles.mdHeading3}>{children}</h3>
            ),
            p: ({ children }) => (
              <p className={styles.mdParagraph}>{children}</p>
            ),
            ul: ({ children }) => <ul className={styles.mdList}>{children}</ul>,
            ol: ({ children }) => <ol className={styles.mdList}>{children}</ol>,
            code: ({ children, className }) =>
              className?.includes("inline") ? (
                <code className={styles.mdInlineCode}>{children}</code>
              ) : (
                <code className={styles.mdCodeBlock}>{children}</code>
              ),
            blockquote: ({ children }) => (
              <blockquote className={styles.mdBlockquote}>
                {children}
              </blockquote>
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className={styles.blogTags}>
        {post.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={styles.authorSection}>
        <p>{post.author}</p>
      </div>
    </div>
  );
};

export default BlogPost;
