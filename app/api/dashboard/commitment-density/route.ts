import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommitmentDensityForUser } from "@/lib/utils/commitmentDensity";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await getCommitmentDensityForUser(session.user.id);
  return NextResponse.json(result);
}
