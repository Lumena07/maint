import { NextRequest, NextResponse } from "next/server";
import { Aircraft } from "@/lib/types";

// Mock data - in a real app, this would connect to your database
const mockAircraft: Aircraft[] = [
  {
    id: "ac-AAC",
    registration: "5H-AAC",
    type: "C208B",
    msn: "208B-1234",
    status: "In Service",
    base: "HKJK",
    deliveryDate: "2018-06-01",
    inServiceDate: "2018-07-01",
    currentHrs: 6123.4,
    currentCyc: 5321,
    currentDate: "2025-09-15",
    avgDailyHrs: 3.2,
    avgDailyCyc: 3.0,
    yearOfManufacture: 2018,
    serialNumber: "208B-1234",
    manufacturer: "Cessna",
    engineNumber: "PT6A-114A-12345",
    propellerNumber: "HC-D4N-3P-123",
    lastCofA: "2024-08-21",
    lastCofANextDue: "2025-08-21",
    lastWandB: "2020-04-19",
    lastWandBNextDue: "2025-04-19",
    navdataBaseLastDone: "2025-09-01",
    navdataBaseNextDue: "2025-10-01",
    fakLastDone: "2025-08-15",
    fakNextDue: "2026-08-15",
    survivalKitLastDone: "2025-07-20",
    survivalKitNextDue: "2026-07-20"
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const aircraft = mockAircraft.find(ac => ac.id === id);
  
  if (!aircraft) {
    return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });
  }
  
  return NextResponse.json(aircraft);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();
  
  const aircraftIndex = mockAircraft.findIndex(ac => ac.id === id);
  
  if (aircraftIndex === -1) {
    return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });
  }
  
  // Update the aircraft with the new data
  mockAircraft[aircraftIndex] = {
    ...mockAircraft[aircraftIndex],
    ...updates
  };
  
  return NextResponse.json(mockAircraft[aircraftIndex]);
}
