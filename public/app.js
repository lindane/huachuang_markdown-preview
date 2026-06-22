const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const container = document.querySelector('.container');

container.style.height = 'auto';
container.style.minHeight = '100vh';
preview.style.flex = 'none';
preview.style.overflow = 'hidden';
preview.setAttribute('scrolling', 'no');

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function adjustIframeHeight() {
  try {
    const doc = preview.contentDocument || preview.contentWindow.document;
    const body = doc.body;
    const html = doc.documentElement;
    const height = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );
    preview.style.height = height + 'px';
  } catch (e) {
    console.error('Adjust iframe height error:', e);
  }
}

async function renderMarkdown(markdown) {
  try {
    const response = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown })
    });
    const data = await response.json();

    if (data.error) {
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
              color: #a33;
              background: #fff5f5;
            }
          </style>
        </head>
        <body><strong>渲染错误：</strong>${data.error}</body>
        </html>
      `);
      doc.close();
      adjustIframeHeight();
      return;
    }

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
            margin: 0;
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

    adjustIframeHeight();
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', adjustIframeHeight);
      }
    });
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

function createToolbar() {
  const toolbar = document.createElement('div');
  toolbar.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: #fafafa;
    border-bottom: 1px solid #ddd;
  `;

  const title = document.createElement('span');
  title.textContent = 'Markdown 在线预览';
  title.style.cssText = 'font-weight: 600; font-size: 15px; color: #333; margin-right: auto;';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = '保存';
  saveBtn.style.cssText = `
    padding: 6px 16px;
    background: #0366d6;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  `;
  saveBtn.addEventListener('click', saveDocument);

  const clearBtn = document.createElement('button');
  clearBtn.textContent = '清空';
  clearBtn.style.cssText = `
    padding: 6px 16px;
    background: #fff;
    color: #333;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  `;
  clearBtn.addEventListener('click', clearEditor);

  toolbar.appendChild(title);
  toolbar.appendChild(saveBtn);
  toolbar.appendChild(clearBtn);

  document.body.insertBefore(toolbar, container);
}

function createSavedList() {
  const listSection = document.createElement('div');
  listSection.style.cssText = `
    padding: 16px;
    border-top: 1px solid #ddd;
    background: #fafafa;
  `;

  const listTitle = document.createElement('div');
  listTitle.textContent = '已保存文档';
  listTitle.style.cssText = 'font-weight: 600; font-size: 14px; color: #333; margin-bottom: 10px;';

  const listContainer = document.createElement('div');
  listContainer.id = 'saved-list';
  listContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 24px;
  `;

  const emptyTip = document.createElement('span');
  emptyTip.id = 'saved-empty';
  emptyTip.textContent = '暂无保存的文档';
  emptyTip.style.cssText = 'color: #999; font-size: 13px;';

  listSection.appendChild(listTitle);
  listSection.appendChild(listContainer);
  listContainer.appendChild(emptyTip);

  document.body.appendChild(listSection);
}

async function saveDocument() {
  const markdown = editor.value;
  if (!markdown.trim()) {
    alert('内容为空，无法保存');
    return;
  }
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown })
    });
    const data = await response.json();
    if (data.filename) {
      alert('保存成功：' + data.filename);
      loadSavedList();
    } else {
      alert('保存失败：' + (data.error || '未知错误'));
    }
  } catch (err) {
    alert('保存失败：' + err.message);
  }
}

function clearEditor() {
  if (confirm('确定要清空编辑器内容吗？')) {
    editor.value = '';
    renderMarkdown('');
  }
}

async function loadSavedList() {
  try {
    const response = await fetch('/api/saved');
    const data = await response.json();
    const listContainer = document.getElementById('saved-list');
    const emptyTip = document.getElementById('saved-empty');

    listContainer.innerHTML = '';

    if (!data.files || data.files.length === 0) {
      emptyTip.textContent = '暂无保存的文档';
      listContainer.appendChild(emptyTip);
      return;
    }

    data.files.forEach(filename => {
      const item = document.createElement('span');
      item.textContent = filename;
      item.style.cssText = `
        padding: 4px 10px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        color: #0366d6;
        cursor: pointer;
      `;
      item.addEventListener('click', () => loadDocument(filename));
      listContainer.appendChild(item);
    });
  } catch (err) {
    console.error('加载文档列表失败：', err);
  }
}

async function loadDocument(filename) {
  try {
    const response = await fetch('/api/saved/' + encodeURIComponent(filename));
    const data = await response.json();
    if (data.content !== undefined) {
      editor.value = data.content;
      renderMarkdown(data.content);
    } else {
      alert('加载失败：' + (data.error || '未知错误'));
    }
  } catch (err) {
    alert('加载失败：' + err.message);
  }
}

createToolbar();
createSavedList();
loadSavedList();
