#!/usr/bin/env bash
# Rubin Gallery 一键部署
# 用法：./deploy.sh [--push]
#   无参数  → 本地构建 + 预览（不联网推送）
#   --push  → 构建后 git push 到 GitHub，触发 Cloudflare Pages 自动部署
#
# 前置：Node 18+；首次运行自动 npm install
# 凭证：git push 走系统已配置的 gh / git 凭证，本脚本不内嵌 token

set -euo pipefail
cd "$(dirname "$0")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log() { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
err() { echo -e "${RED}[err]${NC} $*"; }

# 1. 依赖
if [ ! -d node_modules ]; then
  log "首次运行，安装依赖..."
  npm install
fi

# 2. 构建
log "构建静态站点..."
npm run build
log "构建完成 → dist/"

# 3. 推送（可选）
if [ "${1:-}" = "--push" ]; then
  if [ ! -d .git ]; then
    err "当前目录无 .git，无法 push。"
    err "首次需初始化：git init && git remote add origin https://github.com/ROV639/Rubin.git"
    exit 1
  fi
  log "提交并推送到 GitHub..."
  git add -A
  git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" || warn "无改动可提交"
  git push origin main
  log "已推送，Cloudflare Pages 将在 1-3 分钟内自动部署"
  log "查看：https://rubin.ccwu.cc"
else
  log "本地预览（Ctrl+C 退出）。联网部署请加 --push"
  npm run preview
fi
