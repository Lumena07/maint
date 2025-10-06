import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ComponentRecord, ComponentStatus, RemovalReason, Aircraft } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [], components: [] };
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
    const componentType = searchParams.get("componentType");
    const status = searchParams.get("status");
    const ataSystem = searchParams.get("ataSystem");

    const cache = readCache();
    let components: ComponentRecord[] = cache.components || [];
    
    // Map existing component data to ComponentRecord format
    components = components.map((comp: any) => ({
      id: comp.id,
      partNumber: comp.pn || comp.partNumber || '',
      serialNumber: comp.sn || comp.serialNumber || '',
      aircraftId: comp.aircraftId,
      componentType: comp.category || comp.componentType || comp.name || '',
      ataSystem: comp.ataSystem || 'UNKNOWN',
      description: comp.name || comp.description || '',
      status: comp.status || 'INSTALLED',
      installationDate: comp.installedDate || comp.installationDate,
      removalDate: comp.removalDate,
      removalReason: comp.removalReason,
      totalFlightHours: comp.totalFlightHours || 0,
      totalFlightCycles: comp.totalFlightCycles || comp.csn || 0,
      timeSinceInstallation: comp.timeSinceInstallation,
      cyclesSinceInstallation: comp.cyclesSinceInstallation,
      timeSinceOverhaul: comp.timeSinceOverhaul,
      cyclesSinceOverhaul: comp.cyclesSinceOverhaul,
      nextInspectionDue: comp.nextInspectionDue,
      nextOverhaulDue: comp.nextOverhaulDue,
      overhaulLimit: comp.overhaulLimit,
      cycleLimit: comp.cycleLimit || comp.limitCyc,
      condition: comp.condition || 'NEW',
      location: comp.location,
      cost: comp.cost,
      supplier: comp.supplier,
      warrantyExpiry: comp.warrantyExpiry,
      notes: comp.notes,
      relatedMaintenanceId: comp.relatedMaintenanceId,
      createdAt: comp.createdAt || new Date().toISOString(),
      updatedAt: comp.updatedAt || new Date().toISOString()
    }));

    // Filter components
    if (aircraftId) {
      components = components.filter((c: ComponentRecord) => c.aircraftId === aircraftId);
    }
    if (componentType) {
      components = components.filter((c: ComponentRecord) => c.componentType === componentType);
    }
    if (status) {
      components = components.filter((c: ComponentRecord) => c.status === status);
    }
    if (ataSystem) {
      components = components.filter((c: ComponentRecord) => c.ataSystem === ataSystem);
    }

    // Sort by installation date (newest first)
    components.sort((a: ComponentRecord, b: ComponentRecord) => {
      const dateA = new Date(a.installationDate || a.createdAt);
      const dateB = new Date(b.installationDate || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error("Error retrieving components:", error);
    return NextResponse.json({ error: "Failed to retrieve components" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      partNumber,
      serialNumber,
      aircraftId,
      componentType,
      ataSystem,
      description,
      status,
      installationDate,
      removalDate,
      removalReason,
      totalFlightHours,
      totalFlightCycles,
      timeSinceInstallation,
      cyclesSinceInstallation,
      timeSinceOverhaul,
      cyclesSinceOverhaul,
      nextInspectionDue,
      nextOverhaulDue,
      overhaulLimit,
      cycleLimit,
      condition,
      location,
      cost,
      supplier,
      warrantyExpiry,
      notes,
      relatedMaintenanceId
    } = body;

    // Validate required fields
    if (!partNumber || !serialNumber || !componentType || !ataSystem || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const cache = readCache();

    // Verify aircraft exists if provided
    if (aircraftId) {
      const aircraft = cache.aircraft?.find((a: Aircraft) => a.id === aircraftId);
      if (!aircraft) {
        return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
      }
    }

    // Check for duplicate serial number
    const existingComponent = cache.components?.find((c: ComponentRecord) => c.serialNumber === serialNumber);
    if (existingComponent) {
      return NextResponse.json({ error: 'Component with this serial number already exists' }, { status: 400 });
    }

    const newComponent: ComponentRecord = {
      id: generateId(),
      partNumber,
      serialNumber,
      aircraftId,
      componentType,
      ataSystem,
      description,
      status: status || "IN_STOCK",
      installationDate,
      removalDate,
      removalReason,
      totalFlightHours: totalFlightHours || 0,
      totalFlightCycles: totalFlightCycles || 0,
      timeSinceInstallation,
      cyclesSinceInstallation,
      timeSinceOverhaul,
      cyclesSinceOverhaul,
      nextInspectionDue,
      nextOverhaulDue,
      overhaulLimit: overhaulLimit || 0,
      cycleLimit: cycleLimit || 0,
      condition: condition || "NEW",
      location,
      cost,
      supplier,
      warrantyExpiry,
      notes,
      relatedMaintenanceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!cache.components) {
      cache.components = [];
    }

    cache.components.push(newComponent);
    writeCache(cache);

    return NextResponse.json(newComponent, { status: 201 });
  } catch (error) {
    console.error('Error creating component:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}