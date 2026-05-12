# 项目上下文

## 项目概览

数据可视化平台 - 基于 Next.js 16 + Prisma ORM + Recharts 的全栈数据录入与可视化大屏展示系统。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **ORM**: Prisma 7 (SQLite via better-sqlite3 adapter)
- **Charts**: Recharts 2.15
- **Database**: SQLite (可切换至 MySQL/PostgreSQL)

## 目录结构

```
├── prisma/
│   ├── schema.prisma       # Prisma 数据模型定义
│   ├── seed.ts             # 种子数据脚本
│   └── migrations/         # 数据库迁移文件
├── public/                 # 静态资源
├── DEPLOYMENT.md          # 简化部署文档（三步部署）
├── ecosystem.config.cjs   # PM2 进程管理配置
├── scripts/
│   ├── build.sh           # 构建脚本
│   ├── start.sh           # 启动脚本
│   ├── pack.sh            # 一键打包脚本（生成可部署压缩包）
│   ├── deploy.sh          # 一键部署脚本
│   ├── backup.sh          # 数据库备份脚本
│   ├── dev.sh             # 开发启动脚本
│   ├── prepare.sh         # 依赖安装脚本
│   └── validate.sh        # 验证脚本
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── records/
│   │   │   │   ├── route.ts        # GET(列表) + POST(创建)
│   │   │   │   └── [id]/route.ts   # GET(详情) + PUT(更新) + DELETE(删除)
│   │   │   └── stats/route.ts      # 统计聚合接口
│   │   ├── data/page.tsx           # 数据录入管理页面
│   │   ├── dashboard/page.tsx      # 可视化大屏页面
│   │   ├── layout.tsx              # 根布局（深色主题）
│   │   └── page.tsx                # 首页（导航入口）
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── generated/prisma/   # Prisma 自动生成的客户端代码
│   ├── hooks/              # 自定义 Hooks
│   └── lib/
│       ├── prisma.ts       # Prisma 客户端单例
│       └── utils.ts        # 通用工具函数
├── package.json
└── tsconfig.json
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器。

## 数据库

- 开发环境使用 SQLite，通过 `@prisma/adapter-better-sqlite3` 连接
- 生产环境可切换为 MySQL/PostgreSQL，只需修改 `prisma/schema.prisma` 中的 provider 和连接适配器
- 种子数据：`npx tsx prisma/seed.ts`（12条预设数据记录）

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/records` | GET | 获取所有记录（按创建时间倒序） |
| `/api/records` | POST | 创建新记录（需 title, value） |
| `/api/records/[id]` | GET | 获取单条记录 |
| `/api/records/[id]` | PUT | 更新记录 |
| `/api/records/[id]` | DELETE | 删除记录 |
| `/api/stats` | GET | 获取聚合统计（分类汇总、总计等） |

## 开发规范

- 严格 TypeScript，禁止隐式 any
- 使用 Next.js Link 组件进行内部导航
- 深色主题：根 html 标签设置 `className="dark"`
- Prisma 客户端使用单例模式，避免热更新时重复创建连接

## 部署打包

- 打包命令：`bash scripts/pack.sh [版本号]`
- 产出物：`release/data-viz-platform-{版本号}.tar.gz`
- 包含构建产物 + 扁平化 node_modules（npm 安装，解决 pnpm 符号链接问题）+ 启动脚本
- 服务器部署三步：上传 → 解压 → `./ctl.sh start`
- 详见 `DEPLOYMENT.md`
