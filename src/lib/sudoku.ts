export const CELLS = 81;

export type Grid = number[];

export const emptyGrid = (): Grid => Array(CELLS).fill(0);

export function parseGrid(s: string): Grid {
  return Array.from(s, (c) => Number(c));
}

export function serializeGrid(grid: Grid): string {
  return grid.join("");
}

export const rowOf = (i: number) => Math.floor(i / 9);
export const colOf = (i: number) => i % 9;
export const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

export function isPeer(a: number, b: number): boolean {
  return a !== b && (rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b));
}

/** 同じ行・列・ブロックに同じ数字があるマスの集合 */
export function findConflicts(grid: Grid): Set<number> {
  const conflicts = new Set<number>();
  for (let a = 0; a < CELLS; a++) {
    if (!grid[a]) continue;
    for (let b = a + 1; b < CELLS; b++) {
      if (grid[a] === grid[b] && isPeer(a, b)) {
        conflicts.add(a);
        conflicts.add(b);
      }
    }
  }
  return conflicts;
}

export function isSolved(grid: Grid): boolean {
  return grid.every((v) => v >= 1 && v <= 9) && findConflicts(grid).size === 0;
}

// メモ（候補）は 1..9 を bit0..8 に割り当てたビットマスク
export const hasMemo = (mask: number, n: number) => (mask & (1 << (n - 1))) !== 0;
export const toggleMemo = (mask: number, n: number) => mask ^ (1 << (n - 1));
