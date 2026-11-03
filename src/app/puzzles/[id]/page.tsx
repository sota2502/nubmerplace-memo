import Link from "next/link";
import { notFound } from "next/navigation";
import PuzzleSolver from "@/components/PuzzleSolver";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { CELLS, parseGrid } from "@/lib/sudoku";

export default async function SolvePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();

  const puzzle = await prisma.puzzle.findUnique({ where: { id } });
  if (!puzzle) notFound();
  const progress = await prisma.progress.findUnique({
    where: { userId_puzzleId: { userId, puzzleId: id } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{puzzle.title || "無題の問題"}</h1>
        {puzzle.authorId === userId && (
          <Link href={`/puzzles/${id}/edit`} className="text-sm underline">
            問題を編集
          </Link>
        )}
      </div>
      <PuzzleSolver
        puzzleId={id}
        givens={parseGrid(puzzle.givens)}
        initialValues={progress ? parseGrid(progress.values) : Array(CELLS).fill(0)}
        initialMemos={progress?.memos.length === CELLS ? progress.memos : Array(CELLS).fill(0)}
        initialElapsedSeconds={progress?.elapsedSeconds ?? 0}
      />
    </div>
  );
}
