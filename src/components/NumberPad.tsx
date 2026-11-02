"use client";

type Props = {
  onNumber: (n: number) => void;
  onClear: () => void;
};

export default function NumberPad({ onNumber, onClear }: Props) {
  return (
    <div className="grid w-full max-w-[min(90vw,32rem)] grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onNumber(n)}
          className="rounded border border-gray-400 py-3 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="rounded border border-gray-400 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        消去
      </button>
    </div>
  );
}
