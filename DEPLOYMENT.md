# 数据可视化平台 - 编译打包与服务器部署文档

## 目录

- [1. 架构概览](#1-架构概览)
- [2. 环境要求](#2-环境要求)
- [3. 本地开发](#3-本地开发)
- [4. 编译打包](#4-编译打包)
- [5. 生产部署](#5-生产部署)
  - [5.1 服务器初始化](#51-服务器初始化)
  - [5.2 项目部署](#52-项目部署)
  - [5.3 数据库初始化](#53-数据库初始化)
  - [5.4 切换至 MySQL](#54-切换至-mysql)
- [6. PM2 进程管理](#6-pm2-进程管理)
  - [6.1 安装 PM2](#61-安装-pm2)
  - [6.2 配置文件](#62-配置文件)
  - [6.3 常用命令](#63-常用命令)
  - [6.4 开机自启](#64-开机自启)
  - [6.5 日志管理](#65-日志管理)
  - [6.6 监控与告警](#66-监控与告警)
- [7. Nginx 反向代理](#7-nginx-反向代理)
  - [7.1 安装 Nginx](#71-安装-nginx)
  - [7.2 基础配置](#72-基础配置)
  - [7.3 HTTPS 配置](#73-https-配置)
  - [7.4 安全加固](#74-安全加固)
  - [7.5 性能优化](#75-性能优化)
- [8. CI/CD 自动化部署](#8-cicd-自动化部署)
- [9. 运维手册](#9-运维手册)
  - [9.1 日常巡检](#91-日常巡检)
  - [9.2 故障排查](#92-故障排查)
  - [9.3 备份与恢复](#93-备份与恢复)
  - [9.4 版本更新](#94-版本更新)
- [10. 环境变量参考](#10-环境变量参考)

---

## 1. 架构概览

```
                    ┌──────────────┐
                    │   客户端浏览器  │
                    └──────┬───────┘
                           │ HTTPS
                    ┌──────▼───────┐
                    │    Nginx     │
                    │  反向代理/SSL  │
                    │  :443 / :80  │
                    └──────┬───────┘
                           │ HTTP
                    ┌──────▼───────┐
                    │     PM2      │
                    │  进程守护/监控  │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Next.js 服务  │
                    │  Node.js SSR  │
                    │   :5000       │
                    ├──────────────┤
                    │  API Routes   │
                    │  /api/records │
                    │  /api/stats   │
                    ├──────────────┤
                    │  Prisma ORM   │
                    └──────┬───────┘
                           │
                ┌──────────▼──────────┐
                │      数据库          │
                │  SQLite / MySQL     │
                └─────────────────────┘
```

**技术栈清单：**

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 运行时 | Node.js | 20+ | 服务端运行环境 |
| 框架 | Next.js | 16 | App Router, SSR, API Routes |
| ORM | Prisma | 7 | 类型安全数据库操作 |
| 数据库 | SQLite / MySQL | - | 开发用 SQLite，生产推荐 MySQL |
| 进程管理 | PM2 | 5+ | 守护进程、负载均衡、日志 |
| 反向代理 | Nginx | 1.24+ | SSL 终结、请求代理、静态资源 |

---

## 2. 环境要求

### 服务器最低配置

| 资源 | 最低要求 | 推荐配置 |
|------|---------|---------|
| CPU | 1 核 | 2 核+ |
| 内存 | 1 GB | 2 GB+ |
| 磁盘 | 10 GB | 20 GB+ SSD |
| 系统 | Ubuntu 20.04 / CentOS 7+ | Ubuntu 22.04 LTS |

### 软件依赖

```bash
# Node.js 20+ (推荐使用 nvm 管理)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 20
nvm use 20

# pnpm
npm install -g pnpm

# PM2
npm install -g pm2

# Nginx
# Ubuntu/Debian
sudo apt update && sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx
```

### 生产环境 Node.js 版本锁定

```bash
# 在项目根目录创建 .nvmrc 文件
echo "20" > .nvmrc

# 部署时自动切换
nvm use
```

---

## 3. 本地开发

```bash
# 1. 克隆项目
git clone <repository-url>
cd projects

# 2. 安装依赖
pnpm install

# 3. 初始化数据库
npx prisma migrate dev --name init
npx prisma generate

# 4. 播种数据（可选）
npx tsx prisma/seed.ts

# 5. 启动开发服务器（端口 5000，支持 HMR）
pnpm dev
# 或
coze dev

# 6. 代码质量检查
pnpm validate      # 并行执行 ts-check + lint
pnpm ts-check      # TypeScript 类型检查
pnpm lint:build    # ESLint 静态扫描
```

---

## 4. 编译打包

### 4.1 标准构建流程

项目使用脚本化的构建流程，完整命令链如下：

```bash
#!/bin/bash
set -Eeuo pipefail

# ---------- 1. 安装依赖 ----------
pnpm install --frozen-lockfile

# ---------- 2. 生成 Prisma 客户端 ----------
npx prisma generate

# ---------- 3. Next.js 构建 ----------
pnpm next build
# 输出目录: .next/
# 包含: 服务端 SSR 代码 + 客户端静态资源

# ---------- 4. 打包自定义服务入口 ----------
pnpm tsup src/server.ts \
  --format cjs \
  --platform node \
  --target node20 \
  --outDir dist \
  --no-splitting \
  --no-minify
# 输出: dist/server.js — 生产环境启动入口
```

### 4.2 一键构建

```bash
# 使用项目内置脚本
pnpm build
# 等价于: bash ./scripts/build.sh
```

### 4.3 构建产物清单

```
projects/
├── .next/                    # Next.js 构建输出
│   ├── server/               # 服务端 SSR 代码
│   ├── static/               # 静态资源 (JS/CSS/图片)
│   └── BUILD_ID              # 构建版本标识
├── dist/
│   └── server.js             # 自定义服务入口 (CJS)
├── public/                   # 公共静态资源
├── prisma/
│   ├── dev.db                # SQLite 数据库文件
│   └── migrations/           # 数据库迁移文件
└── src/generated/prisma/     # Prisma 生成代码
```

### 4.4 构建优化建议

```bash
# 设置 Node.js 最大内存（大项目可能需要）
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# 开启 Next.js 输出文件追踪（standalone 模式）
# 在 next.config.ts 中添加:
# output: 'standalone'
# 构建后 .next/standalone/ 可独立运行，无需 node_modules
```

---

## 5. 生产部署

### 5.1 服务器初始化

```bash
# 1. 创建部署用户
sudo useradd -m -s /bin/bash deploy
sudo passwd deploy

# 2. 创建项目目录
sudo mkdir -p /opt/data-viz-platform
sudo chown deploy:deploy /opt/data-viz-platform

# 3. 创建数据目录（SQLite 数据库存储）
sudo mkdir -p /opt/data-viz-platform/data
sudo chown deploy:deploy /opt/data-viz-platform/data

# 4. 创建日志目录
sudo mkdir -p /var/log/data-viz-platform
sudo chown deploy:deploy /var/log/data-viz-platform

# 5. 配置防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
# 不要开放 5000 端口，仅通过 Nginx 代理访问
```

### 5.2 项目部署

```bash
# 切换到部署用户
su - deploy

# 进入项目目录
cd /opt/data-viz-platform

# 方式一：Git 拉取（推荐）
git clone <repository-url> .
git checkout <tag/version>

# 方式二：从构建产物部署（适合 CI/CD）
# 将本地构建产物上传到服务器
# scp -r .next/ dist/ public/ prisma/ package.json pnpm-lock.yaml deploy@server:/opt/data-viz-platform/

# 安装生产依赖（不含 devDependencies）
pnpm install --prod --frozen-lockfile

# 生成 Prisma 客户端
npx prisma generate

# 执行数据库迁移
npx prisma migrate deploy

# 播种初始数据（首次部署）
npx tsx prisma/seed.ts
```

### 5.3 数据库初始化

**SQLite（开发/轻量部署）：**

```bash
# 数据库文件位于项目根目录 dev.db
# 执行迁移自动创建
npx prisma migrate deploy

# 播种数据
DATABASE_URL="file:./dev.db" npx tsx prisma/seed.ts
```

**生产环境建议将 SQLite 数据库路径放到 data 目录：**

```bash
# .env.production
DATABASE_URL="file:/opt/data-viz-platform/data/production.db"
```

同时需更新 `src/lib/prisma.ts` 中的数据库路径指向。

### 5.4 切换至 MySQL

生产环境推荐使用 MySQL 以获得更好的并发性能和数据可靠性。

**1. 修改 Prisma Schema：**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**2. 更新 Prisma 客户端适配器：**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaMySQL } from "@prisma/adapter-mysql";
import mysql from "mysql2/promise";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connection = mysql.createPool(process.env.DATABASE_URL!);
  const adapter = new PrismaMySQL(connection);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**3. 安装 MySQL 适配器：**

```bash
pnpm add @prisma/adapter-mysql mysql2
```

**4. 配置环境变量：**

```bash
# .env.production
DATABASE_URL="mysql://user:password@localhost:3306/data_viz_platform"
```

**5. 创建数据库并迁移：**

```bash
mysql -u root -p -e "CREATE DATABASE data_viz_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE USER 'dataviz'@'localhost' IDENTIFIED BY 'StrongPassword123!';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON data_viz_platform.* TO 'dataviz'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# 重新生成 Prisma 客户端并迁移
npx prisma generate
npx prisma migrate deploy
```

---

## 6. PM2 进程管理

### 6.1 安装 PM2

```bash
npm install -g pm2

# 验证安装
pm2 --version
```

### 6.2 配置文件

在项目根目录创建 `ecosystem.config.cjs`：

```javascript
module.exports = {
  apps: [
    {
      name: "data-viz-platform",
      script: "dist/server.js",
      cwd: "/opt/data-viz-platform",

      // 环境变量
      env_production: {
        NODE_ENV: "production",
        COZE_PROJECT_ENV: "PROD",
        PORT: 5000,
        DATABASE_URL: "file:/opt/data-viz-platform/data/production.db",
        // MySQL 环境变量（切换后使用）
        // DATABASE_URL: "mysql://dataviz:StrongPassword123!@localhost:3306/data_viz_platform",
      },

      // 实例配置
      instances: 1,               // 单实例（SQLite 不支持多实例并发写入）
      // instances: "max",         // MySQL 可开启多实例（集群模式）
      // exec_mode: "cluster",     // MySQL 时启用集群模式
      exec_mode: "fork",

      // 自动重启
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      watch: false,
      max_memory_restart: "512M",

      // 日志配置
      out_file: "/var/log/data-viz-platform/access.log",
      error_file: "/var/log/data-viz-platform/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,

      // 优雅关闭
      kill_timeout: 10000,
      listen_timeout: 30000,
      shutdown_with_message: true,
    },
  ],
};
```

### 6.3 常用命令

```bash
# 启动生产服务
pm2 start ecosystem.config.cjs --env production

# 查看进程状态
pm2 status

# 查看详细信息
pm2 describe data-viz-platform

# 查看实时日志
pm2 logs data-viz-platform

# 仅查看错误日志
pm2 logs data-viz-platform --err

# 重启服务（零停机，仅集群模式）
pm2 reload data-viz-platform

# 重启服务（有短暂中断）
pm2 restart data-viz-platform

# 停止服务
pm2 stop data-viz-platform

# 删除进程
pm2 delete data-viz-platform

# 监控面板
pm2 monit
```

### 6.4 开机自启

```bash
# 生成开机自启脚本
pm2 startup

# 执行输出的命令（需要 sudo），类似：
# sudo env PATH=$PATH:/home/deploy/.nvm/versions/node/v20.x/bin \
#   /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy

# 保存当前进程列表
pm2 save

# 验证
systemctl status pm2-deploy
```

### 6.5 日志管理

```bash
# 安装日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 50M          # 单文件最大 50MB
pm2 set pm2-logrotate:retain 30             # 保留 30 个日志文件
pm2 set pm2-logrotate:compress true         # 压缩旧日志
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss  # 日期格式
pm2 set pm2-logrotate:rotateInterval "0 0 * * *"      # 每天凌晨轮转
```

### 6.6 监控与告警

```bash
# 使用 PM2 Plus（可选，SaaS 监控平台）
pm2 link <secret_key> <public_key>

# 本地监控脚本（crontab）
cat > /opt/data-viz-platform/scripts/health-check.sh << 'EOF'
#!/bin/bash
# 健康检查脚本 - 每分钟执行一次
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:5000)
if [ "$RESPONSE" != "200" ]; then
  echo "[$(date)] 服务异常，HTTP状态码: $RESPONSE，正在重启..." >> /var/log/data-viz-platform/health-check.log
  pm2 restart data-viz-platform
fi
EOF

chmod +x /opt/data-viz-platform/scripts/health-check.sh

# 添加 crontab
(crontab -l 2>/dev/null; echo "* * * * * /opt/data-viz-platform/scripts/health-check.sh") | crontab -
```

---

## 7. Nginx 反向代理

### 7.1 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nginx

# CentOS/RHEL
sudo yum install -y nginx

# 验证
nginx -v

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 7.2 基础配置

创建 Nginx 站点配置文件：

```bash
sudo vim /etc/nginx/sites-available/data-viz-platform
```

写入以下内容：

```nginx
# ============================================================
# 数据可视化平台 - Nginx 反向代理配置
# ============================================================

upstream nextjs_backend {
    # Next.js 服务地址（PM2 管理的 Node 进程）
    server 127.0.0.1:5000;

    # 高可用场景可配置多个后端
    # server 127.0.0.1:5001;
    # server 127.0.0.1:5002;

    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 256;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/json
        application/xml
        application/rss+xml
        image/svg+xml;

    # 静态资源代理（Next.js 构建产物）
    location /_next/static/ {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
        expires 365d;
        access_log off;
    }

    # 图片等静态资源
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot)$ {
        proxy_pass http://nextjs_backend;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    # API 路由 - 不缓存，直接代理
    location /api/ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 请求头透传
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 禁用缓存
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # 其他请求 - 默认代理到 Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://nextjs_backend;
        access_log off;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

启用站点并重载配置：

```bash
# 创建软链接启用站点
sudo ln -s /etc/nginx/sites-available/data-viz-platform /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置语法
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

### 7.3 HTTPS 配置

**使用 Let's Encrypt 免费证书：**

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书（自动修改 Nginx 配置）
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 证书自动续期（Certbot 已自动配置 systemd timer）
sudo certbot renew --dry-run   # 测试续期流程
```

**手动 HTTPS 配置：**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # HTTP 强制跳转 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 协议与加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS（强制 HTTPS，31536000 秒 = 1 年）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # SSL 会话缓存
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # ... 其余配置同 7.2 节 ...
}
```

### 7.4 安全加固

```nginx
server {
    # 隐藏 Nginx 版本号
    server_tokens off;

    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;

    # 防止 MIME 类型嗅探
    add_header X-Content-Type-Options "nosniff" always;

    # XSS 防护
    add_header X-XSS-Protection "1; mode=block" always;

    # CSP 策略（根据实际需求调整）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.googleapis.cn https://fonts.gstatic.cn;" always;

    # 引用来源策略
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 权限策略
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # 禁止访问敏感路径
    location ~* ^/(\.env|\.git|prisma|node_modules|src) {
        deny all;
        return 404;
    }

    # 请求方法限制
    if ($request_method !~ ^(GET|POST|PUT|DELETE|HEAD|OPTIONS)$ ) {
        return 405;
    }

    # 请求体大小限制
    client_max_body_size 10m;

    # ... 其余配置 ...
}
```

### 7.5 性能优化

```nginx
# /etc/nginx/nginx.conf 全局优化

user www-data;
worker_processes auto;                    # 自动匹配 CPU 核心数
worker_rlimit_nofile 65535;

events {
    worker_connections 4096;              # 单进程最大连接数
    multi_accept on;                      # 同时接受多个连接
    use epoll;                            # Linux 高性能事件模型
}

http {
    # 连接优化
    keepalive_timeout 65;
    keepalive_requests 1000;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # 缓冲区
    client_body_buffer_size 16K;
    client_header_buffer_size 1k;
    client_max_body_size 10m;
    large_client_header_buffers 4 8k;

    # FastCGI/Open File Cache
    open_file_cache max=2000 inactive=20s;
    open_file_cache_valid 60s;
    open_file_cache_min_uses 2;
    open_file_cache_errors off;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'rt=$request_time';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
}
```

---

## 8. CI/CD 自动化部署

### GitHub Actions 示例

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ["v*"]

env:
  NODE_VERSION: "20"
  PNPM_VERSION: "9"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Lint & Type Check
        run: pnpm validate

      - name: Build
        run: pnpm build

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: |
            .next/
            dist/
            public/
            prisma/
            package.json
            pnpm-lock.yaml

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: build-output
          path: ./deploy

      - name: Deploy to Server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          source: "./deploy/*"
          target: "/opt/data-viz-platform"
          strip_components: 1

      - name: Restart Service
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /opt/data-viz-platform
            pnpm install --prod --frozen-lockfile
            npx prisma migrate deploy
            pm2 restart data-viz-platform
```

### 手动部署脚本

创建 `scripts/deploy.sh`：

```bash
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
```

---

## 9. 运维手册

### 9.1 日常巡检

```bash
# 服务状态
pm2 status
pm2 describe data-viz-platform

# 系统资源
pm2 monit

# 最近日志
pm2 logs data-viz-platform --lines 100

# Nginx 状态
sudo systemctl status nginx
sudo nginx -t

# 磁盘空间
df -h /opt/data-viz-platform

# 数据库大小（SQLite）
ls -lh /opt/data-viz-platform/data/production.db

# 数据库记录数
curl -s http://localhost:5000/api/stats | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'总记录数: {d[\"data\"][\"total\"]}')"
```

### 9.2 故障排查

| 症状 | 排查步骤 | 常见原因 |
|------|---------|---------|
| 页面 502 | `pm2 status` 检查进程是否存活 | Node 进程崩溃，PM2 重启次数耗尽 |
| 页面 504 | 检查 `pm2 logs` 中的超时日志 | Next.js 编译缓存未生成，首次请求慢 |
| API 500 | `pm2 logs --err` 查看错误堆栈 | 数据库连接失败、Prisma 查询异常 |
| 静态资源 404 | 检查 `.next/static/` 是否存在 | 构建不完整、Nginx 代理路径错误 |
| 数据库锁定 | 检查并发写入情况 | SQLite 并发写入冲突，需切换 MySQL |
| 内存溢出 | `pm2 monit` 查看内存使用 | Node 堆内存不足，调整 `max_memory_restart` |

**常见故障修复命令：**

```bash
# Node 进程崩溃 - 查看错误日志
pm2 logs data-viz-platform --err --lines 200

# 清除 Next.js 缓存重建
rm -rf .next
pnpm build
pm2 restart data-viz-platform

# 数据库迁移失败 - 重置迁移状态
npx prisma migrate status
npx prisma migrate resolve --applied <migration_name>

# Nginx 配置错误
sudo nginx -t
sudo systemctl reload nginx

# 端口被占用
ss -lptn 'sport = :5000'
# 杀死占用进程
kill -9 <PID>
pm2 restart data-viz-platform
```

### 9.3 备份与恢复

**SQLite 备份：**

```bash
#!/bin/bash
# scripts/backup.sh
BACKUP_DIR="/opt/data-viz-platform/backups/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_PATH="/opt/data-viz-platform/data/production.db"

mkdir -p "${BACKUP_DIR}"

# 使用 SQLite 自带的备份命令（安全，不会锁库）
sqlite3 "${DB_PATH}" ".backup '${BACKUP_DIR}/db_${TIMESTAMP}.db'"

# 压缩
gzip "${BACKUP_DIR}/db_${TIMESTAMP}.db"

# 保留最近 30 天的备份
find "${BACKUP_DIR}" -name "*.db.gz" -mtime +30 -delete

echo "✅ 数据库备份完成: db_${TIMESTAMP}.db.gz"
```

**自动备份（crontab）：**

```bash
# 每天凌晨 3 点自动备份
crontab -e
0 3 * * * /opt/data-viz-platform/scripts/backup.sh >> /var/log/data-viz-platform/backup.log 2>&1
```

**恢复数据库：**

```bash
# 停止服务
pm2 stop data-viz-platform

# 恢复备份
gunzip -c /opt/data-viz-platform/backups/db/db_20260101_030000.db.gz > /opt/data-viz-platform/data/production.db

# 重启服务
pm2 start data-viz-platform
```

**MySQL 备份（切换后使用）：**

```bash
# 全量备份
mysqldump -u dataviz -p data_viz_platform > backup_$(date +%Y%m%d).sql

# 恢复
mysql -u dataviz -p data_viz_platform < backup_20260101.sql
```

### 9.4 版本更新

```bash
# 1. 拉取新版本
cd /opt/data-viz-platform
git fetch --tags
git checkout <new-version-tag>

# 2. 安装依赖
pnpm install --frozen-lockfile

# 3. 数据库迁移
npx prisma migrate deploy

# 4. 重新构建
pnpm build

# 5. 重启服务
pm2 restart data-viz-platform

# 6. 验证
sleep 5
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:5000
```

---

## 10. 环境变量参考

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `NODE_ENV` | 是 | - | `production` |
| `COZE_PROJECT_ENV` | 是 | - | `PROD` 标识生产环境 |
| `PORT` | 是 | `5000` | 服务监听端口 |
| `DATABASE_URL` | 是 | - | 数据库连接字符串 |
| `HOSTNAME` | 否 | `localhost` | 服务主机名 |
| `NODE_OPTIONS` | 否 | - | Node.js 运行时参数 |

**SQLite 连接字符串格式：**

```
file:/absolute/path/to/database.db
```

**MySQL 连接字符串格式：**

```
mysql://user:password@host:3306/database?schema=public
```

**生产环境 `.env.production` 示例：**

```bash
NODE_ENV=production
COZE_PROJECT_ENV=PROD
PORT=5000
DATABASE_URL=file:/opt/data-viz-platform/data/production.db
# MySQL 模式:
# DATABASE_URL=mysql://dataviz:StrongPassword123!@localhost:3306/data_viz_platform
HOSTNAME=0.0.0.0
NODE_OPTIONS=--max-old-space-size=512
```

---

> 文档版本: 1.0 | 最后更新: 2026-05-12 | 技术栈: Next.js 16 + Prisma 7 + PM2 + Nginx
