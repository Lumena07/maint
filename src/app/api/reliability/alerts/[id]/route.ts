import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Alert } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [], alerts: [] };
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cache = readCache();
    const alerts: Alert[] = cache.alerts || [];
    const alert = alerts.find((a) => a.id === id);

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Error retrieving alert:", error);
    return NextResponse.json({ error: "Failed to retrieve alert" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const cache = readCache();
    let alerts: Alert[] = cache.alerts || [];

    const alertIndex = alerts.findIndex((a) => a.id === id);

    if (alertIndex === -1) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const updatedAlert: Alert = {
      ...alerts[alertIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Set resolved date if status is being changed to resolved
    if (body.status === "RESOLVED" && alerts[alertIndex].status !== "RESOLVED") {
      updatedAlert.resolvedAt = new Date().toISOString();
      updatedAlert.resolvedBy = body.resolvedBy || "System";
    }

    alerts[alertIndex] = updatedAlert;
    cache.alerts = alerts;
    writeCache(cache);

    return NextResponse.json(updatedAlert);
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cache = readCache();
    let alerts: Alert[] = cache.alerts || [];

    const initialLength = alerts.length;
    alerts = alerts.filter((a) => a.id !== id);

    if (alerts.length === initialLength) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    cache.alerts = alerts;
    writeCache(cache);

    return NextResponse.json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}

