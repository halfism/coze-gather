import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.dataRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: records });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "查询失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, value, description, category, color } = body;

    if (!title || value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: "标题和数值为必填项" },
        { status: 400 }
      );
    }

    const record = await prisma.dataRecord.create({
      data: {
        title,
        value: Number(value),
        description: description || "",
        category: category || "默认",
        color: color || "#6366f1",
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "创建失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
