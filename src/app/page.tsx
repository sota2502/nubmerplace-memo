import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await auth();
  if (!session?.user) {
    return <p className="py-12 text-center">右上の「Googleでログイン」からログインしてください。</p>;
  }

  const puzzles = await prisma.puzzle.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, createdAt: true, authorId: true, author: { select: { name: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">問題一覧</h1>
        <Link href="/puzzles/new" className="rounded bg-foreground px-4 py-2 text-sm text-background">
          新規登録
        </Link>
      </div>
      {puzzles.length === 0 ? (
        <p className="text-gray-500">まだ問題がありません。</p>
      ) : (
        <ul className="divide-y divide-gray-300 dark:divide-gray-700">
          {puzzles.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-3">
              <Link href={`/puzzles/${p.id}`} className="hover:underline">
                <div>{p.title || "無題の問題"}</div>
                <div className="text-xs text-gray-500">
                  {p.author.name ?? "不明"} / {p.createdAt.toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </div>
              </Link>
              {p.authorId === session.user.id && (
                <Link href={`/puzzles/${p.id}/edit`} className="text-sm underline">
                  編集
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
