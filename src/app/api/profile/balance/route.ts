/**
 * PATCH /api/profile/balance — Sets the user's SB balance to a specific value.
 *
 * This is the Admin/Test Controls endpoint. Since users start with 0 SB and
 * there is no "earn rewards" flow in this assessment, this endpoint allows
 * testers to manually set a balance so they can test the redemption flow.
 *
 * It only affects the currently authenticated user's own balance.
 * The balance is set absolutely (not incremented/decremented).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const balanceSchema = z.object({
  balance: z
    .number()
    .int("Balance must be a whole number")
    .min(0, "Balance cannot be negative")
    .max(1000000, "Balance exceeds maximum allowed"),
});

export async function PATCH(request: NextRequest) {
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validated = balanceSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Only updates the authenticated user's own balance — no admin role needed.
  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { sbBalance: validated.data.balance },
    select: { id: true, sbBalance: true },
  });

  return NextResponse.json(user);
}
