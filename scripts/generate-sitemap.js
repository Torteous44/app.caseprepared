const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');
const { blogPosts } = require('../src/data/blogData');

// Get all unique tags from blog posts
const getAllTags = () => {
  const tags = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
};

// Define your website's URLs
const baseUrls = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/dashboard', changefreq: 'daily', priority: 0.9 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
  { url: '/interviews', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs', changefreq: 'daily', priority: 0.9 },
];

// Add blog post URLs
const blogUrls = blogPosts.map(post => ({
  url: `/blog/${post.id}`,
  changefreq: 'weekly',
  priority: 0.8,
  lastmod: new Date(post.date).toISOString()
}));

// Add tag-based URLs
const tagUrls = getAllTags().map(tag => ({
  url: `/blogs?tag=${encodeURIComponent(tag)}`,
  changefreq: 'weekly',
  priority: 0.7
}));

// Combine all URLs
const urls = [...baseUrls, ...blogUrls, ...tagUrls];

// Create a stream to write to
const stream = new SitemapStream({ hostname: 'https://caseprepared.com' });

// Return a promise that resolves with your XML string
streamToPromise(Readable.from(urls).pipe(stream))
  .then((data) => {
    fs.writeFileSync('public/sitemap.xml', data.toString());
    console.log('Sitemap generated successfully!');
  })
  .catch((error) => {
    console.error('Error generating sitemap:', error);
  }); 