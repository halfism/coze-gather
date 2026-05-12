import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await prisma.dataRecord.findUnique({ where: { id } });

    if (!record) {
      return NextResponse.json(
        { success: false, error: "记录不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "查询失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, value, description, category, color } = body;

    const record = await prisma.dataRecord.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(value !== undefined && { value: Number(value) }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(color !== undefined && { color }),
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "更新失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.dataRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "删除失败";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
