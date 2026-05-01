# Rubin Gallery — 作品集网站

## 项目概述

- **网址**：https://rubin.ccwu.cc
- **类型**：AI 艺术作品展示 + 管理后台
- **技术栈**：Astro 5 + Tailwind CSS + Cloudflare Pages/Workers/KV
- **定位**：泽川的 AI 艺术作品集

## 技术架构

| 组件 | 服务 | 说明 |
|------|------|------|
| 前端 | Cloudflare Pages | 静态站点，rubin.ccwu.cc |
| 图片存储 | imgbb.com | 免费无限，中国可访问 |
| 数据存储 | Cloudflare KV | 图片元数据（id/src/prompt/category/time/platform） |
| API | Cloudflare Workers | Worker 函数处理 CRUD |
| 域名 | Cloudflare DNS | rubin.ccwu.cc → Pages |

## 关键地址

| 地址 | 说明 |
|------|------|
| https://rubin.ccwu.cc | 主页 |
| https://rubin.ccwu.cc/admin | 管理后台（密码：rubin639） |
| https://rubin-gallery-api.luokaijun2025.workers.dev | Worker API（供前端调用） |

## Cloudflare KV 配置

| 项目 | 值 |
|------|-----|
| KV Namespace ID | `6d7e5b31ce444040a6e018b15831ed7b` |
| KV Key | `rubin_gallery`（存储图片数组 JSON） |

## Worker API 接口

```
GET  /           → 获取所有图片
POST /           → 替换整个图片列表
DELETE /         → 删除指定图片（body: {id: string}）
```

## 目录结构

```
Rubin/
├── src/
│   ├── pages/
│   │   ├── index.astro    # 主页画廊
│   │   └── admin.astro    # 管理后台
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   └── styles/
├── functions/api/
│   └── images.js          # Cloudflare Worker
├── public/
│   ├── sw.js              # Service Worker（PWA离线缓存）
│   ├── manifest.json       # PWA清单
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.js
├── wrangler.toml           # Cloudflare Workers 配置
└── package.json
```

## 部署流程

### 方式1：GitHub 自动部署（推荐）

1. Cloudflare Pages 已连接 GitHub 仓库 `ROV639/Rubin`
2. 每次 push 到 master 分支，Cloudflare Pages 自动构建部署
3. 构建命令：`npm run build`
4. 输出目录：`dist/`

### 方式2：手动部署

```bash
# 本地构建
npm run build

# 上传 dist/ 文件夹到 Cloudflare Pages
```

## 常见问题

### Q: 图片上传后不显示？
A: 检查浏览器控制台网络请求，确认 Worker API 返回数据正常。

### Q: 构建失败？
A: 检查 package.json 依赖是否有冲突，参考 `npm install --legacy-peer-deps`。

### Q: wrangler.toml 无效？
A: Cloudflare Pages 使用时需要 `pages_build_output_dir = "dist"` 字段。

## 相关文档

- CLAUDE.md（主）：~/.claude/CLAUDE.md
- OpenClaw 运维：⚜️Claude Studio/📘openclaw运维手册/
