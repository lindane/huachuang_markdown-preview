const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

async function renderMarkdown(markdown) {
  try {
    const response = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown })
    });
    const data = await response.json();
    const doc = preview.contentDocument || preview.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 16px;
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
      <body>${data.html}</body>
      </html>
    `);
    doc.close();
  } catch (err) {
    console.error('Render error:', err);
  }
}

const debouncedRender = debounce(renderMarkdown, 300);

editor.addEventListener('input', (e) => {
  debouncedRender(e.target.value);
});

const sampleMarkdown = `# Markdown 预览

欢迎使用 **Markdown 在线预览工具**！

## 功能特点

- 实时渲染 Markdown
- 使用 marked 库解析
- iframe 隔离防止 XSS

\`\`\`javascript
console.log('Hello, Markdown!');
\`\`\`

> 这是一段引用文本

1. 列表项 1
2. 列表项 2
3. 列表项 3
`;

editor.value = sampleMarkdown;
renderMarkdown(sampleMarkdown);
