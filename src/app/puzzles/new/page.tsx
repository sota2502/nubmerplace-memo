import PuzzleEditor from "@/components/PuzzleEditor";
import { requireUserId } from "@/lib/session";

export default async function NewPuzzlePage() {
  await requireUserId();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">問題登録</h1>
      <PuzzleEditor />
    </div>
  );
}
