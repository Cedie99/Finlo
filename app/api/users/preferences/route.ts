import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateUserPreferencesSchema } from "@/lib/validations/preferences";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.userPreference.upsert({
    where: { userId: session.user.id },
    update: {},
    create: {
      userId: session.user.id,
      bufferPercentage: "10",
      paydayDaysOfMonth: [15],
      enableDailyDigest: true,
    },
  });

  return NextResponse.json({
    ...preferences,
    minimumCashBuffer: preferences.minimumCashBuffer?.toString() ?? null,
    bufferPercentage: preferences.bufferPercentage.toString(),
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateUserPreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const updated = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: {
        ...(data.minimumCashBuffer !== undefined
          ? { minimumCashBuffer: data.minimumCashBuffer === null ? null : data.minimumCashBuffer.toString() }
          : {}),
        ...(data.bufferPercentage !== undefined
          ? { bufferPercentage: data.bufferPercentage.toString() }
          : {}),
        ...(data.paydayDaysOfMonth !== undefined
          ? { paydayDaysOfMonth: data.paydayDaysOfMonth }
          : {}),
        ...(data.enableDailyDigest !== undefined
          ? { enableDailyDigest: data.enableDailyDigest }
          : {}),
      },
      create: {
        userId: session.user.id,
        minimumCashBuffer:
          data.minimumCashBuffer === undefined || data.minimumCashBuffer === null
            ? null
            : data.minimumCashBuffer.toString(),
        bufferPercentage: (data.bufferPercentage ?? 10).toString(),
        paydayDaysOfMonth: data.paydayDaysOfMonth ?? [15],
        enableDailyDigest: data.enableDailyDigest ?? true,
      },
    });

    return NextResponse.json({
      ...updated,
      minimumCashBuffer: updated.minimumCashBuffer?.toString() ?? null,
      bufferPercentage: updated.bufferPercentage.toString(),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
