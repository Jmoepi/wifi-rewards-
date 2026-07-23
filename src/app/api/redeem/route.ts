/**
 * POST /api/redeem — Simulates an external WiFi provider's redemption API.
 *
 * This is the second provided API endpoint (used as-is per the assessment).
 * It intentionally:
 * - Waits ~1.5 seconds to simulate network latency
 * - Succeeds ~80% of the time, fails ~20% randomly
 *
 * This endpoint does NOT touch the database — it only simulates the WiFi
 * provider's response. The actual balance deduction and transaction recording
 * happen in /api/transactions, which the client calls only if this endpoint
 * returns success. This two-step flow ensures we only record transactions
 * for bundles the WiFi provider actually delivered.
 */

import { NextRequest, NextResponse } from "next/server";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  const { bundleId } = await request.json();

  // Simulate network delay from the external WiFi provider.
  await delay(1500);

  // ~80% success rate — the frontend must handle both outcomes gracefully.
  const success = Math.random() < 0.8;

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "The WiFi provider was unable to process your request. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    bundleId,
    message: "Bundle redeemed successfully.",
  });
}
