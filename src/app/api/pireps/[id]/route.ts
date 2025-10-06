import { NextRequest, NextResponse } from "next/server";
import { PIREP, PIREPStatus } from "@/lib/types";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "public", "aaf-cache.json");

const readCache = () => {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return { pireps: [] };
  }
};

const writeCache = (data: any) => {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
};

// GET /api/pireps/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cache = readCache();
    const pireps = cache.pireps || [];
    const pirep = pireps.find((p: PIREP) => p.id === id);
    
    if (!pirep) {
      return NextResponse.json({ error: "PIREP not found" }, { status: 404 });
    }
    
    return NextResponse.json(pirep);
  } catch (error) {
    console.error("Error retrieving PIREP:", error);
    return NextResponse.json({ error: "Failed to retrieve PIREP" }, { status: 500 });
  }
}

// PUT /api/pireps/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const cache = readCache();
    const pireps = cache.pireps || [];
    const pirepIndex = pireps.findIndex((p: PIREP) => p.id === id);
    
    if (pirepIndex === -1) {
      return NextResponse.json({ error: 'PIREP not found' }, { status: 404 });
    }

    // Update the PIREP with provided fields
    const updatedPirep: PIREP = {
      ...pireps[pirepIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    // Handle status transitions
    if (body.status) {
      const currentStatus = pireps[pirepIndex].status;
      const newStatus = body.status as PIREPStatus;

      // Set review/resolution dates based on status changes
      if (newStatus === "REVIEWED" && currentStatus === "SUBMITTED") {
        updatedPirep.reviewedBy = body.reviewedBy || updatedPirep.reviewedBy;
        updatedPirep.reviewedDate = new Date().toISOString();
      }

      if (newStatus === "RESOLVED" && currentStatus !== "RESOLVED") {
        updatedPirep.resolvedDate = new Date().toISOString();
        updatedPirep.resolvedBy = body.resolvedBy || updatedPirep.resolvedBy;
      }

      if (newStatus === "INVESTIGATING") {
        updatedPirep.investigationNotes = body.investigationNotes || updatedPirep.investigationNotes;
      }
    }

    pireps[pirepIndex] = updatedPirep;
    cache.pireps = pireps;
    writeCache(cache);
    
    return NextResponse.json(updatedPirep);
  } catch (error) {
    console.error('Error updating PIREP:', error);
    return NextResponse.json({ error: 'Failed to update PIREP' }, { status: 500 });
  }
}

// DELETE /api/pireps/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const cache = readCache();
    const pireps = cache.pireps || [];
    const pirepIndex = pireps.findIndex((p: PIREP) => p.id === id);
    
    if (pirepIndex === -1) {
      return NextResponse.json({ error: 'PIREP not found' }, { status: 404 });
    }

    // Remove the PIREP
    pireps.splice(pirepIndex, 1);
    cache.pireps = pireps;
    writeCache(cache);
    
    return NextResponse.json({ message: 'PIREP deleted successfully' });
  } catch (error) {
    console.error('Error deleting PIREP:', error);
    return NextResponse.json({ error: 'Failed to delete PIREP' }, { status: 500 });
  }
}
