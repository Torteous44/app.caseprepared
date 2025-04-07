const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');

// Blog data
const blogPosts = [
  {
    id: 1,
    date: '2025-04-06',
    tags: ["Case Interview Preparation", "Consulting Frameworks", "Interview Strategy", "Problem Solving", "Business Analysis", "Career Development", "Management Consulting"]
  },
  {
    id: 2,
    date: '2025-04-06',
    tags: ["Case Interview Mistakes", "Interview Tips", "Consulting Career", "MECE Framework", "Problem Solving", "Interview Preparation", "Management Consulting"]
  },
  {
    id: 3,
    date: '2025-04-06',
    tags: ["MECE Framework", "Structured Thinking", "Problem Solving Methods", "Consulting Skills", "Interview Strategy", "Case Interview Preparation"]
  },
  {
    id: 4,
    date: '2025-04-06',
    tags: ["Advanced Frameworks", "Business Strategy", "Porter's Five Forces", "Value Chain Analysis", "Strategic Planning", "Case Interview Preparation", "Management Consulting", "Consulting Frameworks"]
  },
  {
    id: 5,
    date: '2025-04-06',
    tags: ["Behavioral Interviews", "Soft Skills", "STAR Method", "Leadership Skills", "Communication Skills", "Interview Preparation", "Consulting Career"]
  },
  {
    id: 6,
    date: '2025-04-06',
    tags: ["Market Sizing", "M&A Analysis", "Growth Strategy", "Operations Management", "Business Valuation", "Case Interview Types", "Strategic Planning"]
  },
  {
    id: 7,
    date: '2025-04-06',
    tags: ["Interview Platform", "Mock Interviews", "Interview Preparation", "Career Development", "Consulting Skills", "NLP Technology", "Professional Development"]
  }
];

// Get all unique tags
const getAllTags = () => {
  const tags = new Set();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
};

// Define static pages
const staticPages = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/blogs', changefreq: 'daily', priority: 0.9 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/interviews', changefreq: 'weekly', priority: 0.8 },
  { url: '/resources', changefreq: 'weekly', priority: 0.8 },
];

async function generateSitemap() {
  try {
    // Create a stream to write to
    const stream = new SitemapStream({ hostname: 'https://caseprepared.com' });
    
    // Add static pages
    staticPages.forEach(page => {
      stream.write(page);
    });

    // Add blog posts
    blogPosts.forEach(post => {
      stream.write({
        url: `/blog/${post.id}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date(post.date).toISOString()
      });
    });

    // Add tag pages
    getAllTags().forEach(tag => {
      stream.write({
        url: `/blogs?tag=${encodeURIComponent(tag)}`,
        changefreq: 'weekly',
        priority: 0.6
      });
    });

    // End the stream
    stream.end();

    // Generate sitemap XML
    const data = await streamToPromise(Readable.from(stream));
    
    // Write the sitemap to the public directory
    fs.writeFileSync('./public/sitemap.xml', data.toString());
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
}

generateSitemap(); 