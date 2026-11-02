import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { findConflicts, parseGrid } from "@/lib/sudoku";

export type RouteContext = { params: Promise<{ id: string }> };

export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export const jsonError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export function validateGivens(givens: string): string | null {
  const grid = parseGrid(givens);
  if (grid.every((v) => v === 0)) return "数字が1つも入力されていません";
  if (findConflicts(grid).size > 0) return "同じ行・列・ブロックに重複する数字があります";
  return null;
}
