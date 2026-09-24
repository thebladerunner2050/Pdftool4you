import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Explicit SEO routes with exact Content-Type headers
app.get(['/sitemap.xml', '/sitemap', '/sitemap_index.xml'], (req, res) => {
  res.type('application/xml; charset=utf-8');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain; charset=utf-8');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.use(express.static(__dirname));

// Route handlers for HTML files without .html extension if accessed
app.get('/png-to-jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'png-to-jpg.html'));
});

app.get('/jpg-to-png', (req, res) => {
  res.sendFile(path.join(__dirname, 'jpg-to-png.html'));
});

app.get('/pdf-compressor', (req, res) => {
  res.sendFile(path.join(__dirname, 'pdf-compressor.html'));
});

app.get('/merge-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'merge-pdf.html'));
});

app.get('/split-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'split-pdf.html'));
});

app.get(['/pdf-watermarker', '/pdf-watermark'], (req, res) => {
  res.sendFile(path.join(__dirname, 'pdf-watermarker.html'));
});

app.get('/image-to-pdf', (req, res) => {
  res.sendFile(path.join(__dirname, 'image-to-pdf.html'));
});

app.get(['/remove-pdf-password', '/unlock-pdf', '/decrypt-pdf'], (req, res) => {
  res.sendFile(path.join(__dirname, 'remove-pdf-password.html'));
});

app.get(['/pan-card-photo-maker', '/pan-card-resizer'], (req, res) => {
  res.sendFile(path.join(__dirname, 'pan-card-photo-maker.html'));
});

// Important pages for Google AdSense compliance & T&C
app.get(['/privacy-policy', '/privacy'], (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy-policy.html'));
});

app.get(['/terms-and-conditions', '/terms', '/tnc'], (req, res) => {
  res.sendFile(path.join(__dirname, 'terms-and-conditions.html'));
});

app.get(['/about-us', '/about'], (req, res) => {
  res.sendFile(path.join(__dirname, 'about-us.html'));
});

app.get(['/contact-us', '/contact'], (req, res) => {
  res.sendFile(path.join(__dirname, 'contact-us.html'));
});

app.get(['/disclaimer'], (req, res) => {
  res.sendFile(path.join(__dirname, 'disclaimer.html'));
});

app.get(['/cookie-policy', '/cookies'], (req, res) => {
  res.sendFile(path.join(__dirname, 'cookie-policy.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
