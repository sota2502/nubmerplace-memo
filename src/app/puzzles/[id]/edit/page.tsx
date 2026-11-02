import { notFound } from "next/navigation";
import PuzzleEditor from "@/components/PuzzleEditor";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { parseGrid } from "@/lib/sudoku";

export default async function EditPuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();

  const puzzle = await prisma.puzzle.findUnique({ where: { id } });
  if (!puzzle || puzzle.authorId !== userId) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">問題編集</h1>
      <PuzzleEditor puzzleId={id} initialTitle={puzzle.title ?? ""} initialGivens={parseGrid(puzzle.givens)} />
    </div>
  );
}
