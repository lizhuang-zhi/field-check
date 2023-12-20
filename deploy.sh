#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 构建项目
npm run build

# 将改动提交到 main 分支
git add .
git commit -m 'Update main branch'
git push origin main

# 执行 npm run deploy 部署到 GitHub Pages
npm run deploy

# 提示完成
echo "Deployment complete!"
