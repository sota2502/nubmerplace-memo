import { z } from "zod";

export const gridString = z.string().regex(/^[0-9]{81}$/, "81桁の0-9で指定してください");

export const puzzleInput = z.object({
  title: z.string().trim().max(100).optional(),
  givens: gridString,
});

export const progressInput = z.object({
  values: gridString,
  memos: z.array(z.number().int().min(0).max(511)).length(81),
});
