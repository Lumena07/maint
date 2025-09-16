import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({ 
    ok: false, 
    error: "AAF import functionality has been disabled" 
  }, { status: 410 });
}


