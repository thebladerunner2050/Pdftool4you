import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

// Route handlers for HTML files without .html extension if accessed
app.get('/png-to-jpg', (req, res) => {
  res.sendFile(path.join(__dirname, 'png-to-jpg.html'));
});

app.get('/pdf-compressor', (req, res) => {
  res.sendFile(path.join(__dirname, 'pdf-compressor.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
