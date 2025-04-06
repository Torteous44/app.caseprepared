const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const fs = require('fs');

// Define your website's URLs
const urls = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/dashboard', changefreq: 'daily', priority: 0.9 },
  { url: '/about', changefreq: 'monthly', priority: 0.7 },
  { url: '/contact', changefreq: 'monthly', priority: 0.7 },
  { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
  { url: '/interviews', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs/1', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs/2', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs/3', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs/4', changefreq: 'weekly', priority: 0.9 },
  { url: '/blogs/5', changefreq: 'weekly', priority: 0.9 },
  

];

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