const express = require('express');
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SAVED_DIR = path.join(__dirname, 'saved');

if (!fs.existsSync(SAVED_DIR)) {
  fs.mkdirSync(SAVED_DIR, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/render', (req, res) => {
  const { markdown } = req.body;
  if (typeof markdown !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  try {
    const html = marked(markdown);
    res.json({ html });
  } catch (err) {
    res.status(400).json({ error: 'Markdown 解析失败：' + err.message });
  }
});

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const min = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}${m}${d}_${h}${min}${s}`;
}

app.post('/api/save', (req, res) => {
  const { markdown } = req.body;
  if (typeof markdown !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  const filename = formatTimestamp(new Date()) + '.md';
  const filePath = path.join(SAVED_DIR, filename);
  try {
    fs.writeFileSync(filePath, markdown, 'utf8');
    res.json({ filename });
  } catch (err) {
    res.status(500).json({ error: '保存失败：' + err.message });
  }
});

app.get('/api/saved', (req, res) => {
  try {
    const files = fs.readdirSync(SAVED_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: '读取列表失败：' + err.message });
  }
});

app.get('/api/saved/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.md') || filename.includes('..')) {
    return res.status(400).json({ error: '无效的文件名' });
  }
  const filePath = path.join(SAVED_DIR, filename);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ filename, content });
  } catch (err) {
    res.status(404).json({ error: '文件不存在' });
  }
});

app.listen(PORT, () => {
  console.log(`Markdown Preview server running at http://localhost:${PORT}`);
});
