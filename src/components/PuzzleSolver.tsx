"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SudokuGrid from "./SudokuGrid";
import NumberPad from "./NumberPad";
import { useGridKeyboard } from "./useGridKeyboard";
import { formatElapsed, useTimer } from "./useTimer";
import { CELLS, findConflicts, isSolved, serializeGrid, toggleMemo, type Grid } from "@/lib/sudoku";

type Mode = "answer" | "memo";
type Board = { values: Grid; memos: number[] };
type SaveState = "saved" | "saving" | "error";

type Props = {
  puzzleId: string;
  givens: Grid;
  initialValues: Grid;
  initialMemos: number[];
  initialElapsedSeconds: number;
};

export default function PuzzleSolver({
  puzzleId,
  givens,
  initialValues,
  initialMemos,
  initialElapsedSeconds,
}: Props) {
  const [board, setBoard] = useState<Board>({ values: initialValues, memos: initialMemos });
  const [history, setHistory] = useState<Board[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("answer");
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const merged = useMemo(() => givens.map((g, i) => g || board.values[i]), [givens, board.values]);
  const conflicts = useMemo(() => findConflicts(merged), [merged]);
  const solved = useMemo(() => isSolved(merged), [merged]);
  const { elapsed, setElapsed, visible } = useTimer(initialElapsedSeconds, !solved);

  const update = useCallback(
    (next: Board) => {
      setHistory((h) => [...h, board]);
      setBoard(next);
    },
    [board],
  );

  const onNumber = useCallback(
    (n: number) => {
      if (selected === null || givens[selected]) return;
      const values = [...board.values];
      const memos = [...board.memos];
      if (mode === "answer") {
        // 同じ数字なら取り消し、違えば上書き。回答したマスのメモはクリア
        values[selected] = values[selected] === n ? 0 : n;
        memos[selected] = 0;
      } else {
        if (values[selected]) return;
        memos[selected] = toggleMemo(memos[selected], n);
      }
      update({ values, memos });
    },
    [selected, givens, board, mode, update],
  );

  const onClear = useCallback(() => {
    if (selected === null || givens[selected]) return;
    if (!board.values[selected] && !board.memos[selected]) return;
    const values = [...board.values];
    const memos = [...board.memos];
    if (values[selected]) values[selected] = 0;
    else memos[selected] = 0;
    update({ values, memos });
  }, [selected, givens, board, update]);

  const onUndo = useCallback(() => {
    if (history.length === 0) return;
    setBoard(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }, [history]);

  const onToggleMode = useCallback(() => setMode((m) => (m === "answer" ? "memo" : "answer")), []);

  const onReset = () => {
    if (!confirm("回答とメモをすべて消去しますか？")) return;
    update({ values: Array(CELLS).fill(0), memos: Array(CELLS).fill(0) });
    setElapsed(0);
  };

  useGridKeyboard({ selected, setSelected, onNumber, onClear, onToggleMode, onUndo });

  // 保存時は最新の盤面と経過時間を使う（タイマーの毎秒の更新では保存しない）
  const latest = useRef({ board, elapsed });
  useEffect(() => {
    latest.current = { board, elapsed };
  });

  const save = useCallback(
    async (keepalive = false) => {
      const { board, elapsed } = latest.current;
      setSaveState("saving");
      try {
        const res = await fetch(`/api/puzzles/${puzzleId}/progress`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            values: serializeGrid(board.values),
            memos: board.memos,
            elapsedSeconds: elapsed,
          }),
          keepalive,
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    },
    [puzzleId],
  );

  // 変更から少し待ってサーバーへ自動保存
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    setSaveState("saving");
    const timer = setTimeout(save, 800);
    return () => clearTimeout(timer);
  }, [board, save]);

  // タブを離れたとき・ページを閉じるときに経過時間を保存
  const wasVisible = useRef(visible);
  useEffect(() => {
    if (wasVisible.current && !visible) save(true);
    wasVisible.current = visible;
  }, [visible, save]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-[min(90vw,32rem)] items-center justify-between text-sm">
        <div className="inline-flex overflow-hidden rounded border border-gray-400">
          {(["answer", "memo"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 ${mode === m ? "bg-foreground text-background" : ""}`}
            >
              {m === "answer" ? "回答" : "メモ"}
            </button>
          ))}
        </div>
        <span className={`font-mono text-lg tabular-nums ${solved ? "text-green-600" : ""}`} aria-label="経過時間">
          {formatElapsed(elapsed)}
        </span>
        <span className="text-gray-500">
          {saveState === "saving" ? "保存中…" : saveState === "error" ? "保存に失敗しました" : "保存済み"}
        </span>
      </div>

      <SudokuGrid
        givens={givens}
        values={board.values}
        memos={board.memos}
        selected={selected}
        conflicts={conflicts}
        onSelect={setSelected}
      />

      {solved && (
        <p className="text-lg font-bold text-green-600">完成しました！（{formatElapsed(elapsed)}）</p>
      )}

      <NumberPad onNumber={onNumber} onClear={onClear} />

      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={onUndo}
          disabled={history.length === 0}
          className="rounded border border-gray-400 px-4 py-2 disabled:opacity-40"
        >
          元に戻す
        </button>
        <button type="button" onClick={onReset} className="rounded border border-gray-400 px-4 py-2">
          リセット
        </button>
      </div>

      <p className="text-xs text-gray-500">
        キーボード: 1〜9で入力 / Backspaceで消去 / 矢印で移動 / Spaceで回答・メモ切替 / Ctrl(⌘)+Zで元に戻す
      </p>
    </div>
  );
}
