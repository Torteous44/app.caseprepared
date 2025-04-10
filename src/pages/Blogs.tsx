import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { blogPosts } from "../data/blogData";
import styles from "../styles/blog/Blogs.module.css";

const Blogs: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedTag = searchParams.get("tag");
  const [allTags, setAllTags] = useState<string[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const INITIAL_TAG_COUNT = 8;

  useEffect(() => {
    // Get unique tags from all blog posts
    const tags = new Set(blogPosts.flatMap((post) => post.tags));
    setAllTags(Array.from(tags).sort());
  }, []);

  // Filter posts based on selected tag
  const filteredPosts = selectedTag
    ? blogPosts.filter((post) => post.tags.includes(selectedTag))
    : blogPosts;

  const visibleTags = showAllTags
    ? allTags
    : allTags.slice(0, INITIAL_TAG_COUNT);
  const hasMoreTags = allTags.length > INITIAL_TAG_COUNT;

  return (
    <div className={styles.blogsContainer}>
      <div className={styles.blogsHeader}>
        <h1>Blog</h1>
        {selectedTag && (
          <p className={styles.filterInfo}>
            Showing posts tagged with "{selectedTag}"
            <Link to="/blogs" className={styles.clearFilter}>
              Clear filter
            </Link>
          </p>
        )}
      </div>

      <div className={styles.tagCloud}>
        {visibleTags.map((tag) => (
          <Link
            key={tag}
            to={`/blogs?tag=${encodeURIComponent(tag)}`}
            className={`${styles.tagLink} ${
              selectedTag === tag ? styles.tagLinkActive : ""
            }`}
          >
            {tag}
          </Link>
        ))}
        {hasMoreTags && !showAllTags && (
          <button
            className={styles.moreTagsButton}
            onClick={() => setShowAllTags(true)}
          >
            Show more
          </button>
        )}
      </div>

      <div className={styles.blogsGrid}>
        {filteredPosts.map((post) => (
          <Link
            to={`/blog/${post.id}`}
            key={post.id}
            className={styles.blogCard}
          >
            <article>
              <img
                src={post.imageUrl}
                alt={post.title}
                className={styles.blogImage}
              />
              <div className={styles.blogContent}>
                <h2 className={styles.blogTitle}>{post.title}</h2>
                <p className={styles.blogExcerpt}>{post.excerpt}</p>
                <div className={styles.blogTags}>
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className={styles.tag}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/blogs?tag=${encodeURIComponent(
                          tag
                        )}`;
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 4 && (
                    <span className={`${styles.tag} ${styles.moreTag}`}>
                      +{post.tags.length - 4}
                    </span>
                  )}
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
