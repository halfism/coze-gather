#!/bin/bash
# ============================================================
# 一键打包脚本 - 编译构建 + 依赖打包为可部署压缩包
# 用法: bash scripts/pack.sh [版本号]
# 输出: release/data-viz-platform-{版本号}.tar.gz
#
# 核心策略:
#   pnpm 的符号链接结构不适合打包分发，
#   因此在打包阶段使用 npm 安装扁平化的生产依赖。
#   服务器端解压即可运行，无需任何构建步骤。
# ============================================================
set -Eeuo pipefail

VERSION="${1:-$(date +%Y%m%d%H%M%S)}"
PROJECT_NAME="data-viz-platform"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${PROJECT_DIR}/release"
PACKAGE_NAME="${PROJECT_NAME}-${VERSION}"
STAGE_DIR="${OUTPUT_DIR}/${PACKAGE_NAME}"

echo "========================================="
echo "  数据可视化平台 - 一键打包"
echo "  版本: ${VERSION}"
echo "========================================="

# 清理旧的构建产物
echo "[1/8] 清理旧构建产物..."
cd "${PROJECT_DIR}"
rm -rf .next dist release
mkdir -p "${STAGE_DIR}"

# 安装全部依赖（含 devDependencies，构建需要）
echo "[2/8] 安装依赖..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Prisma 生成客户端
echo "[3/8] 生成 Prisma 客户端..."
npx prisma generate

# 构建 Next.js
echo "[4/8] 构建 Next.js..."
pnpm next build

# 构建 Server 入口
echo "[5/8] 构建服务入口..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

# 使用 npm 安装扁平化生产依赖（解决 pnpm 符号链接打包问题）
echo "[6/8] 安装扁平化生产依赖 (npm)..."
DEPLOY_NM="${STAGE_DIR}/node_modules"
mkdir -p "${DEPLOY_NM}"

# 提取 dependencies 列表，用 npm 安装到部署目录
cd "${STAGE_DIR}"
npm install --production --prefix . \
  $(node -e "
    const pkg = require('${PROJECT_DIR}/package.json');
    const deps = Object.entries(pkg.dependencies)
      .map(([name, ver]) => name + '@' + ver);
    console.log(deps.join(' '));
  ") 2>&1 | tail -5

# 组装其他文件
echo "[7/8] 组装部署包..."

# 1) Next.js 构建产物
mkdir -p .next
cp -r "${PROJECT_DIR}/.next/server" .next/
cp -r "${PROJECT_DIR}/.next/static" .next/
cp "${PROJECT_DIR}/.next/package.json" .next/ 2>/dev/null || true

# 2) 服务入口
cp -r "${PROJECT_DIR}/dist" dist

# 3) Prisma 相关
mkdir -p prisma
cp "${PROJECT_DIR}/prisma/schema.prisma" prisma/
if [ -d "${PROJECT_DIR}/prisma/migrations" ]; then
  cp -r "${PROJECT_DIR}/prisma/migrations" prisma/
fi

# 4) Prisma 生成代码（运行时必需）
cp -r "${PROJECT_DIR}/src/generated" src_generated

# 5) 静态资源
if [ -d "${PROJECT_DIR}/public" ]; then
  cp -r "${PROJECT_DIR}/public" public
fi

# 6) SQLite 数据库（如有）
if [ -f "${PROJECT_DIR}/dev.db" ]; then
  cp "${PROJECT_DIR}/dev.db" dev.db
  echo "  [info] 包含 SQLite 数据库文件"
else
  echo "  [info] 未发现数据库文件，首次启动将自动创建"
fi

# 7) 环境变量模板
cat > .env.production << 'ENVEOF'
NODE_ENV=production
COZE_PROJECT_ENV=PROD
PORT=5000
# 如需切换 MySQL，修改下方连接串并更新 prisma/schema.prisma
# DATABASE_URL="mysql://user:password@localhost:3306/data_viz"
ENVEOF

# 8) PM2 配置
cat > ecosystem.config.cjs << 'PM2EOF'
module.exports = {
  apps: [{
    name: "data-viz-platform",
    script: "start.sh",
    cwd: "./",
    env: {
      NODE_ENV: "production",
      COZE_PROJECT_ENV: "PROD",
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    restart_delay: 3000,
    max_memory_restart: "512M",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    merge_logs: true
  }]
};
PM2EOF

# 9) 启动脚本
cat > start.sh << 'STARTEOF'
#!/bin/bash
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "${APP_DIR}"

# 加载环境变量
[ -f .env ] && export $(grep -v '^#' .env | xargs) 2>/dev/null || true
[ -f .env.production ] && export $(grep -v '^#' .env.production | xargs) 2>/dev/null || true
[ -f .env.local ] && export $(grep -v '^#' .env.local | xargs) 2>/dev/null || true

export PORT="${PORT:-5000}"
export NODE_ENV="${NODE_ENV:-production}"
export COZE_PROJECT_ENV="${COZE_PROJECT_ENV:-PROD}"

# 创建日志目录
mkdir -p logs

# 检查是否首次运行（无数据库时自动迁移）
if [ ! -f "dev.db" ]; then
  echo "[init] 首次部署，执行数据库迁移..."
  npx prisma migrate deploy 2>/dev/null || true
fi

echo "========================================="
echo "  数据可视化平台启动中..."
echo "  端口: ${PORT}"
echo "  环境: ${NODE_ENV}"
echo "========================================="

node dist/server.js
STARTEOF
chmod +x start.sh

# 10) 快捷命令脚本
cat > ctl.sh << 'CTLEOF'
#!/bin/bash
# 服务控制脚本
# 用法: ./ctl.sh [start|stop|restart|status|log|startup]
set -e

ACTION="${1:-help}"
APP_NAME="data-viz-platform"

case "$ACTION" in
  start)
    echo "启动服务 (PM2)..."
    pm2 start ecosystem.config.cjs
    pm2 save
    ;;
  stop)
    echo "停止服务..."
    pm2 stop ${APP_NAME}
    ;;
  restart)
    echo "重启服务..."
    pm2 restart ${APP_NAME}
    ;;
  status)
    pm2 status ${APP_NAME}
    ;;
  log)
    pm2 logs ${APP_NAME} --lines 50
    ;;
  startup)
    echo "注册开机自启..."
    pm2 startup
    pm2 save
    echo "完成。重启服务器后将自动启动服务。"
    ;;
  help|*)
    echo "数据可视化平台 - 服务控制"
    echo ""
    echo "  ./ctl.sh start    - 启动服务 (PM2 守护)"
    echo "  ./ctl.sh stop     - 停止服务"
    echo "  ./ctl.sh restart  - 重启服务"
    echo "  ./ctl.sh status   - 查看状态"
    echo "  ./ctl.sh log      - 查看日志"
    echo "  ./ctl.sh startup  - 注册开机自启"
    ;;
