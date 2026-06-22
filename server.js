const express = require('express');
const { marked } = require('marked');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const SAVED_DIR = path.join(__dirname, 'saved');
const EXPORTED_DIR = path.join(__dirname, 'exported');

if (!fs.existsSync(SAVED_DIR)) {
  fs.mkdirSync(SAVED_DIR, { recursive: true });
}
if (!fs.existsSync(EXPORTED_DIR)) {
  fs.mkdirSync(EXPORTED_DIR, { recursive: true });
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

app.delete('/api/saved/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename.endsWith('.md') || filename.includes('..')) {
    return res.status(400).json({ error: '无效的文件名' });
  }
  const filePath = path.join(SAVED_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }
    fs.unlinkSync(filePath);
    res.json({ success: true, filename });
  } catch (err) {
    res.status(500).json({ error: '删除失败：' + err.message });
  }
});

app.post('/api/export', (req, res) => {
  const { markdown } = req.body;
  if (typeof markdown !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  try {
    const content = marked(markdown);
    const filename = formatTimestamp(new Date()) + '.html';
    const filePath = path.join(EXPORTED_DIR, filename);
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; }
    p { margin: 0.8em 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f4f4f4; padding: 12px; border-radius: 5px; overflow-x: auto; }
    pre code { background: transparent; padding: 0; }
    blockquote { border-left: 4px solid #ddd; padding-left: 16px; margin: 1em 0; color: #666; }
    ul, ol { padding-left: 24px; margin: 0.8em 0; }
    table { border-collapse: collapse; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f5f5f5; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${content}
</body>
</html>`;
    fs.writeFileSync(filePath, fullHtml, 'utf8');
    res.json({ filename });
  } catch (err) {
    res.status(400).json({ error: '导出失败：' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Markdown Preview server running at http://localhost:${PORT}`);
});
