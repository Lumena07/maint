import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { MaintenanceRecord, MaintenanceType, MaintenanceStatus, Aircraft } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [], maintenance: [] };
  }
};

const writeCache = (data: any): void => {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
    throw new Error('Failed to save data');
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get("aircraftId");
    const maintenanceType = searchParams.get("maintenanceType");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const cache = readCache();
    let maintenance: MaintenanceRecord[] = cache.maintenance || [];

    // Filter maintenance records
    if (aircraftId) {
      maintenance = maintenance.filter((m: MaintenanceRecord) => m.aircraftId === aircraftId);
    }
    if (maintenanceType) {
      maintenance = maintenance.filter((m: MaintenanceRecord) => m.maintenanceType === maintenanceType);
    }
    if (status) {
      maintenance = maintenance.filter((m: MaintenanceRecord) => m.status === status);
    }
    if (startDate) {
      maintenance = maintenance.filter((m: MaintenanceRecord) => new Date(m.startDate) >= new Date(startDate));
    }
    if (endDate) {
      maintenance = maintenance.filter((m: MaintenanceRecord) => new Date(m.startDate) <= new Date(endDate));
    }

    // Sort by start date (newest first)
    maintenance.sort((a: MaintenanceRecord, b: MaintenanceRecord) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return NextResponse.json(maintenance);
  } catch (error) {
    console.error("Error retrieving maintenance records:", error);
    return NextResponse.json({ error: "Failed to retrieve maintenance records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      aircraftId,
      maintenanceType,
      status,
      startDate,
      endDate,
      plannedDuration,
      actualDuration,
      downtimeHours,
      description,
      workPerformed,
      partsUsed,
      laborHours,
      cost,
      performedBy,
      supervisor,
      inspectionResults,
      nextDueDate,
      notes,
      relatedSnagId,
      relatedPirepId
    } = body;

    // Validate required fields
    if (!aircraftId || !maintenanceType || !startDate || !description || !workPerformed || !performedBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cache = readCache();

    // Verify aircraft exists
    const aircraft = cache.aircraft?.find((a: Aircraft) => a.id === aircraftId);
    if (!aircraft) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    // Calculate actual duration if endDate provided
    let calculatedActualDuration = actualDuration;
    if (endDate && !actualDuration) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      calculatedActualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)); // hours
    }

    // Calculate downtime hours if not provided
    let calculatedDowntimeHours = downtimeHours;
    if (!calculatedDowntimeHours && calculatedActualDuration) {
      calculatedDowntimeHours = calculatedActualDuration;
    }

    const newMaintenance: MaintenanceRecord = {
      id: generateId(),
      aircraftId,
      maintenanceType,
      status: status || "PLANNED",
      startDate,
      endDate,
      plannedDuration: plannedDuration || 0,
      actualDuration: calculatedActualDuration,
      downtimeHours: calculatedDowntimeHours || 0,
      description,
      workPerformed,
      partsUsed: partsUsed || [],
      laborHours: laborHours || 0,
      cost,
      performedBy,
      supervisor,
      inspectionResults,
      nextDueDate,
      notes,
      relatedSnagId,
      relatedPirepId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!cache.maintenance) {
      cache.maintenance = [];
    }

    cache.maintenance.push(newMaintenance);
    writeCache(cache);

    return NextResponse.json(newMaintenance, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

