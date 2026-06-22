const express = require('express');
const { marked } = require('marked');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/render', (req, res) => {
  const { markdown } = req.body;
  if (typeof markdown !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const html = marked(markdown);
  res.json({ html });
});

app.listen(PORT, () => {
  console.log(`Markdown Preview server running at http://localhost:${PORT}`);
});
