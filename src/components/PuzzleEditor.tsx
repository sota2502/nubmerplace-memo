"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SudokuGrid from "./SudokuGrid";
import NumberPad from "./NumberPad";
import { useGridKeyboard } from "./useGridKeyboard";
import { CELLS, findConflicts, serializeGrid, type Grid } from "@/lib/sudoku";

type Props = {
  puzzleId?: string;
  initialTitle?: string;
  initialGivens?: Grid;
};

export default function PuzzleEditor({ puzzleId, initialTitle = "", initialGivens }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [givens, setGivens] = useState<Grid>(initialGivens ?? Array(CELLS).fill(0));
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const conflicts = useMemo(() => findConflicts(givens), [givens]);

  const setCell = useCallback(
    (n: number) => {
      if (selected === null) return;
      setGivens((g) => g.map((v, i) => (i === selected ? n : v)));
    },
    [selected],
  );
  const onClear = useCallback(() => setCell(0), [setCell]);

  useGridKeyboard({ selected, setSelected, onNumber: setCell, onClear });

  async function onSubmit() {
    setError(null);
    if (givens.every((v) => v === 0)) return setError("数字を入力してください");
    if (conflicts.size > 0) return setError("重複している数字があります");

    setBusy(true);
    const res = await fetch(puzzleId ? `/api/puzzles/${puzzleId}` : "/api/puzzles", {
      method: puzzleId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, givens: serializeGrid(givens) }),
    });
    setBusy(false);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return setError(body?.error ?? "保存に失敗しました");
    }
    const puzzle = await res.json();
    router.push(`/puzzles/${puzzle.id}`);
    router.refresh();
  }

  async function onDelete() {
    if (!puzzleId || !confirm("この問題を削除しますか？")) return;
    setBusy(true);
    const res = await fetch(`/api/puzzles/${puzzleId}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) return setError("削除に失敗しました");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル（任意）"
        maxLength={100}
        className="w-full max-w-[min(90vw,32rem)] rounded border border-gray-400 bg-background px-3 py-2"
      />
      <SudokuGrid givens={givens} selected={selected} conflicts={conflicts} onSelect={setSelected} />
      <NumberPad onNumber={setCell} onClear={onClear} />
      {error && <p className="text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="rounded bg-foreground px-6 py-2 text-background disabled:opacity-50"
        >
          {puzzleId ? "更新" : "登録"}
        </button>
        {puzzleId && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            className="rounded border border-red-600 px-6 py-2 text-red-600 disabled:opacity-50"
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
