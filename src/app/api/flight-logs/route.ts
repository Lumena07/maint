import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Aircraft, Assembly, FlightLog } from "@/lib/types";

const CACHE_PATH = path.join(process.cwd(), "public", "aaf-cache.json");

// GET endpoint to retrieve flight logs and related data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get("aircraftId");

    if (!aircraftId) {
      return NextResponse.json({ error: "Aircraft ID required" }, { status: 400 });
    }

    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);

    // Get flight logs for this aircraft
    const flightLogs = data.flightLogs?.filter((log: FlightLog) => log.aircraftId === aircraftId) || [];
    
    // Get CofA resets for this aircraft
    const cofaResets = data.cofaResets?.filter((reset: any) => reset.aircraftId === aircraftId) || [];
    
    // Get check extensions for this aircraft
    const checkExtensions = data.checkExtensions?.filter((ext: any) => ext.aircraftId === aircraftId) || [];

    return NextResponse.json({
      flightLogs,
      cofaResets,
      checkExtensions
    });
  } catch (error) {
    console.error("Error retrieving flight data:", error);
    return NextResponse.json({ error: "Failed to retrieve flight data" }, { status: 500 });
  }
}

// POST endpoint to add a new flight log entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aircraftId, date, blockHrs, cycles, techlogNumber, from, to, pilot, remarks, cofaReset, hoursToCheck, isExtension } = body;

    if (!aircraftId || !date || blockHrs === undefined || cycles === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);

    // Find the aircraft
    const aircraft = data.aircraft?.find((a: Aircraft) => a.id === aircraftId);
    if (!aircraft) {
      return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });
    }

    // Get all existing flight logs to calculate cumulative values
    const existingLogs = data.flightLogs?.filter((log: FlightLog) => log.aircraftId === aircraftId) || [];
    const sortedLogs = [...existingLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Starting point values from 2025-08-21
    const startingAircraftHrs = 12101.4; // Aircraft TSN baseline
    const startingAircraftCyc = 15423; // Aircraft CSN baseline
    const startingEngineTSN = 2335.3;
    const startingEngineCSN = 3435;
    const startingEngineTSO = 0;
    const startingEngineCSO = 0;
    const startingPropTSO = 2335.3;
    const startingPropTSN = 11244.6;
    const startingCofAHours = 1345.4;
    const startingHoursToCheck = 170.8;
    
    // Calculate cumulative hours and cycles including this new entry
    const cumulativeHrs = startingAircraftHrs + sortedLogs.reduce((sum, l) => sum + l.blockHrs, 0) + parseFloat(blockHrs);
    const cumulativeCyc = startingAircraftCyc + sortedLogs.reduce((sum, l) => sum + l.cycles, 0) + parseInt(cycles);
    
    // Calculate CofA Hours (reset to 0 when CofA reset is checked)
    let cofaHours = startingCofAHours;
    const allLogsIncludingNew = [...sortedLogs, { date, blockHrs: parseFloat(blockHrs), cofaReset }];
    for (let i = allLogsIncludingNew.length - 1; i >= 0; i--) {
      if ((allLogsIncludingNew[i] as any).cofaReset) {
        cofaHours = 0;
        break;
      }
      cofaHours += allLogsIncludingNew[i].blockHrs;
    }
    
    // Calculate hours to check (decreases by flight hours unless extension/check adds hours)
    let calculatedHoursToCheck = startingHoursToCheck;
    for (const l of allLogsIncludingNew) {
      // If this entry has hoursToCheck value, it's either an extension or check
      if ((l as any).hoursToCheck) {
        if ((l as any).isExtension) {
          // Extension: previous hours to check - flight hours + extension hours
          calculatedHoursToCheck = calculatedHoursToCheck - l.blockHrs + (l as any).hoursToCheck;
        } else {
          // Check: replace with check hours (but still subtract flight hours first)
          calculatedHoursToCheck = (l as any).hoursToCheck - l.blockHrs;
        }
      } else {
        // Regular flight: previous hours to check - flight hours
        calculatedHoursToCheck -= l.blockHrs;
      }
    }
    
    // Calculate values step by step for each flight log entry
    let currentAircraftHrs = startingAircraftHrs;
    let currentAircraftCyc = startingAircraftCyc;
    let currentEngineTSN = startingEngineTSN;
    let currentEngineCSN = startingEngineCSN;
    let currentEngineTSO = startingEngineTSO;
    let currentEngineCSO = startingEngineCSO;
    let currentEngineOH = 2764.7;
    let currentPropTSN = startingPropTSN;
    let currentPropTSO = startingPropTSO;
    let currentPropOH = 664.7;
    
    // Apply each existing flight log entry sequentially
    for (const flightLog of sortedLogs) {
      currentAircraftHrs += flightLog.blockHrs;
      currentAircraftCyc += flightLog.cycles;
      currentEngineTSN += flightLog.blockHrs;
      currentEngineCSN += flightLog.cycles;
      currentEngineTSO = startingEngineTSO; // Remains 0 until engine overhaul
      currentEngineCSO = startingEngineCSO; // Remains 0 until engine overhaul
      currentEngineOH -= flightLog.blockHrs;
      currentPropTSN += flightLog.blockHrs;
      currentPropTSO += flightLog.blockHrs;
      currentPropOH -= flightLog.blockHrs;
    }
    
    // Apply the new flight log entry
    currentAircraftHrs += parseFloat(blockHrs);
    currentAircraftCyc += parseInt(cycles);
    currentEngineTSN += parseFloat(blockHrs);
    currentEngineCSN += parseInt(cycles);
    currentEngineTSO = startingEngineTSO; // Remains 0 until engine overhaul
    currentEngineCSO = startingEngineCSO; // Remains 0 until engine overhaul
    currentEngineOH -= parseFloat(blockHrs);
    currentPropTSN += parseFloat(blockHrs);
    currentPropTSO += parseFloat(blockHrs);
    currentPropOH -= parseFloat(blockHrs);
    
    const engineTSN = currentEngineTSN;
    const engineCSN = currentEngineCSN;
    const engineTSO = currentEngineTSO;
    const engineCSO = currentEngineCSO;
    const engineOH = currentEngineOH;
    const propTSN = currentPropTSN;
    const propTSO = currentPropTSO;
    const propOH = currentPropOH;

    // Create new flight log entry with calculated values
    const flightLog: FlightLog = {
      id: `fl-${aircraftId}-${Date.now()}`,
      aircraftId,
      date,
      blockHrs: parseFloat(blockHrs),
      cycles: parseInt(cycles),
      from,
      to,
      // Store additional fields in the flight log object
      ...(techlogNumber && { techlogNumber }),
      ...(pilot && { pilot }),
      ...(remarks && { remarks }),
      ...(cofaReset && { cofaReset }),
      ...(hoursToCheck !== undefined && { hoursToCheck }),
      ...(isExtension && { isExtension }),
      // Store calculated values
      engineTSN,
      engineCSN,
      engineTSO: startingEngineTSO,
      engineCSO: startingEngineCSO,
      engineOH,
      propTSN,
      propTSO: startingPropTSO,
      propOH,
      cofaHours,
      hoursToCheck: calculatedHoursToCheck
    };

    // Add to flight logs array
    if (!data.flightLogs) {
      data.flightLogs = [];
    }
    data.flightLogs.push(flightLog);

    // Update aircraft with latest values from this flight log entry
    aircraft.currentHrs = cumulativeHrs;
    aircraft.currentCyc = cumulativeCyc;
    aircraft.currentDate = date;
    aircraft.engineTSN = engineTSN;
    aircraft.engineCSN = engineCSN;
    aircraft.engineOH = engineOH;
    aircraft.propTSN = propTSN;
    aircraft.propOH = propOH;
    aircraft.cofaHours = cofaHours;
    aircraft.hoursToCheck = calculatedHoursToCheck;

    // Update engine and propeller TSN/CSN based on their TSO/CSO values
    const assemblies = data.assemblies?.filter((a: Assembly) => a.aircraftId === aircraftId) || [];
    
    assemblies.forEach((assembly: Assembly) => {
      if (assembly.type === "Engine" || assembly.type === "Propeller") {
        // TSN = Aircraft TSN - TSO (since last overhaul)
        assembly.tsnHrs = aircraft.currentHrs - (assembly.tsoHrs || 0);
        assembly.csn = aircraft.currentCyc - (assembly.cso || 0);
      }
    });

    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      flightLog,
      updatedAircraft: aircraft
    });
  } catch (error) {
    console.error("Error adding flight log:", error);
    return NextResponse.json({ error: "Failed to add flight log" }, { status: 500 });
  }
}
