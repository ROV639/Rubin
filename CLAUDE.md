# Rubin Gallery — 作品集网站

> 完整网站部署模板，可直接复用创建 AI 教程等其他静态网站

## 项目概述

| 项目 | 值 |
|------|-----|
| 网址 | https://rubin.ccwu.cc |
| 类型 | AI 艺术作品展示 + 管理后台 |
| 技术栈 | Astro 5 + Tailwind CSS + Cloudflare Pages/Workers/KV |
| GitHub | https://github.com/ROV639/Rubin |
| 管理后台 | https://rubin.ccwu.cc/admin（密码：rubin639） |

## 技术架构（免费方案）

| 组件 | 服务 | 费用 | 说明 |
|------|------|------|------|
| 前端托管 | Cloudflare Pages | 免费 | 静态站点，无限流量 |
| 图片存储 | imgbb.com | 免费 | 1GB存储，无限上传，中国可访问 |
| 数据存储 | Cloudflare KV | 免费 | 图片元数据（JSON） |
| 后端API | Cloudflare Workers | 免费 | CRUD 接口 |
| 域名 | Cloudflare DNS | 免费 | rubin.ccwu.cc |

## 完整部署流程（从零开始）

### 1. 本地项目初始化

```bash
# 创建 Astro 项目
npm create astro@latest my-site -- --template minimal
cd my-site
npm install
npm install @astrojs/tailwind tailwindcss

# 配置 astro.config.mjs
import tailwind from '@astrojs/tailwind';
export default {
  integrations: [tailwind()],
  output: 'static',
};
```

### 2. 创建 Cloudflare Workers API

在 `functions/api/images.js` 创建 Worker：

```javascript
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    const KV = 'your_kv_name';
    // GET/POST/DELETE 处理逻辑...
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};
```

### 3. 创建 Cloudflare KV Namespace

1. 打开 https://dash.cloudflare.com
2. Workers 和 Pages → KV → 创建命名空间
3. 记录 Namespace ID（例如 `6d7e5b31ce444040a6e018b15831ed7b`）

### 4. 配置 wrangler.toml

```toml
name = "my-api"
main = "functions/api/images.js"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "KV"
id = "你的Namespace ID"
```

### 5. 创建 GitHub 仓库

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ROV639/my-site.git
git push -u origin main
```

### 6. 连接 Cloudflare Pages

1. 打开 https://dash.cloudflare.com → Pages
2. 创建项目 → 连接 GitHub 仓库
3. **重要**：确认 Production branch 是 `main`（不是 master）
4. 构建命令：`npm run build`
5. 输出目录：`dist/`

### 7. 配置自定义域名

1. Pages 项目 → 自定义域
2. 添加 `your-domain.com`
3. Cloudflare 会自动验证并创建 DNS 记录
4. 等待 SSL 证书自动签发

### 8. 推送代码触发部署

```bash
git push origin main
```

Cloudflare 会自动检测到推送并在 1-3 分钟内完成部署。

## 关键地址

| 地址 | 说明 |
|------|------|
| https://rubin.ccwu.cc | 主页 |
| https://rubin.ccwu.cc/admin | 管理后台 |
| https://rubin-gallery-api.luokaijun2025.workers.dev | Worker API |

## Cloudflare KV 配置

| 项目 | 值 |
|------|-----|
| KV Namespace ID | `6d7e5b31ce444040a6e018b15831ed7b` |
| KV Key | `rubin_gallery` |

## Worker API 接口

```
GET  /           → 获取所有数据
POST /           → 替换整个数据列表
DELETE /         → 删除指定项（body: {id: string}）
```

## 目录结构

```
Rubin/
├── src/
│   ├── pages/
│   │   ├── index.astro    # 主页
│   │   └── admin.astro    # 管理后台
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   └── styles/
├── functions/api/
│   └── images.js          # Cloudflare Worker
├── public/
│   ├── sw.js              # Service Worker（PWA）
│   ├── manifest.json       # PWA清单
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.js
├── wrangler.toml           # Cloudflare Workers 配置
└── package.json
```

## 本地开发命令

```bash
npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

## 常见问题排查

### Q: GitHub push 后网站没更新？
1. 检查 Cloudflare Pages 监听的分支（通常要设为 main 或 master）
2. 确认本地和远程分支一致：`git branch -a`
3. 去 Cloudflare Pages 后台看部署状态

### Q: 构建失败？
1. 检查 package.json 依赖
2. Node 版本：确保 `node -v` 是 18+
3. 删 node_modules 重新安装：`rm -rf node_modules && npm install`

### Q: 页面加载后空白/功能不工作？
1. 按 F12 打开浏览器控制台
2. 看有没有红色错误
3. Network 面板检查 API 请求是否成功

### Q: API 请求失败？
1. 检查 Worker 是否正确部署
2. 检查 KV Namespace ID 是否正确
3. 检查 Worker 日志：Cloudflare Dashboard → Workers → 你的 Worker → 日志

### Q: 自定义域名无法访问？
1. 检查 DNS 记录是否正确
2. CNAME 要指向 `你的项目.pages.dev`
3. SSL 证书：等待自动签发或重新触发验证

## 重要教训

1. **分支同步**：Cloudflare Pages 监听固定分支，推送前确认分支一致
2. **非空断言**：TypeScript `!` 要确认元素存在，否则用 `?.` 可选链
3. **缓存**：部署后可能需要等几分钟或清除浏览器/Cloudflare 缓存

## 复用模板创建新网站

创建 AI 教程网站步骤：

1. 复制 `Rubin/` 整个目录
2. 修改 `package.json` 的项目名
3. 修改 `src/pages/` 里的内容
4. 修改 `functions/api/images.js` 的数据结构和逻辑
5. 修改 `wrangler.toml` 的 name 和 KV 配置
6. 在 Cloudflare 创建新 KV Namespace
7. 连接新 GitHub 仓库
8. 推送到新仓库

## 相关文档

- 主 CLAUDE.md：~/.claude/CLAUDE.md
- OpenClaw 运维：⚜️Claude Studio/📘openclaw运维手册/
