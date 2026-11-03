import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, jsonError, type RouteContext } from "@/lib/api";
import { progressInput } from "@/lib/validation";

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return jsonError("ログインが必要です", 401);

  const progress = await prisma.progress.findUnique({
    where: { userId_puzzleId: { userId, puzzleId: id } },
  });
  return NextResponse.json(progress);
}

export async function PUT(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return jsonError("ログインが必要です", 401);

  const parsed = progressInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("入力が不正です", 400);

  const puzzle = await prisma.puzzle.findUnique({ where: { id }, select: { givens: true } });
  if (!puzzle) return jsonError("問題が見つかりません", 404);

  const { values, memos, elapsedSeconds } = parsed.data;
  const progress = await prisma.progress.upsert({
    where: { userId_puzzleId: { userId, puzzleId: id } },
    create: { userId, puzzleId: id, values, memos, elapsedSeconds },
    update: { values, memos, elapsedSeconds },
  });
  return NextResponse.json(progress);
}
