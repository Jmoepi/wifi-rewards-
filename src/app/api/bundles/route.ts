import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, name: "100MB Bundle", cost: 25 },
    { id: 2, name: "500MB Bundle", cost: 50 },
    { id: 3, name: "1GB Bundle", cost: 100 },
  ]);
}
