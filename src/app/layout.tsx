import type { Metadata } from "next";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "ナンプレメモ",
  description: "ナンバープレースを解く補助をするWebアプリ",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  return (
    <html lang="ja">
      <body className="antialiased">
        <header className="border-b border-gray-300 dark:border-gray-700">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold">
              ナンプレメモ
            </Link>
            {session?.user ? (
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
                className="flex items-center gap-3 text-sm"
              >
                <span className="text-gray-500">{session.user.name}</span>
                <button type="submit" className="underline">
                  ログアウト
                </button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button type="submit" className="text-sm underline">
                  Googleでログイン
                </button>
              </form>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
