/**
 * GET /api/bundles — Returns the list of available WiFi bundles.
 *
 * This is one of the two provided API endpoints (used as-is per the assessment).
 * The bundle list is static and does not require authentication, since any user
 * (even unauthenticated) could theoretically view available products.
 *
 * The frontend fetches this endpoint on the Dashboard to display the bundle cards
 * rather than hardcoding the list in the UI.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, name: "100MB Bundle", cost: 25 },
    { id: 2, name: "500MB Bundle", cost: 50 },
    { id: 3, name: "1GB Bundle", cost: 100 },
  ]);
}
