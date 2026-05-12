#!/bin/bash

# ============================================================
# 数据可视化平台 - 数据库备份脚本
# 用法: bash scripts/backup.sh
# 建议: crontab 每天凌晨 3 点执行
#   0 3 * * * /opt/data-viz-platform/scripts/backup.sh >> /var/log/data-viz-platform/backup.log 2>&1
# ============================================================

set -Eeuo pipefail

BACKUP_DIR="/opt/data-viz-platform/backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_PATH="${DB_PATH:-/opt/data-viz-platform/data/production.db}"

mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_PATH}" ]; then
  echo "❌ 数据库文件不存在: ${DB_PATH}"
  exit 1
fi

# 使用 SQLite 自带的备份命令（安全，不会锁库）
sqlite3 "${DB_PATH}" ".backup '${BACKUP_DIR}/db_${TIMESTAMP}.db'"

# 压缩
gzip "${BACKUP_DIR}/db_${TIMESTAMP}.db"

# 保留最近 30 天的备份
find "${BACKUP_DIR}" -name "*.db.gz" -mtime +30 -delete

echo "✅ [$(date)] 数据库备份完成: db_${TIMESTAMP}.db.gz (大小: $(ls -lh ${BACKUP_DIR}/db_${TIMESTAMP}.db.gz | awk '{print $5}'))"
