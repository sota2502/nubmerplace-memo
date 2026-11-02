import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId, jsonError, validateGivens } from "@/lib/api";
import { puzzleInput } from "@/lib/validation";

export async function GET() {
  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, author: { select: { name: true } } },
  });
  return NextResponse.json(puzzles);
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return jsonError("ログインが必要です", 401);

  const parsed = puzzleInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("入力が不正です", 400);
  const invalid = validateGivens(parsed.data.givens);
  if (invalid) return jsonError(invalid, 400);

  const puzzle = await prisma.puzzle.create({
    data: { title: parsed.data.title || null, givens: parsed.data.givens, authorId: userId },
  });
  return NextResponse.json(puzzle, { status: 201 });
}
