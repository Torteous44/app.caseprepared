import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { blogPosts } from "../data/blogData";
import styles from "../styles/BlogPost.module.css";

// Helper function to get related posts
const getRelatedPosts = (
  currentPost: (typeof blogPosts)[0],
  maxPosts: number = 3
) => {
  return blogPosts
    .filter(
      (post) =>
        post.id !== currentPost.id && // Exclude current post
        post.tags.some((tag) => currentPost.tags.includes(tag)) // Must share at least one tag
    )
    .sort((a, b) => {
      // Count matching tags to prioritize posts with more tag overlap
      const aMatchingTags = a.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      ).length;
      const bMatchingTags = b.tags.filter((tag) =>
        currentPost.tags.includes(tag)
      ).length;
      return bMatchingTags - aMatchingTags;
    })
    .slice(0, maxPosts);
};

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

  const relatedPosts = getRelatedPosts(post);

  return (
    <div className={styles.blogPostContainer}>
      <Link to="/blogs" className={styles.backButton}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={styles.backArrow}
        >
          <path
            d="M15.8333 10H4.16666M4.16666 10L9.16666 15M4.16666 10L9.16666 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Blogs
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
          <Link
            key={tag}
            to={`/blogs?tag=${encodeURIComponent(tag)}`}
            className={styles.tag}
          >
            {tag}
          </Link>
        ))}
      </div>

      {relatedPosts.length > 0 && (
        <div className={styles.relatedPosts}>
          <h2 className={styles.relatedPostsTitle}>Related Articles</h2>
          <div className={styles.relatedPostsGrid}>
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                to={`/blog/${relatedPost.id}`}
                className={styles.relatedPostCard}
              >
                <img
                  src={relatedPost.imageUrl}
                  alt={relatedPost.title}
                  className={styles.relatedPostImage}
                />
                <div className={styles.relatedPostContent}>
                  <h3 className={styles.relatedPostTitle}>
                    {relatedPost.title}
                  </h3>
                  <p className={styles.relatedPostExcerpt}>
                    {relatedPost.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;
