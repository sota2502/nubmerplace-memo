"use client";

import { useEffect } from "react";

type Handlers = {
  selected: number | null;
  setSelected: (i: number) => void;
  onNumber: (n: number) => void;
  onClear: () => void;
  onToggleMode?: () => void;
  onUndo?: () => void;
};

/** 数字キー・消去・矢印移動などのキーボード操作 */
export function useGridKeyboard({ selected, setSelected, onNumber, onClear, onToggleMode, onUndo }: Handlers) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (onUndo) {
          e.preventDefault();
          onUndo();
        }
        return;
      }
      if (e.key === " " && onToggleMode) {
        e.preventDefault();
        onToggleMode();
        return;
      }

      if (selected === null) return;
      if (/^[1-9]$/.test(e.key)) {
        onNumber(Number(e.key));
      } else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        onClear();
      } else if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        const row = Math.floor(selected / 9);
        const col = selected % 9;
        const [dr, dc] = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[
          e.key as "ArrowUp"
        ] ?? [0, 0];
        setSelected(((row + dr + 9) % 9) * 9 + ((col + dc + 9) % 9));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, setSelected, onNumber, onClear, onToggleMode, onUndo]);
}
