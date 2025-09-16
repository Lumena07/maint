import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ImportedData = {
  aircraft: any[];
  tasks: any[];
  checks: any[];
  components: any[];
};

const cachePath = path.join(process.cwd(), "public", "aaf-cache.json");

export async function POST() {
  try {
    const pdfParse = (await import("pdf-parse")).default as (data: Buffer) => Promise<{ text: string }>;
    const pdfPath = path.join(process.cwd(), "AAF PROJECTION.pdf");
    const buffer = fs.readFileSync(pdfPath);
    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    // Basic extraction stub: split by lines. You will refine the parsing rules
    // to match the exact columns/sections of the AAF report.
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // TODO: Replace with deterministic parsing per AAF format
    const imported: ImportedData = {
      aircraft: [{ id: "ac-AAF", registration: "5H-AAF", type: "C208B" }],
      tasks: [],
      checks: [],
      components: [],
    };

    fs.writeFileSync(cachePath, JSON.stringify(imported, null, 2), "utf8");
    return NextResponse.json({ ok: true, counts: {
      aircraft: imported.aircraft.length,
      tasks: imported.tasks.length,
      checks: imported.checks.length,
      components: imported.components.length,
    }});
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}


