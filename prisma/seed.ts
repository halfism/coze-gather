import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import * as path from "path";

const dbPath = path.resolve(__dirname, "../dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

const seedData = [
  { title: "产品销售额", value: 12580, description: "本月累计产品销售额（万元）", category: "销售", color: "#6366f1" },
  { title: "用户增长", value: 3842, description: "新增注册用户数", category: "用户", color: "#8b5cf6" },
  { title: "订单量", value: 6720, description: "本月累计订单数量", category: "销售", color: "#a855f7" },
  { title: "活跃用户", value: 2156, description: "日活跃用户数", category: "用户", color: "#06b6d4" },
  { title: "转化率", value: 23.5, description: "访问到购买的转化比率（%）", category: "运营", color: "#10b981" },
  { title: "客单价", value: 1872, description: "平均每笔订单金额（元）", category: "销售", color: "#f59e0b" },
  { title: "退货率", value: 3.2, description: "本月退货比率（%）", category: "运营", color: "#ef4444" },
  { title: "好评率", value: 96.8, description: "客户好评比率（%）", category: "运营", color: "#22c55e" },
  { title: "页面访问量", value: 89430, description: "本月累计PV", category: "流量", color: "#3b82f6" },
  { title: "独立访客", value: 42150, description: "本月累计UV", category: "流量", color: "#0ea5e9" },
  { title: "广告收入", value: 5670, description: "本月广告投放收入（万元）", category: "收入", color: "#ec4899" },
  { title: "会员收入", value: 8920, description: "本月会员订阅收入（万元）", category: "收入", color: "#f97316" },
];

async function main() {
  console.log("🌱 开始播种数据...");

  await prisma.dataRecord.deleteMany();

  for (const item of seedData) {
    const record = await prisma.dataRecord.create({ data: item });
    console.log(`✅ 创建记录: ${record.title}`);
  }

  console.log(`\n🎉 播种完成！共创建 ${seedData.length} 条记录`);
}

main()
  .catch((e: unknown) => {
    console.error("❌ 播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
