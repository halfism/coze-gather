# 数据可视化平台 - 部署文档

## 一句话部署

```bash
# 开发机打包
bash scripts/pack.sh v1.0

# 服务器部署
scp release/data-viz-platform-v1.0.tar.gz user@server:/opt/
ssh user@server "cd /opt && tar -xzf data-viz-platform-v1.0.tar.gz && cd data-viz-platform-v1.0 && ./ctl.sh start"
```

---

## 1. 打包

### 1.1 前置条件

- Node.js 20+ / pnpm 9+
- 源码仓库完整（含 prisma、src 等目录）

### 1.2 执行打包

```bash
# 指定版本号（推荐）
bash scripts/pack.sh v1.0.0

# 省略版本号，自动使用时间戳
bash scripts/pack.sh
```

### 1.3 产出物

```
release/
└── data-viz-platform-v1.0.0.tar.gz
```

### 1.4 压缩包内容

| 目录/文件 | 说明 |
|-----------|------|
| `.next/` | Next.js 编译产物（SSR 页面 + 静态资源） |
| `dist/server.js` | Node.js 服务入口 |
| `node_modules/` | 生产依赖（仅 dependencies，不含 devDependencies） |
| `prisma/` | Schema + 迁移文件 |
| `src_generated/` | Prisma 客户端生成代码 |
| `public/` | 静态资源 |
| `dev.db` | SQLite 数据库（如有） |
| `.env.production` | 环境变量模板 |
| `ecosystem.config.cjs` | PM2 进程配置 |
| `start.sh` | 启动脚本 |
| `ctl.sh` | 服务控制脚本（start/stop/restart/status/log） |
| `nginx/` | Nginx 配置模板 |

---

## 2. 服务器部署

### 2.1 服务器要求

| 项目 | 要求 |
|------|------|
| OS | Linux (Ubuntu 20.04+ / CentOS 7+) |
| Node.js | 20+ |
| 内存 | ≥ 1GB |
| 磁盘 | ≥ 2GB |
| PM2 | 全局安装 (`npm i -g pm2`) |

> **注意**: 压缩包内已包含全部依赖和构建产物，服务器**无需**执行 `pnpm install` 或 `pnpm build`。

### 2.2 部署步骤

```bash
# 1. 上传压缩包到服务器
scp release/data-viz-platform-v1.0.0.tar.gz user@server:/opt/

# 2. SSH 登录服务器
ssh user@server

# 3. 解压
cd /opt
tar -xzf data-viz-platform-v1.0.0.tar.gz

# 4. 启动服务
cd data-viz-platform-v1.0.0
./ctl.sh start

# 5. 验证
curl http://localhost:5000/api/records
```

启动成功后输出：

```
=========================================
  数据可视化平台启动中...
  端口: 5000
  环境: production
=========================================
> Server listening at http://localhost:5000 as PROD
```

### 2.3 服务控制

```bash
./ctl.sh start     # 启动（PM2 守护进程）
./ctl.sh stop      # 停止
./ctl.sh restart   # 重启
./ctl.sh status    # 查看状态
./ctl.sh log       # 查看实时日志
./ctl.sh startup   # 注册开机自启
```

### 2.4 环境变量

编辑 `.env.production` 或创建 `.env.local`：

```bash
# 必需
NODE_ENV=production
COZE_PROJECT_ENV=PROD
PORT=5000

# MySQL 切换时配置（见第 4 节）
# DATABASE_URL="mysql://user:password@localhost:3306/data_viz"
```

修改后执行 `./ctl.sh restart` 生效。

---

## 3. Nginx 反向代理

### 3.1 安装

```bash
# Ubuntu
sudo apt install -y nginx

# CentOS
sudo yum install -y nginx
```

### 3.2 配置

压缩包内自带 Nginx 配置模板 `nginx/data-viz.conf`，复制到 Nginx 配置目录：

```bash
sudo cp nginx/data-viz.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/data-viz.conf /etc/nginx/sites-enabled/
```

编辑配置，修改 `server_name`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # ← 改为实际域名或 IP

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3.3 HTTPS（可选）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 自动配置 SSL
sudo certbot --nginx -d your-domain.com
```

### 3.4 启用

```bash
sudo nginx -t          # 检查配置
sudo systemctl reload nginx
```

---

## 4. 切换至 MySQL

默认使用 SQLite（零配置开箱即用）。如需 MySQL：

**步骤 1** — 修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**步骤 2** — 修改 `src_generated/prisma/client.ts` 中的适配器（或移除 adapter 配置）：

```typescript
// 移除 better-sqlite3 adapter，使用默认连接
export const prisma = new PrismaClient();
```

**步骤 3** — 配置环境变量：

```bash
# .env.local
DATABASE_URL="mysql://root:password@localhost:3306/data_viz"
```

**步骤 4** — 执行迁移 & 重启：

```bash
npx prisma migrate deploy
./ctl.sh restart
```

---

## 5. 版本更新

```bash
# 1. 打包新版本
bash scripts/pack.sh v1.1.0

# 2. 上传
scp release/data-viz-platform-v1.1.0.tar.gz user@server:/opt/

# 3. SSH 到服务器
ssh user@server

# 4. 停止旧服务
cd /opt/data-viz-platform-v1.0.0 && ./ctl.sh stop

# 5. 迁移数据库文件（SQLite）
cp /opt/data-viz-platform-v1.0.0/dev.db /opt/data-viz-platform-v1.1.0/dev.db

# 6. 启动新版本
cd /opt/data-viz-platform-v1.1.0 && ./ctl.sh start

# 7. 验证
curl http://localhost:5000/api/records

# 8. 确认无误后删除旧版本
rm -rf /opt/data-viz-platform-v1.0.0
```

---

## 6. 数据备份

```bash
# SQLite — 直接复制数据库文件
cp dev.db "dev.db.bak.$(date +%Y%m%d%H%M%S)"

# MySQL
mysqldump -u root -p data_viz > "data_viz_$(date +%Y%m%d).sql"
```

---

## 7. 故障排查

| 现象 | 排查 | 解决 |
|------|------|------|
| 启动报 `Cannot find module` | node_modules 不完整 | 重新打包 |
| 端口被占用 | `lsof -i:5000` | `./ctl.sh restart` 或 kill 占用进程 |
| 页面 502 | 服务未启动 | `./ctl.sh status` → `./ctl.sh start` |
| 数据库错误 | dev.db 损坏或缺失 | 删除 dev.db，重启自动迁移 |
| PM2 未守护 | 未注册 startup | `./ctl.sh startup` |

查看详细日志：

```bash
./ctl.sh log            # PM2 实时日志
cat logs/error.log      # 错误日志
cat logs/out.log        # 输出日志
```

---

## 8. 架构总览

```
客户端浏览器
     │
     ▼
  Nginx (:80/:443) ─── 反向代理 + SSL 终止 + 静态缓存
     │
     ▼
  Node.js (:5000) ─── Next.js SSR + API Routes
     │                ├── /api/records  (CRUD)
     │                ├── /api/stats    (统计)
     │                ├── /data         (数据录入页)
     │                └── /dashboard    (可视化大屏)
     │
     ▼
  Prisma ORM ─── 类型安全的数据操作
     │
     ▼
  SQLite / MySQL ─── 数据持久化
```

**技术栈**: Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4 + Prisma 7 + Recharts + shadcn/ui
