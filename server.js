const express = require('express');
const db = require('./database');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Generate a random 6-character code without nanoid
function generateCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Shorten a URL
app.post('/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const short_code = generateCode();
  db.prepare('INSERT INTO links (short_code, original_url) VALUES (?, ?)').run(short_code, url);

  res.json({ short_url: `http://localhost:3000/${short_code}` });
});

// Redirect short URL to original
app.get('/:code', (req, res) => {
  const link = db.prepare('SELECT original_url FROM links WHERE short_code = ?').get(req.params.code);
  if (!link) return res.status(404).send('Link not found');
  res.redirect(link.original_url);
});

app.listen(3000, () => console.log('Running on http://localhost:3000'));