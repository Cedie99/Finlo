import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { whatIfScenarioSchema } from "@/lib/validations/whatIf";
import { runWhatIfScenario } from "@/lib/utils/whatIfPlanner";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = whatIfScenarioSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await runWhatIfScenario(session.user.id, parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
