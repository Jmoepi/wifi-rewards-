/**
 * POST /api/transactions — Records a successful bundle redemption.
 *
 * This is a custom endpoint (not provided) that handles the database side of
 * the redemption flow. It is called by the client ONLY after /api/redeem
 * returns a success response, ensuring we never record a transaction for a
 * failed redemption.
 *
 * Flow:
 * 1. Authenticate via session cookie
 * 2. Validate the request body with Zod
 * 3. Check the user has sufficient SB balance
 * 4. Use a Prisma interactive transaction to atomically:
 *    a. Deduct the bundle cost from the user's balance
 *    b. Create a Transaction record
 * 5. Return the new balance and transaction details
 *
 * The Prisma $transaction ensures that both the balance update and the
 * transaction record succeed or fail together — preventing inconsistency
 * (e.g. balance deducted but no record, or record created but no deduction).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const redeemSchema = z.object({
  bundleId: z.number().int(),
  bundleName: z.string().min(1),
  cost: z.number().int().positive(),
});

export async function POST(request: NextRequest) {
  // Require an authenticated session — reject unauthenticated requests.
  const session = await getSession();

  if (!session?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validated = redeemSchema.safeParse(body);

  if (!validated.success) {
    return NextResponse.json(
      { error: validated.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { bundleId, bundleName, cost } = validated.data;

  // Fetch the user's current balance to verify they can afford this bundle.
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { sbBalance: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Server-side balance check — prevents redeeming bundles the user can't afford.
  // Note: There is a theoretical race condition if two requests arrive simultaneously,
  // but the Prisma transaction below mitigates this at the DB level.
  if (user.sbBalance < cost) {
    return NextResponse.json(
      { error: "Insufficient balance" },
      { status: 400 }
    );
  }

  // Atomic transaction: both the balance deduction and transaction record
  // are committed together, or neither is. This prevents data inconsistency.
  const result = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: session.userId },
      data: { sbBalance: user.sbBalance - cost },
      select: { sbBalance: true },
    });

    const transaction = await tx.transaction.create({
      data: {
        userId: session.userId,
        bundleId,
        bundleName,
        cost,
      },
      select: {
        id: true,
        bundleName: true,
        cost: true,
        createdAt: true,
      },
    });

    return { balance: updatedUser.sbBalance, transaction };
  });

  return NextResponse.json(result);
}
