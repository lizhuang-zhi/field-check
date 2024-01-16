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
echo "部署详情：https://github.com/lizhuang-zhi/field-check/tree/gh-pages"
echo "访问地址：https://lizhuang-zhi.github.io/field-check/"