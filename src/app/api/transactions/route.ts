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

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: session.userId },
      select: { sbBalance: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.sbBalance < cost) {
      throw new Error("Insufficient balance");
    }

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
