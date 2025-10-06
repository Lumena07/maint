import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { Aircraft, PIREP, Snag } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [] };
  }
};

interface ReliabilityCalculationResult {
  period: string;
  aircraftType: string;
  aircraftAvailability: {
    totalPossibleHours: number;
    unavailableHours: number;
    availableHours: number;
    averageAvailableAircraft: number;
    availabilityPercentage: number;
  };
  despatchReliability: {
    totalCycles: number;
    technicalDelays: number;
    technicalCancellations: number;
    despatchReliability: number;
    despatchReliabilityRate: number;
  };
  systemReliability: {
    [systemCode: string]: {
      systemName: string;
      componentCount: number;
      unscheduledRemovals: number;
      systemReliabilityRate: number;
    };
  };
  pilotReportReliability: {
    totalPireps: number;
    totalTakeoffs: number;
    pirepRatePer100Takeoffs: number;
  };
}

// ATA-100 System Classification
const ATA_SYSTEMS = {
  "21": { name: "Air Conditioning", componentCount: 15 },
  "22": { name: "Auto Flight", componentCount: 8 },
  "23": { name: "Communications", componentCount: 12 },
  "24": { name: "Electrical Power", componentCount: 20 },
  "25": { name: "Equipment/Furnishings", componentCount: 25 },
  "26": { name: "Fire Protection", componentCount: 10 },
  "27": { name: "Flight Controls", componentCount: 18 },
  "28": { name: "Fuel", componentCount: 12 },
  "29": { name: "Hydraulic Power", componentCount: 8 },
  "30": { name: "Ice and Rain Protection", componentCount: 6 },
  "31": { name: "Indicating/Recording Systems", componentCount: 15 },
  "32": { name: "Landing Gear", componentCount: 10 },
  "33": { name: "Lights", componentCount: 8 },
  "34": { name: "Navigation", componentCount: 12 },
  "35": { name: "Oxygen", componentCount: 5 },
  "36": { name: "Pneumatic", componentCount: 8 },
  "49": { name: "Airborne Auxiliary Power", componentCount: 6 },
  "71": { name: "Power Plant", componentCount: 25 },
  "72": { name: "Engine", componentCount: 30 },
  "73": { name: "Engine Fuel and Control", componentCount: 12 },
  "74": { name: "Ignition", componentCount: 4 },
  "75": { name: "Air", componentCount: 8 },
  "76": { name: "Engine Controls", componentCount: 6 },
  "77": { name: "Engine Indicating", componentCount: 10 },
  "78": { name: "Exhaust", componentCount: 4 },
  "79": { name: "Oil", componentCount: 6 },
  "80": { name: "Starting", componentCount: 4 },
  "81": { name: "Turbines", componentCount: 8 },
  "82": { name: "Water Injection", componentCount: 3 },
  "83": { name: "Accessory Gearboxes", componentCount: 4 }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aircraftType = searchParams.get("aircraftType") || "C208B";
    const period = searchParams.get("period") || "30_DAYS";

    const cache = readCache();
    const aircraft: Aircraft[] = cache.aircraft || [];
    const pireps: PIREP[] = cache.pireps || [];
    const snags: Snag[] = cache.snags || [];

    // Filter data for specified aircraft type and period
    const targetAircraft = aircraft.filter(a => a.type === aircraftType);
    const periodStart = getPeriodStart(period);
    
    const targetPireps = pireps.filter(p => 
      targetAircraft.some(a => a.id === p.aircraftId) &&
      new Date(p.reportDate) >= periodStart
    );
    
    const targetSnags = snags.filter(s => 
      targetAircraft.some(a => a.id === s.aircraftId) &&
      new Date(s.dateReported) >= periodStart
    );

    // Calculate reliability metrics using industry formulas
    const result: ReliabilityCalculationResult = {
      period,
      aircraftType,
      aircraftAvailability: calculateAircraftAvailability(targetAircraft, period, targetSnags),
      despatchReliability: calculateDespatchReliability(targetAircraft, targetPireps, targetSnags),
      systemReliability: calculateSystemReliability(targetAircraft, targetSnags, period),
      pilotReportReliability: calculatePilotReportReliability(targetPireps, targetAircraft)
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error calculating reliability metrics:", error);
    return NextResponse.json({ error: "Failed to calculate metrics" }, { status: 500 });
  }
}

// Formula 1 & 2: Aircraft Availability
function calculateAircraftAvailability(
  aircraft: Aircraft[], 
  period: string, 
  snags: Snag[]
): ReliabilityCalculationResult['aircraftAvailability'] {
  
  // Formula 1: huk = hm × iuk
  const hm = getPeriodHours(period); // Hours in period
  const iuk = aircraft.length; // Total aircraft of this type
  const huk = hm * iuk; // Total possible capacity in hours
  
  // Use actual maintenance records for downtime calculation
  const cache = readCache();
  const hs = estimateMaintenanceDowntime(snags, aircraft, period, cache);
  
  // Formula 2: ia = (huk - hs) / huk × iuk
  const availableHours = huk - hs;
  const averageAvailableAircraft = (availableHours / huk) * iuk;
  const availabilityPercentage = (availableHours / huk) * 100;
  
  return {
    totalPossibleHours: huk,
    unavailableHours: hs,
    availableHours,
    averageAvailableAircraft,
    availabilityPercentage
  };
}

