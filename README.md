# Markdown 在线预览工具

## 1. 项目概述

一个基于 Node.js + Express 的 Markdown 在线预览工具，支持实时渲染、文档保存/加载/删除、HTML 导出等功能。

**技术栈：**
- **后端**：Node.js + Express
- **Markdown 解析**：marked
- **前端**：原生 HTML + JavaScript（无框架）

---

## 2. 项目结构

```
huachuang_markdown-preview/
├── server.js              # Express 服务器入口，提供静态文件和 API 接口
├── package.json           # 项目依赖配置
├── package-lock.json      # 依赖版本锁定文件
├── public/                # 前端静态资源目录
│   ├── index.html         # 前端页面（左右分栏布局骨架）
│   └── app.js             # 前端逻辑（渲染、交互、工具栏、文档列表）
├── saved/                 # 已保存的 Markdown 文档目录（自动创建）
│   └── *.md              # 保存的 .md 文件，文件名为时间戳
└── exported/              # 导出的 HTML 文件目录（自动创建）
    └── *.html            # 导出的完整 HTML 文件，文件名为时间戳
```

**各文件作用说明：**

| 文件 | 作用 |
|------|------|
| [server.js](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js) | Express 服务器，提供 5 个 API 接口和静态文件服务 |
| [public/index.html](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/index.html) | 页面骨架，左右分栏布局的 DOM 结构 |
| [public/app.js](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js) | 前端核心逻辑，包含渲染、防抖、工具栏、文档列表等所有交互 |
| `saved/` 目录 | 存储用户保存的 `.md` 文档，文件名格式 `YYYYMMDD_HHmmss.md` |
| `exported/` 目录 | 存储导出的完整 HTML 文件，文件名格式 `YYYYMMDD_HHmmss.html` |

---

## 3. API 接口文档

项目共提供 5 个 API 端点，所有接口均采用 JSON 格式请求和响应。

---

### 3.1 POST /api/render — Markdown 转 HTML 渲染

**功能说明：** 将 Markdown 文本通过 marked 库解析为 HTML 字符串返回。

**请求参数：**
- Content-Type: `application/json`
- 请求体：
  ```json
  {
    "markdown": "# 标题\n\n正文内容"
  }
  ```

**响应格式（成功）：**
```json
{
  "html": "<h1>标题</h1>\n<p>正文内容</p>\n"
}
```

**响应格式（失败）：**
```json
{
  "error": "Markdown 解析失败：xxx"
}
```

**错误码说明：**
| 状态码 | 说明 |
|--------|------|
| 200 | 解析成功 |
| 400 | 输入无效（非字符串）或 marked 解析异常 |

**curl 示例：**
```bash
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Hello\n\nWorld"}'
```

