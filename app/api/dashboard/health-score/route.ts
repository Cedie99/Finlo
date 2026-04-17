import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getHealthScoreForUser } from "@/lib/utils/healthScore";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getHealthScoreForUser(session.user.id);
  return NextResponse.json(result);
}