esac
CTLEOF
chmod +x ctl.sh

# 11) Nginx 配置模板
mkdir -p nginx
cat > nginx/data-viz.conf << 'NGINXEOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为实际域名或 IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# 打包压缩
echo ""
echo "正在压缩..."
STAGE_SIZE=$(du -sh "${STAGE_DIR}" | cut -f1)
NM_FILE_COUNT=$(find "${DEPLOY_NM}" -type f | wc -l)
echo "  打包前大小: ${STAGE_SIZE}"
echo "  依赖文件数: ${NM_FILE_COUNT}"

cd "${OUTPUT_DIR}"
tar -czf "${PACKAGE_NAME}.tar.gz" "${PACKAGE_NAME}"
rm -rf "${PACKAGE_NAME}"

FILE_SIZE=$(du -h "${PACKAGE_NAME}.tar.gz" | cut -f1)
FILE_PATH="${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz"

echo ""
echo "========================================="
echo "  打包完成!"
echo "========================================="
echo ""
echo "  文件: ${FILE_PATH}"
echo "  大小: ${FILE_SIZE}"
echo "  版本: ${VERSION}"
echo ""
echo "  ┌─────────────────────────────────────────────┐"
echo "  │  三步部署                                    │"
echo "  │                                              │"
echo "  │  1. 上传:                                    │"
echo "  │     scp ${FILE_PATH} user@server:/opt/        │"
echo "  │                                              │"
echo "  │  2. 解压:                                    │"
echo "  │     cd /opt && tar -xzf ${PACKAGE_NAME}.tar.gz│"
echo "  │                                              │"
echo "  │  3. 启动:                                    │"
echo "  │     cd ${PACKAGE_NAME} && ./ctl.sh start      │"
echo "  └─────────────────────────────────────────────┘"
echo ""

# 恢复开发环境依赖
echo "[8/8] 恢复开发环境依赖..."
cd "${PROJECT_DIR}"
pnpm install 2>/dev/null || true