**代码位置：** [server.js#L21-L32](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L21-L32)

---

### 3.2 POST /api/save — 保存 Markdown 文档

**功能说明：** 将 Markdown 内容保存为 `.md` 文件到 `saved/` 目录，文件名使用时间戳生成。

**请求参数：**
- Content-Type: `application/json`
- 请求体：
  ```json
  {
    "markdown": "# 我的笔记\n\n内容..."
  }
  ```

**响应格式（成功）：**
```json
{
  "filename": "20260622_103000.md"
}
```

**响应格式（失败）：**
```json
{
  "error": "保存失败：xxx"
}
```

**错误码说明：**
| 状态码 | 说明 |
|--------|------|
| 200 | 保存成功 |
| 400 | 输入无效（非字符串） |
| 500 | 文件写入失败 |

**curl 示例：**
```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# 测试文档\n\n内容"}'
```

**代码位置：** [server.js#L45-L58](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L45-L58)

---

### 3.3 GET /api/saved — 获取已保存文档列表

**功能说明：** 获取 `saved/` 目录下所有 `.md` 文件列表，按文件名倒序排列（最新的在前）。

**请求参数：** 无

**响应格式（成功）：**
```json
{
  "files": [
    "20260622_110000.md",
    "20260622_103000.md"
  ]
}
```

**响应格式（失败）：**
```json
{
  "error": "读取列表失败：xxx"
}
```

**错误码说明：**
| 状态码 | 说明 |
|--------|------|
| 200 | 读取成功（列表可为空） |
| 500 | 目录读取失败 |

**curl 示例：**
```bash
curl http://localhost:3000/api/saved
```

**代码位置：** [server.js#L60-L70](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L60-L70)

---

### 3.4 GET /api/saved/:filename — 读取单个文档内容

**功能说明：** 根据文件名读取指定 `.md` 文件的完整内容。

**请求参数：**
- Path 参数：`filename` — 文件名（需以 `.md` 结尾）

**响应格式（成功）：**
```json
{
  "filename": "20260622_103000.md",
  "content": "# 标题\n\n正文内容"
}
```

**响应格式（失败）：**
```json
{
  "error": "文件不存在"
}
```

**错误码说明：**
| 状态码 | 说明 |
|--------|------|
| 200 | 读取成功 |
| 400 | 文件名无效（非 `.md` 后缀或包含路径穿越字符） |
| 404 | 文件不存在 |

**curl 示例：**
```bash
curl http://localhost:3000/api/saved/20260622_103000.md
```

**代码位置：** [server.js#L72-L84](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L72-L84)

---

### 3.5 DELETE /api/saved/:filename — 删除文档

**功能说明：** 删除指定的 `.md` 文件。

**请求参数：**
- Path 参数：`filename` — 文件名（需以 `.md` 结尾）

**响应格式（成功）：**
```json
{
  "success": true,
  "filename": "20260622_103000.md"
}
```

**响应格式（失败）：**
```json
{
  "error": "文件不存在"
}
```

**错误码说明：**
| 状态码 | 说明 |
|--------|------|
| 200 | 删除成功 |
| 400 | 文件名无效（非 `.md` 后缀或包含路径穿越字符） |
| 404 | 文件不存在 |
| 500 | 文件删除失败 |

**curl 示例：**
```bash
curl -X DELETE http://localhost:3000/api/saved/20260622_103000.md
```

**代码位置：** [server.js#L86-L101](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L86-L101)

---

### 3.6 POST /api/export — 导出为 HTML 文件

**功能说明：** 将 Markdown 内容渲染为完整的 HTML 文件（含 head、内联样式、body），保存到 `exported/` 目录，可直接用浏览器打开。

**请求参数：**
- Content-Type: `application/json`
- 请求体：
  ```json
  {
    "markdown": "# 导出文档\n\n内容..."
  }
  ```

**响应格式（成功）：**
```json
{
  "filename": "20260622_103000.html"
}
```

**响应格式（失败）：**
```json
{
  "error": "导出失败：xxx"
}
```

**错误码说明：**
| 状态码 | 说明 |
|--------|------|
| 200 | 导出成功 |
| 400 | 输入无效或 marked 解析异常 |

**curl 示例：**
```bash
curl -X POST http://localhost:3000/api/export \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# 导出测试\n\n内容"}'
```

**代码位置：** [server.js#L103-L151](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L103-L151)

---

## 4. 前端架构

### 4.1 页面布局结构

前端页面的 DOM 骨架在 [index.html](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/index.html) 中定义，采用 **Flex 左右分栏布局**：

```
┌──────────────────────────────────────────────────┐
│  .container (flex, 100vh)                        │
│  ┌───────────────┬───────────────┐               │
│  │  .panel (左)  │  .panel (右)  │               │
│  │  ├─ 标题栏    │  ├─ 标题栏    │               │
│  │  └─ textarea  │  └─ iframe    │               │
│  │  (编辑器)     │  (预览区)     │               │
│  └───────────────┴───────────────┘               │
└──────────────────────────────────────────────────┘
```

- 两个 `.panel` 通过 `flex: 1` 各占一半宽度
- `textarea#editor` 是 Markdown 编辑区
- `iframe#preview` 是 HTML 预览区（iframe 隔离防止 XSS）

工具栏和文档列表由 [app.js](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js) **动态插入**，不改动 HTML 骨架：
- 顶部工具栏（`createToolbar()`）插入到 `.container` 之前
- 底部文档列表（`createSavedList()`）追加到 `document.body` 末尾

---

### 4.2 300ms 防抖优化

**实现位置：** [app.js#L11-L17](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L11-L17)

**原理：** 每次 `input` 事件触发时清除上一次的定时器，重新设定 300ms 后执行渲染函数。只有用户停止输入 300ms 以上才真正发起 API 请求，避免每次按键都请求后端。

```javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedRender = debounce(renderMarkdown, 300);
editor.addEventListener('input', (e) => {
  debouncedRender(e.target.value);
});
```

---

### 4.3 iframe 高度自适应内容

**实现位置：** [app.js#L19-L35](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L19-L35)

**原理：** iframe 内文档写入完成后，读取 `document.body.scrollHeight` 等多个高度值取最大值，设置到 iframe 的 `style.height` 上，让 iframe 完全撑开，避免出现双重滚动条。

**关键步骤：**
1. `container.style.height = 'auto'` — 容器高度随内容撑开
2. `preview.style.flex = 'none'` — 取消 flex 拉伸，手动控制高度
3. `preview.style.overflow = 'hidden'` + `scrolling="no"` — 隐藏 iframe 内部滚动条
4. `adjustIframeHeight()` — 读取 `body.scrollHeight` / `html.scrollHeight` 等取最大值设置高度
5. 图片加载完成后再次调用 `adjustIframeHeight()`，避免图片撑开后高度不准

---

### 4.4 工具栏按钮调用逻辑

工具栏包含三个按钮，均由 `createToolbar()` 动态创建：

| 按钮 | 颜色 | 调用函数 | 逻辑说明 |
|------|------|----------|----------|
| 导出 HTML | 绿色 | `exportHtml()` | 校验非空 → POST `/api/export` → alert 提示结果 |
| 保存 | 蓝色 | `saveDocument()` | 校验非空 → POST `/api/save` → alert 提示 → 刷新文档列表 |
| 清空 | 白色 | `clearEditor()` | `confirm()` 确认 → 清空 textarea → 调用 `renderMarkdown('')` |

**相关代码位置：**
- 工具栏创建：[app.js#L149-L209](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L149-L209)
- 保存逻辑：[app.js#L244-L266](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L244-L266)
- 清空逻辑：[app.js#L268-L273](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L268-L273)
- 导出逻辑：[app.js#L375-L396](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L375-L396)

---

### 4.5 已保存文档列表的渲染与交互

**列表渲染** — `loadSavedList()` 函数：
1. GET `/api/saved` 获取文件列表
2. 清空列表容器
3. 遍历文件数组，为每个文件创建一个 flex 容器（文件名 + 删除按钮）
4. 空列表时显示"暂无保存的文档"提示

**列表交互：**
- **点击文件名**：调用 `loadDocument(filename)` → GET `/api/saved/:filename` → 内容填入编辑器并重新渲染
- **点击删除按钮 `×`**：调用 `deleteDocument(filename)` → `confirm()` 确认 → DELETE `/api/saved/:filename` → 刷新列表

**相关代码位置：**
- 列表创建：[app.js#L211-L242](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L211-L242)
- 列表加载渲染：[app.js#L275-L339](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L275-L339)
- 加载文档：[app.js#L341-L354](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L341-L354)
- 删除文档：[app.js#L356-L373](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L356-L373)

---

## 5. 核心逻辑说明

### 5.1 Markdown 转 HTML 渲染流程

**后端（marked 库的使用）：**
1. 接收 POST 请求体中的 `markdown` 字符串
2. 使用 `marked(markdown)` 函数同步解析为 HTML
3. 返回 `{ html: "..." }`

marked 是一个轻量级、高性能的 Markdown 解析器，支持标准 Markdown 语法和 GFM（GitHub Flavored Markdown）。

**前端渲染：**
1. 通过 `fetch` 调用 `/api/render` 接口
2. 获取 HTML 后，通过 `iframe.contentDocument.write()` 写入完整 HTML 文档
3. 调用 `adjustIframeHeight()` 自适应高度
4. 监听图片 load 事件，加载完后再次调整高度

---

### 5.2 后端错误处理（try-catch 统一返回 JSON 错误）

所有可能抛出异常的操作都用 `try-catch` 包裹，发生错误时统一返回 JSON 格式的错误信息：

| 接口 | 可能的错误 | 返回状态码 |
|------|-----------|-----------|
| `/api/render` | marked 解析异常 | 400 |
| `/api/save` | 文件写入失败 | 500 |
| `/api/saved` (列表) | 目录读取失败 | 500 |
| `/api/saved/:filename` (读) | 文件不存在 | 404 |
| `/api/saved/:filename` (删) | 文件不存在 / 删除失败 | 404 / 500 |
| `/api/export` | marked 解析异常 / 写入失败 | 400 |

**设计原则：**
- 输入校验失败 → 400 Bad Request
- 资源不存在 → 404 Not Found
- 服务器内部错误（文件系统操作失败）→ 500 Internal Server Error
- 错误信息包含中文描述，前端可直接展示给用户

---

### 5.3 文件保存和导出的目录结构

```
项目根目录/
├── saved/          # Markdown 源文件
│   ├── 20260622_103000.md
│   ├── 20260622_110000.md
│   └── ...
└── exported/       # 导出的完整 HTML
    ├── 20260622_103000.html
    └── ...
```

**命名规则：** 使用时间戳 `YYYYMMDD_HHmmss` + 扩展名，由 `formatTimestamp()` 函数生成，精确到秒，避免文件名冲突。

**目录自动创建：** 服务启动时检查目录是否存在，不存在则自动创建（`fs.mkdirSync(..., { recursive: true })`）。

---

### 5.4 删除文件时的安全防护

删除和读取文件接口均包含两层安全防护：

1. **后缀检查**：文件名必须以 `.md` 结尾，防止访问其他类型文件
2. **路径穿越防护**：禁止文件名包含 `..`，防止 `../../etc/passwd` 这类路径穿越攻击

```javascript
if (!filename.endsWith('.md') || filename.includes('..')) {
  return res.status(400).json({ error: '无效的文件名' });
}
```

3. **存在性检查**：删除前先用 `fs.existsSync()` 判断文件是否存在，不存在返回 404

**代码位置：** [server.js#L86-L101](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L86-L101)

---

### 5.5 导出 HTML 的完整结构

导出的 HTML 文件是**完整的独立文档**，无需依赖任何外部资源，可直接在浏览器中打开查看。

**文件结构：**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>20260622_103000.html</title>
  <style>
    /* 内联样式：排版、代码块、引用、表格等 */
  </style>
</head>
<body>
  <!-- marked 渲染后的 HTML 内容 -->
</body>
</html>
```

**特点：**
- 完整的 DOCTYPE 和 HTML 结构
- 内联 CSS 样式，与预览区样式一致
- 响应式布局（`max-width: 800px; margin: 40px auto`）
- 支持中文（UTF-8 编码 + `lang="zh-CN"`）

---

## 6. 安全措施

| 安全措施 | 说明 | 位置 |
|---------|------|------|
| **输入类型校验** | 所有接收 `markdown` 参数的接口都检查 `typeof markdown === 'string'`，非字符串直接返回 400 | [server.js#L23-L24](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L23-L24) |
| **iframe 隔离** | 预览区使用 iframe 渲染 HTML，与主页面隔离，防止 XSS 攻击窃取页面数据 | [index.html#L64](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/index.html#L64-L64) |
| **路径穿越防护** | 文件名参数检查 `.md` 后缀和 `..` 字符，防止穿越到上级目录 | [server.js#L74-L75](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/server.js#L74-L75) |
| **文件后缀检查** | 保存文件强制 `.md` 后缀，导出文件强制 `.html` 后缀，避免恶意脚本文件 | 各接口逻辑 |
| **统一错误处理** | 所有异常通过 try-catch 捕获，返回结构化 JSON 错误，不泄漏堆栈信息 | 各接口逻辑 |
| **文件名不可控** | 保存/导出的文件名由服务器时间戳生成，用户无法自定义文件名，避免路径注入 | `formatTimestamp()` |
| **删除前确认** | 前端删除操作有 `confirm()` 二次确认，防止误删 | [app.js#L357](file:///Users/lindan/Desktop/solo/task_project/huachuang_markdown-preview/public/app.js#L357-L357) |

---

## 7. 运行方式

### 7.1 环境要求

- Node.js >= 14.x
- npm 或 yarn

### 7.2 安装依赖

```bash
cd huachuang_markdown-preview
npm install
```

### 7.3 启动服务

```bash
node server.js
```

启动成功后控制台输出：
```
Markdown Preview server running at http://localhost:3000
```

### 7.4 访问页面

在浏览器中打开：

```
http://localhost:3000
```

### 7.5 快速验证

使用 curl 快速测试接口：

```bash
# 测试渲染
curl -X POST http://localhost:3000/api/render \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# Hello"}'

# 测试保存
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# 测试"}'

# 测试列表
curl http://localhost:3000/api/saved

# 测试导出
curl -X POST http://localhost:3000/api/export \
  -H "Content-Type: application/json" \
  -d '{"markdown":"# 导出"}'
```
