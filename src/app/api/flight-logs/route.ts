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
    const { aircraftId, date, blockHrs, cycles, techlogNumber, from, to, pilot, remarks, cofaReset, hoursToCheck, isExtension, engineOHReset, propOHReset } = body;

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
    
    // Starting point values (BEFORE the first flight on 2025-08-21) - copied from frontend
    const startingAircraftHrs = 12097.5; // Aircraft TSN baseline (12101.4 - 3.9)
    const startingAircraftCyc = 15415; // Aircraft CSN baseline (15423 - 8)
    const startingEngineTSN = 2331.4; // Engine TSN baseline (2335.3 - 3.9)
    const startingEngineCSN = 3427; // Engine CSN baseline (3435 - 8)
    const startingEngineTSO = 0;
    const startingEngineCSO = 0;
    const startingPropTSO = 2331.4; // Prop TSO baseline (2335.3 - 3.9)
    const startingPropTSN = 11240.7; // Prop TSN baseline (11244.6 - 3.9)
    const startingCofAHours = 1341.5; // CofA Hours baseline (1345.4 - 3.9)
    const startingHoursToCheck = 174.7; // Hours to Check baseline (170.8 + 3.9)
    
    // Calculate cumulative values step by step for each flight log entry - copied from frontend
    let currentAircraftHrs = startingAircraftHrs;
    let currentAircraftCyc = startingAircraftCyc;
    let currentEngineTSN = startingEngineTSN;
    let currentEngineCSN = startingEngineCSN;
    let currentEngineTSO = startingEngineTSO;
    let currentEngineCSO = startingEngineCSO;
    let currentEngineOH = 2768.6; // Engine OH baseline (2764.7 + 3.9)
    let currentPropTSN = startingPropTSN;
    let currentPropTSO = startingPropTSO;
    let currentPropOH = 668.6; // Prop OH baseline (664.7 + 3.9)
    let currentCofAHours = startingCofAHours;
    let currentHoursToCheck = startingHoursToCheck;
    
    // Apply all existing flights sequentially
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
      
      // Handle CofA Hours (reset to 0 when CofA reset is checked)
      if ((flightLog as any).cofaReset) {
        currentCofAHours = 0;
      } else {
        currentCofAHours += flightLog.blockHrs;
      }
      
      // Handle Engine OH reset
      if ((flightLog as any).engineOHReset) {
        currentEngineOH = aircraft.EngineTBO || 5100;
      }
      
      // Handle Prop OH reset
      if ((flightLog as any).propOHReset) {
        currentPropOH = aircraft.PropTBO || 3000;
      }
      
      // Handle hours to check
      if ((flightLog as any).hoursToCheck && (flightLog as any).hoursToCheck > 0) {
        if ((flightLog as any).isExtension) {
          // Extension: previous hours to check - flight hours + extension hours
          currentHoursToCheck = currentHoursToCheck - flightLog.blockHrs + (flightLog as any).hoursToCheck;
        } else {
          // Check: replace with check hours (hours added becomes the new hours to check)
          currentHoursToCheck = (flightLog as any).hoursToCheck;
        }
      } else {
        // Regular flight: previous hours to check - flight hours
        currentHoursToCheck -= flightLog.blockHrs;
      }
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
    
    // Handle CofA Hours for new entry
    if (cofaReset) {
      currentCofAHours = 0;
    } else {
      currentCofAHours += parseFloat(blockHrs);
    }
    
    // Handle Engine OH reset for new entry
    if (engineOHReset) {
      currentEngineOH = aircraft.EngineTBO || 5100;
    }
    
    // Handle Prop OH reset for new entry
    if (propOHReset) {
      currentPropOH = aircraft.PropTBO || 3000;
    }
    
    // Handle hours to check for new entry
    if (hoursToCheck && hoursToCheck > 0) {
      if (isExtension) {
        // Extension: previous hours to check - flight hours + extension hours
        currentHoursToCheck = currentHoursToCheck - parseFloat(blockHrs) + hoursToCheck;
      } else {
        // Check: replace with check hours (hours added becomes the new hours to check)
        currentHoursToCheck = hoursToCheck;
      }
    } else {
      // Regular flight: previous hours to check - flight hours
      currentHoursToCheck -= parseFloat(blockHrs);
    }
    
    // Final values
    const cumulativeHrs = currentAircraftHrs;
    const cumulativeCyc = currentAircraftCyc;
    const engineTSN = currentEngineTSN;
    const engineCSN = currentEngineCSN;
    const engineTSO = currentEngineTSO;
    const engineCSO = currentEngineCSO;
    const engineOH = currentEngineOH;
    const propTSN = currentPropTSN;
    const propTSO = currentPropTSO;
    const propOH = currentPropOH;
    const cofaHours = currentCofAHours;
    const calculatedHoursToCheck = currentHoursToCheck;

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
      ...(hoursToCheck !== undefined && hoursToCheck > 0 && { hoursToCheck }),
      ...(isExtension && { isExtension }),
      ...(engineOHReset && { engineOHReset }),
      ...(propOHReset && { propOHReset }),
      // Store calculated values
      engineTSN,
      engineCSN,
      engineTSO: startingEngineTSO,
      engineCSO: startingEngineCSO,
      engineOH,
      propTSN,
      propTSO: startingPropTSO,
      propOH
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
    aircraft.CofA_Hours = cofaHours;
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