// Formula 3: Despatch Reliability
function calculateDespatchReliability(
  aircraft: Aircraft[],
  pireps: PIREP[],
  snags: Snag[]
): ReliabilityCalculationResult['despatchReliability'] {
  
  // Use actual flight data for cycle calculation
  const cache = readCache();
  const totalCycles = estimateTotalCycles(aircraft, cache, period);
  
  // Use actual flight data for delay and cancellation counts
  const technicalDelays = countTechnicalDelays(pireps, snags, cache, period);
  const technicalCancellations = countTechnicalCancellations(pireps, snags, cache, period);
  
  // Formula 3: Rd = 1 - (nd + nc) / n
  const despatchReliability = 1 - (technicalDelays + technicalCancellations) / totalCycles;
  const despatchReliabilityRate = despatchReliability * 100;
  
  return {
    totalCycles,
    technicalDelays,
    technicalCancellations,
    despatchReliability,
    despatchReliabilityRate
  };
}

// Formula 4: System Reliability Rate
function calculateSystemReliability(
  aircraft: Aircraft[],
  snags: Snag[],
  period: string
): ReliabilityCalculationResult['systemReliability'] {
  
  const systemReliability: any = {};
  const totalFlightHours = aircraft.reduce((sum, a) => sum + a.currentHrs, 0);
  
  // Group snags by ATA system using actual component data
  const cache = readCache();
  const systemSnags = groupSnagsByATASystem(snags, cache);
  
  // Calculate for each ATA system
  Object.entries(ATA_SYSTEMS).forEach(([systemCode, systemInfo]) => {
    const systemSnagCount = systemSnags[systemCode] || 0;
    
    // Formula 4: iur = nur / (nks × h) × 1000
    const systemReliabilityRate = (systemSnagCount / (systemInfo.componentCount * totalFlightHours)) * 1000;
    
    systemReliability[systemCode] = {
      systemName: systemInfo.name,
      componentCount: systemInfo.componentCount,
      unscheduledRemovals: systemSnagCount,
      systemReliabilityRate
    };
  });
  
  return systemReliability;
}

// Formula 5: Pilot Report Reliability
function calculatePilotReportReliability(
  pireps: PIREP[],
  aircraft: Aircraft[]
): ReliabilityCalculationResult['pilotReportReliability'] {
  
  const totalPireps = pireps.length;
  const cache = readCache();
  const totalTakeoffs = estimateTotalCycles(aircraft, cache, "30_DAYS");
  
  // Formula 5: ip = np / nto × 100
  const pirepRatePer100Takeoffs = (totalPireps / totalTakeoffs) * 100;
  
  return {
    totalPireps,
    totalTakeoffs,
    pirepRatePer100Takeoffs
  };
}

// Helper Functions
function getPeriodHours(period: string): number {
  switch (period) {
    case "7_DAYS": return 7 * 24;
    case "30_DAYS": return 30 * 24;
    case "90_DAYS": return 90 * 24;
    case "ANNUAL": return 365 * 24;
    default: return 30 * 24;
  }
}

function getPeriodStart(period: string): Date {
  const now = new Date();
  const start = new Date(now);
  
  switch (period) {
    case "7_DAYS":
      start.setDate(start.getDate() - 7);
      break;
    case "30_DAYS":
      start.setDate(start.getDate() - 30);
      break;
    case "90_DAYS":
      start.setDate(start.getDate() - 90);
      break;
    case "ANNUAL":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setDate(start.getDate() - 30);
  }
  
  return start;
}

function estimateMaintenanceDowntime(snags: Snag[], aircraft: Aircraft[], period: string, cache: any): number {
  // Use actual maintenance records if available
  const maintenanceRecords = cache.maintenance || [];
  const periodStart = getPeriodStart(period, new Date());
  
  // Filter maintenance records for the period
  const periodMaintenance = maintenanceRecords.filter((m: any) => 
    new Date(m.startDate) >= periodStart &&
    m.status === "COMPLETED"
  );
  
  // Sum actual downtime hours from maintenance records
  const actualDowntime = periodMaintenance.reduce((sum: number, m: any) => 
    sum + (m.downtimeHours || 0), 0
  );
  
  // Fallback to estimation if no maintenance records
  if (actualDowntime === 0) {
    const criticalSnags = snags.filter(s => s.severity === "Critical");
    const majorSnags = snags.filter(s => s.severity === "Major");
    
    // Estimate downtime: Critical snags = 24h, Major snags = 8h
    return (criticalSnags.length * 24) + (majorSnags.length * 8);
  }
  
  return actualDowntime;
}

