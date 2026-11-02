import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** ページ用: 未ログインならトップへ */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  return session.user.id;
}
