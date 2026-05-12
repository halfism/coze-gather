#!/bin/bash
set -Eeuo pipefail

# ============================================================
# 数据可视化平台 - 一键部署脚本
# 用法: bash scripts/deploy.sh [version_tag]
# ============================================================

DEPLOY_DIR="/opt/data-viz-platform"
VERSION="${1:-latest}"
BACKUP_DIR="/opt/data-viz-platform/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "========================================="
echo " 数据可视化平台 - 部署脚本"
echo " 版本: ${VERSION}"
echo " 时间: ${TIMESTAMP}"
echo "========================================="

cd "${DEPLOY_DIR}"

# 1. 备份当前版本
echo "[1/7] 备份当前版本..."
mkdir -p "${BACKUP_DIR}"
if [ -d ".next" ]; then
  tar czf "${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz" \
    .next/ dist/ public/ prisma/ package.json pnpm-lock.yaml 2>/dev/null || true
  echo "  备份已保存: ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz"
fi

# 2. 拉取最新代码
echo "[2/7] 拉取代码..."
git fetch --tags
git checkout "${VERSION}"
git pull origin "${VERSION}"

# 3. 安装依赖
echo "[3/7] 安装依赖..."
pnpm install --frozen-lockfile

# 4. 生成 Prisma 客户端
echo "[4/7] 生成 Prisma 客户端..."
npx prisma generate

# 5. 执行数据库迁移
echo "[5/7] 执行数据库迁移..."
npx prisma migrate deploy

# 6. 构建
echo "[6/7] 构建项目..."
pnpm build

# 7. 重启服务
echo "[7/7] 重启服务..."
pm2 restart data-viz-platform

# 等待服务启动
sleep 5

# 健康检查
echo ""
echo "健康检查..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 http://localhost:5000)
if [ "${HTTP_CODE}" = "200" ]; then
  echo "✅ 部署成功！服务运行正常 (HTTP ${HTTP_CODE})"
else
  echo "❌ 部署异常！HTTP 状态码: ${HTTP_CODE}"
  echo "回滚命令: tar xzf ${BACKUP_DIR}/backup_${TIMESTAMP}.tar.gz -C ${DEPLOY_DIR} && pm2 restart data-viz-platform"
  exit 1
fi

echo "========================================="
echo " 部署完成！"
echo "========================================="
