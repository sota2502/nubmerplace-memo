"use client";

import { boxOf, colOf, hasMemo, rowOf, type Grid } from "@/lib/sudoku";

type Props = {
  givens: Grid;
  values?: Grid;
  memos?: number[];
  selected: number | null;
  conflicts: Set<number>;
  onSelect: (index: number) => void;
};

export default function SudokuGrid({ givens, values, memos, selected, conflicts, onSelect }: Props) {
  const valueAt = (i: number) => givens[i] || values?.[i] || 0;
  const selectedValue = selected !== null ? valueAt(selected) : 0;

  return (
    <div className="grid aspect-square w-full max-w-[min(90vw,32rem)] grid-cols-9 grid-rows-9 border-2 border-foreground select-none">
      {givens.map((_, i) => {
        const value = valueAt(i);
        const isGiven = givens[i] !== 0;
        const isSelected = i === selected;
        const isRelated =
          selected !== null &&
          (rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected));
        const isSameValue = selectedValue !== 0 && value === selectedValue;

        const bg = isSelected
          ? "bg-sky-300 dark:bg-sky-700"
          : isSameValue
            ? "bg-sky-200 dark:bg-sky-900"
            : isRelated
              ? "bg-sky-50 dark:bg-slate-800"
              : "bg-background";
        const border = [
          colOf(i) % 3 === 2 && colOf(i) !== 8 ? "border-r-2 border-r-foreground" : "border-r border-r-gray-400",
          rowOf(i) % 3 === 2 && rowOf(i) !== 8 ? "border-b-2 border-b-foreground" : "border-b border-b-gray-400",
        ].join(" ");
        const color = conflicts.has(i)
          ? "text-red-600"
          : isGiven
            ? "font-bold"
            : "text-blue-700 dark:text-blue-300";

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden ${bg} ${border} ${color} text-[min(5vw,1.75rem)] leading-none`}
            aria-label={`${rowOf(i) + 1}行${colOf(i) + 1}列`}
          >
            {value !== 0 ? (
              value
            ) : memos && memos[i] ? (
              <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-px text-[min(2.2vw,0.7rem)] text-gray-500">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span
                    key={n}
                    className={`flex items-center justify-center ${
                      selectedValue === n && hasMemo(memos[i], n) ? "font-bold text-sky-700 dark:text-sky-300" : ""
                    }`}
                  >
                    {hasMemo(memos[i], n) ? n : ""}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
