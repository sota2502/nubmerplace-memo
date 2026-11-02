import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, jsonError, validateGivens, type RouteContext } from "@/lib/api";
import { puzzleInput } from "@/lib/validation";

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const puzzle = await prisma.puzzle.findUnique({ where: { id } });
  if (!puzzle) return jsonError("問題が見つかりません", 404);
  return NextResponse.json(puzzle);
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return jsonError("ログインが必要です", 401);

  const existing = await prisma.puzzle.findUnique({ where: { id } });
  if (!existing) return jsonError("問題が見つかりません", 404);
  if (existing.authorId !== userId) return jsonError("権限がありません", 403);

  const parsed = puzzleInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("入力が不正です", 400);
  const invalid = validateGivens(parsed.data.givens);
  if (invalid) return jsonError(invalid, 400);

  const puzzle = await prisma.puzzle.update({
    where: { id },
    data: { title: parsed.data.title || null, givens: parsed.data.givens },
  });
  return NextResponse.json(puzzle);
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return jsonError("ログインが必要です", 401);

  const existing = await prisma.puzzle.findUnique({ where: { id } });
  if (!existing) return jsonError("問題が見つかりません", 404);
  if (existing.authorId !== userId) return jsonError("権限がありません", 403);

  await prisma.puzzle.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
