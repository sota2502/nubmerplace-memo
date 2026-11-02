import { describe, expect, it } from "vitest";
import { emptyGrid, findConflicts, hasMemo, isSolved, parseGrid, serializeGrid, toggleMemo } from "./sudoku";

const SOLVED =
  "534678912672195348198342567859761423426853791713924856961537284287419635345286179";

describe("sudoku", () => {
  it("parses and serializes", () => {
    expect(serializeGrid(parseGrid(SOLVED))).toBe(SOLVED);
  });

  it("detects row, column and box conflicts", () => {
    const g = emptyGrid();
    g[0] = 5;
    g[8] = 5; // 同じ行
    expect([...findConflicts(g)].sort()).toEqual([0, 8]);

    const c = emptyGrid();
    c[0] = 3;
    c[72] = 3; // 同じ列
    expect(findConflicts(c).size).toBe(2);

    const b = emptyGrid();
    b[0] = 7;
    b[20] = 7; // 同じブロック
    expect(findConflicts(b).size).toBe(2);
  });

  it("checks solved grids", () => {
    expect(isSolved(parseGrid(SOLVED))).toBe(true);
    const g = parseGrid(SOLVED);
    g[0] = 0;
    expect(isSolved(g)).toBe(false);
  });

  it("toggles memo bits", () => {
    let m = 0;
    m = toggleMemo(m, 1);
    m = toggleMemo(m, 9);
    expect(hasMemo(m, 1)).toBe(true);
    expect(hasMemo(m, 9)).toBe(true);
    expect(hasMemo(m, 5)).toBe(false);
    expect(toggleMemo(m, 1)).toBe(1 << 8);
  });
});