function estimateTotalCycles(aircraft: Aircraft[], cache: any, period: string): number {
  // Use actual flight data if available
  const flights = cache.flights || [];
  const periodStart = getPeriodStart(period, new Date());
  
  // Filter flights for the period and aircraft
  const aircraftIds = aircraft.map(a => a.id);
  const periodFlights = flights.filter((f: any) => 
    aircraftIds.includes(f.aircraftId) &&
    new Date(f.scheduledDeparture) >= periodStart &&
    f.status !== "CANCELLED"
  );
  
  // Sum actual flight cycles from flight records
  const actualCycles = periodFlights.reduce((sum: number, f: any) => 
    sum + (f.flightCycles || 1), 0 // Default to 1 cycle per flight if not specified
  );
  
  // Fallback to estimation if no flight data
  if (actualCycles === 0) {
    return aircraft.reduce((sum, a) => sum + a.currentCyc, 0);
  }
  
  return actualCycles;
}

function countTechnicalDelays(pireps: PIREP[], snags: Snag[], cache: any, period: string): number {
  // Use actual flight data if available
  const flights = cache.flights || [];
  const periodStart = getPeriodStart(period, new Date());
  
  // Filter flights for the period
  const periodFlights = flights.filter((f: any) => 
    new Date(f.scheduledDeparture) >= periodStart
  );
  
  // Count actual technical delays from flight records
  const technicalDelays = periodFlights.filter((f: any) => 
    f.delayReason === "TECHNICAL" && 
    f.delayMinutes && 
    f.delayMinutes > 15 // Industry standard: delays > 15 minutes
  );
  
  // Fallback to estimation if no flight data
  if (technicalDelays.length === 0) {
    const delayPireps = pireps.filter(p => 
      p.severity === "MAJOR" || p.severity === "CRITICAL"
    );
    
    const delaySnags = snags.filter(s => 
      s.severity === "Major" || s.severity === "Critical"
    );
    
    return delayPireps.length + delaySnags.length;
  }
  
  return technicalDelays.length;
}

function countTechnicalCancellations(pireps: PIREP[], snags: Snag[], cache: any, period: string): number {
  // Use actual flight data if available
  const flights = cache.flights || [];
  const periodStart = getPeriodStart(period, new Date());
  
  // Filter flights for the period
  const periodFlights = flights.filter((f: any) => 
    new Date(f.scheduledDeparture) >= periodStart
  );
  
  // Count actual technical cancellations from flight records
  const technicalCancellations = periodFlights.filter((f: any) => 
    f.status === "CANCELLED" && 
    f.cancellationReason && 
    f.cancellationReason.toLowerCase().includes("technical")
  );
  
  // Fallback to estimation if no flight data
  if (technicalCancellations.length === 0) {
    const criticalPireps = pireps.filter(p => p.severity === "CRITICAL");
    const criticalSnags = snags.filter(s => s.severity === "Critical");
    
    return criticalPireps.length + criticalSnags.length;
  }
  
  return technicalCancellations.length;
}

function groupSnagsByATASystem(snags: Snag[], cache: any): { [key: string]: number } {
  const systemCounts: { [key: string]: number } = {};
  
  // Use actual component removals if available
  const components = cache.components || [];
  const unscheduledRemovals = components.filter((c: any) => 
    c.removalReason === "UNSCHEDULED" || c.removalReason === "FAILURE"
  );
  
  unscheduledRemovals.forEach((component: any) => {
    const systemCode = component.ataSystem;
    if (systemCode) {
      systemCounts[systemCode] = (systemCounts[systemCode] || 0) + 1;
    }
  });
  
  // Fallback to snag analysis if no component data
  if (Object.keys(systemCounts).length === 0) {
    snags.forEach(snag => {
      const systemCode = mapDescriptionToATASystem(snag.description);
      if (systemCode) {
        systemCounts[systemCode] = (systemCounts[systemCode] || 0) + 1;
      }
    });
  }
  
  return systemCounts;
}

function mapDescriptionToATASystem(description: string): string | null {
  const desc = description.toLowerCase();
  
  // Simplified mapping based on keywords
  if (desc.includes('engine') || desc.includes('power')) return "71";
  if (desc.includes('electrical') || desc.includes('power')) return "24";
  if (desc.includes('hydraulic')) return "29";
  if (desc.includes('landing gear') || desc.includes('gear')) return "32";
  if (desc.includes('fuel')) return "28";
  if (desc.includes('navigation') || desc.includes('nav')) return "34";
  if (desc.includes('communication') || desc.includes('comm')) return "23";
  if (desc.includes('air conditioning') || desc.includes('ac')) return "21";
  if (desc.includes('flight control')) return "27";
  if (desc.includes('fire')) return "26";
  
  return null; // Unknown system
}
