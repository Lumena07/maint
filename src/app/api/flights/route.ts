import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Flight, FlightStatus, FlightDelayReason, Aircraft } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [], flights: [] };
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
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const cache = readCache();
    let flights: Flight[] = cache.flights || [];

    // Filter flights
    if (aircraftId) {
      flights = flights.filter((f: Flight) => f.aircraftId === aircraftId);
    }
    if (status) {
      flights = flights.filter((f: Flight) => f.status === status);
    }
    if (startDate) {
      flights = flights.filter((f: Flight) => new Date(f.scheduledDeparture) >= new Date(startDate));
    }
    if (endDate) {
      flights = flights.filter((f: Flight) => new Date(f.scheduledDeparture) <= new Date(endDate));
    }

    // Sort by departure date (newest first)
    flights.sort((a: Flight, b: Flight) => new Date(b.scheduledDeparture).getTime() - new Date(a.scheduledDeparture).getTime());

    return NextResponse.json(flights);
  } catch (error) {
    console.error("Error retrieving flights:", error);
    return NextResponse.json({ error: "Failed to retrieve flights" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      flightNumber,
      aircraftId,
      scheduledDeparture,
      scheduledArrival,
      actualDeparture,
      actualArrival,
      delayMinutes,
      delayReason,
      status,
      cancellationReason,
      diversionReason,
      departureAirport,
      arrivalAirport,
      flightHours,
      flightCycles,
      crewId,
      passengers,
      cargo,
      fuelUsed,
      weatherConditions,
      notes
    } = body;

    // Validate required fields
    if (!flightNumber || !aircraftId || !scheduledDeparture || !scheduledArrival || !departureAirport || !arrivalAirport) {
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

    // Calculate delay if actual departure provided
    let calculatedDelayMinutes = delayMinutes;
    if (actualDeparture && !delayMinutes) {
      const scheduled = new Date(scheduledDeparture);
      const actual = new Date(actualDeparture);
      calculatedDelayMinutes = Math.max(0, Math.round((actual.getTime() - scheduled.getTime()) / (1000 * 60)));
    }

    const newFlight: Flight = {
      id: generateId(),
      flightNumber,
      aircraftId,
      scheduledDeparture,
      scheduledArrival,
      actualDeparture,
      actualArrival,
      delayMinutes: calculatedDelayMinutes,
      delayReason,
      status: status || "SCHEDULED",
      cancellationReason,
      diversionReason,
      departureAirport,
      arrivalAirport,
      flightHours: flightHours || 0,
      flightCycles: flightCycles || 0,
      crewId,
      passengers,
      cargo,
      fuelUsed,
      weatherConditions,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!cache.flights) {
      cache.flights = [];
    }

    cache.flights.push(newFlight);
    writeCache(cache);

    return NextResponse.json(newFlight, { status: 201 });
  } catch (error) {
    console.error('Error creating flight:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

