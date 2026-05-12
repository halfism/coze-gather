import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.dataRecord.findMany({
      select: { category: true },
      distinct: ["category"],
    });

    const stats = await prisma.dataRecord.aggregate({
      _count: true,
      _sum: { value: true },
      _avg: { value: true },
      _min: { value: true },
      _max: { value: true },
    });

    const categoryStats = await prisma.dataRecord.groupBy({
      by: ["category"],
      _count: true,
      _sum: { value: true },
      _avg: { value: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        categories: categories.map((c) => c.category),
        total: stats._count,
        sumValue: stats._sum.value ?? 0,
        avgValue: stats._avg.value ?? 0,
        minValue: stats._min.value ?? 0,
        maxValue: stats._max.value ?? 0,
        categoryStats: categoryStats.map((cs) => ({
          category: cs.category,
          count: cs._count,
          sum: cs._sum.value ?? 0,
          avg: cs._avg.value ?? 0,
        })),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "统计查询失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
