import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { PIREP, Snag, Aircraft, ReliabilityMetric, ReliabilityMetricType } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [] }; // Return empty arrays if file doesn't exist
  }
};

interface MetricCalculation {
  aircraftId: string;
  componentId?: string;
  metricType: ReliabilityMetricType;
  value: number;
  unit: string;
  period: string;
  trend: "IMPROVING" | "STABLE" | "DEGRADING";
  baselineValue?: number;
  targetValue?: number;
  calculatedDate: string;
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get("aircraftId");
    const period = searchParams.get("period") || "30_DAYS";

    const cache = readCache();
    const aircraft = cache.aircraft || [];
    const pireps = cache.pireps || [];
    const snags = cache.snags || [];

    // Calculate metrics for specified aircraft or all aircraft
    const targetAircraft = aircraftId 
      ? aircraft.filter(a => a.id === aircraftId)
      : aircraft;

    const metrics: ReliabilityMetric[] = [];

    for (const ac of targetAircraft) {
      // Filter data for this aircraft
      const aircraftPireps = pireps.filter((p: PIREP) => p.aircraftId === ac.id);
      const aircraftSnags = snags.filter((s: Snag) => s.aircraftId === ac.id);

      // Calculate various metrics
      const calculatedMetrics = await calculateAircraftMetrics(ac, aircraftPireps, aircraftSnags, period);
      metrics.push(...calculatedMetrics);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error calculating reliability metrics:", error);
    return NextResponse.json({ error: "Failed to calculate metrics" }, { status: 500 });
  }
}

async function calculateAircraftMetrics(
  aircraft: Aircraft,
  pireps: PIREP[],
  snags: Snag[],
  period: string
): Promise<ReliabilityMetric[]> {
  const metrics: ReliabilityMetric[] = [];
  const now = new Date();
  const periodStart = getPeriodStart(period, now);

  // Filter data for the specified period
  const recentPireps = pireps.filter(p => new Date(p.reportDate) >= periodStart);
  const recentSnags = snags.filter(s => new Date(s.dateReported) >= periodStart);

  // 1. MTBF (Mean Time Between Failures)
  const mtbf = calculateMTBF(aircraft, recentSnags, periodStart);
  if (mtbf) {
    metrics.push(mtbf);
  }

  // 2. MTTR (Mean Time To Repair)
  const mttr = calculateMTTR(recentSnags, periodStart);
  if (mttr) {
    metrics.push(mttr);
  }

  // 3. Failure Rate
  const failureRate = calculateFailureRate(aircraft, recentSnags, periodStart);
  if (failureRate) {
    metrics.push(failureRate);
  }

  // 4. Dispatch Reliability (using Industry Standards calculation)
  const dispatchReliability = calculateDispatchReliabilityIndustryStandard(aircraft, recentPireps, recentSnags, periodStart);
  if (dispatchReliability) {
    metrics.push(dispatchReliability);
  }

  // 5. PIREP Frequency (using Industry Standards calculation)
  const pirepFrequency = calculatePilotReportReliabilityIndustryStandard(aircraft, recentPireps, periodStart);
  if (pirepFrequency) {
    metrics.push(pirepFrequency);
  }

  // 6. Aircraft Availability (Industry Standards)
  const aircraftAvailability = calculateAircraftAvailabilityIndustryStandard(aircraft, recentSnags, periodStart, period);
  if (aircraftAvailability) {
    metrics.push(aircraftAvailability);
  }

  // 6. Aircraft System Reliability (ATA 100 specification)
  const systemReliability = calculateAircraftSystemReliability(aircraft, recentPireps, recentSnags, periodStart);
  metrics.push(...systemReliability);

  return metrics;
}

function calculateMTBF(aircraft: Aircraft, snags: Snag[], periodStart: Date): ReliabilityMetric | null {
  // Only calculate if we have enough data
  if (snags.length < 2) return null;

  // Sort snags by date
  const sortedSnags = snags.sort((a, b) => new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime());

  // Calculate time intervals between failures
  const intervals: number[] = [];
  for (let i = 1; i < sortedSnags.length; i++) {
    const prevDate = new Date(sortedSnags[i - 1].dateReported);
    const currDate = new Date(sortedSnags[i].dateReported);
    const intervalHours = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60);
    intervals.push(intervalHours);
  }

  // Calculate mean
  const mtbfHours = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

  // Determine trend (compare with previous period)
  const trend = determineTrend(mtbfHours, getHistoricalMTBF(aircraft.id));

  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "MTBF",
    value: mtbfHours,
    unit: "hours",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalMTBF(aircraft.id),
    targetValue: aircraft.EngineTBO * 0.8, // Target 80% of TBO
    trend,
    notes: `Based on ${sortedSnags.length} failures over ${intervals.length} intervals`
  };
}

function calculateMTTR(snags: Snag[], periodStart: Date): ReliabilityMetric | null {
  // Filter snags that have been resolved
  const resolvedSnags = snags.filter(s => s.status === "Resolved" || s.status === "Closed");

  if (resolvedSnags.length === 0) return null;

  // Calculate repair times
  const repairTimes: number[] = [];
  resolvedSnags.forEach(snag => {
    if (snag.updatedAt && snag.createdAt) {
      const startTime = new Date(snag.createdAt).getTime();
      const endTime = new Date(snag.updatedAt).getTime();
      const repairTimeHours = (endTime - startTime) / (1000 * 60 * 60);
      repairTimes.push(repairTimeHours);
    }
  });

  if (repairTimes.length === 0) return null;

  const mttrHours = repairTimes.reduce((sum, time) => sum + time, 0) / repairTimes.length;
  const trend = determineTrend(mttrHours, getHistoricalMTTR());

  return {
    id: generateId(),
    aircraftId: resolvedSnags[0].aircraftId,
    metricType: "MTTR",
    value: mttrHours,
    unit: "hours",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalMTTR(),
    targetValue: 24, // Target 24 hours
    trend,
    notes: `Based on ${resolvedSnags.length} resolved snags`
  };
}

function calculateFailureRate(aircraft: Aircraft, snags: Snag[], periodStart: Date): ReliabilityMetric | null {
  if (snags.length === 0) return null;

  // Calculate period duration in hours
  const periodHours = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60);
  
  // Calculate failure rate (failures per 1000 flight hours)
  const flightHours = aircraft.currentHrs; // This should be flight hours for the period
  const failureRate = (snags.length / flightHours) * 1000;

  const trend = determineTrend(failureRate, getHistoricalFailureRate(aircraft.id));

  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "FAILURE_RATE",
    value: failureRate,
    unit: "failures/1000h",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalFailureRate(aircraft.id),
    targetValue: 5, // Target 5 failures per 1000 hours
    trend,
    notes: `Based on ${snags.length} snags over ${flightHours.toFixed(1)} flight hours`
  };
}

function calculateDispatchReliability(aircraft: Aircraft, pireps: PIREP[], snags: Snag[], periodStart: Date): ReliabilityMetric | null {
  // Calculate dispatch reliability percentage
  // This is a simplified calculation - in reality, you'd need flight data
  const criticalIssues = pireps.filter(p => p.severity === "CRITICAL").length + 
                        snags.filter(s => s.severity === "Critical").length;
  
  const totalIssues = pireps.length + snags.length;
  const dispatchReliability = totalIssues > 0 ? ((totalIssues - criticalIssues) / totalIssues) * 100 : 100;

  const trend = determineTrend(dispatchReliability, getHistoricalDispatchReliability(aircraft.id));

  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "DISPATCH_RELIABILITY",
    value: dispatchReliability,
    unit: "%",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalDispatchReliability(aircraft.id),
    targetValue: 95, // Target 95% dispatch reliability
    trend,
    notes: `Based on ${totalIssues} total issues, ${criticalIssues} critical`
  };
}

function calculatePIREPFrequency(aircraft: Aircraft, pireps: PIREP[], periodStart: Date): ReliabilityMetric | null {
  if (pireps.length === 0) return null;

  // Calculate PIREPs per 100 flight hours
  const flightHours = aircraft.currentHrs;
  const pirepFrequency = (pireps.length / flightHours) * 100;

  const trend = determineTrend(pirepFrequency, getHistoricalPIREPFrequency(aircraft.id));

  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "PIREP_FREQUENCY",
    value: pirepFrequency,
    unit: "PIREPs/100h",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalPIREPFrequency(aircraft.id),
    targetValue: 2, // Target 2 PIREPs per 100 hours
    trend,
    notes: `Based on ${pireps.length} PIREPs over ${flightHours.toFixed(1)} flight hours`
  };
}

function calculateAircraftSystemReliability(aircraft: Aircraft, pireps: PIREP[], snags: Snag[], periodStart: Date): ReliabilityMetric[] {
  const metrics: ReliabilityMetric[] = [];
  const cache = readCache();
  
  // Key ATA 100 System Categories (most critical systems)
  const ataSystems = [
    { code: "72", name: "ENGINE" },
    { code: "32", name: "LANDING_GEAR" },
    { code: "24", name: "ELECTRICAL_POWER" },
    { code: "29", name: "HYDRAULIC_POWER" },
    { code: "28", name: "FUEL" },
    { code: "34", name: "NAVIGATION" },
    { code: "23", name: "COMMUNICATIONS" },
    { code: "27", name: "FLIGHT_CONTROLS" }
  ];
  
  // Get components for this aircraft
  const components = cache.components?.filter((c: any) => c.aircraftId === aircraft.id) || [];
  
  // Calculate period flight hours
  const periodHours = getPeriodHours("30_DAYS"); // Default to 30 days
  
  // Show all systems, even those with no components or removals
  ataSystems.forEach(system => {
    // Count unscheduled component removals for this system
    const systemComponents = components.filter((c: any) => 
      c.ataSystem && c.ataSystem.includes(system.code) && 
      c.status === "REMOVED" && 
      (c.removalReason === "UNSCHEDULED" || c.removalReason === "FAILURE")
    );
    
    const nur = systemComponents.length; // Number of unscheduled removals
    const nks = components.filter((c: any) => c.ataSystem && c.ataSystem.includes(system.code)).length; // Number of components in system
    const h = aircraft.currentHrs; // Total aircraft flight hours
    
    // Calculate system reliability rate: iur = nur / nks ⋅ h x 1000
    if (h > 0) {
      let iur = 0;
      let reliabilityPercentage = 100; // Default to 100% if no components
      
      if (nks > 0) {
        iur = (nur / (nks * h)) * 1000; // System reliability rate (lower is better)
        reliabilityPercentage = Math.max(0, 100 - (iur * 10)); // Scale factor for display
      }
      
      const trend = determineTrend(reliabilityPercentage, 95); // Assume 95% baseline
      
      metrics.push({
        id: generateId(),
        aircraftId: aircraft.id,
        metricType: "COMPONENT_RELIABILITY", // Keep same type for compatibility
        value: reliabilityPercentage,
        unit: "%",
        period: "30_DAYS",
        calculatedDate: new Date().toISOString(),
        baselineValue: 95,
        targetValue: 95,
        trend,
        notes: `ATA ${system.code} - ${nur} unscheduled removals / ${nks} components / ${h.toFixed(0)}h (iur: ${iur.toFixed(3)})`
      });
    }
  });

  return metrics;
}

// Helper functions
function getPeriodStart(period: string, now: Date): Date {
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

function determineTrend(current: number, baseline: number | null): "IMPROVING" | "STABLE" | "DEGRADING" {
  if (!baseline) return "STABLE";
  
  const changePercent = ((current - baseline) / baseline) * 100;
  
  if (changePercent > 5) return "IMPROVING";
  if (changePercent < -5) return "DEGRADING";
  return "STABLE";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Historical data functions (these would typically come from a database)
function getHistoricalMTBF(aircraftId: string): number | null {
  // This would query historical MTBF data
  return null;
}

function getHistoricalMTTR(): number | null {
  // This would query historical MTTR data
  return null;
}

function getHistoricalFailureRate(aircraftId: string): number | null {
  // This would query historical failure rate data
  return null;
}

function getHistoricalDispatchReliability(aircraftId: string): number | null {
  // This would query historical dispatch reliability data
  return null;
}

function getHistoricalPIREPFrequency(aircraftId: string): number | null {
  // This would query historical PIREP frequency data
  return null;
}

function getHistoricalComponentReliability(aircraftId: string, component: string): number | null {
  // This would query historical component reliability data
  return null;
}

// Industry Standards Calculations (from calculations API)
function calculateDispatchReliabilityIndustryStandard(aircraft: Aircraft, pireps: PIREP[], snags: Snag[], periodStart: Date): ReliabilityMetric | null {
  const cache = readCache();
  
  // Use actual flight data for cycle calculation
  const totalCycles = estimateTotalCycles([aircraft], cache, "30_DAYS");
  
  // Use actual flight data for delay and cancellation counts
  const technicalDelays = countTechnicalDelays(pireps, snags, cache, "30_DAYS");
  const technicalCancellations = countTechnicalCancellations(pireps, snags, cache, "30_DAYS");
  
  // Formula 3: Rd = 1 - (nd + nc) / n
  const despatchReliability = 1 - (technicalDelays + technicalCancellations) / totalCycles;
  const despatchReliabilityRate = despatchReliability * 100;
  
  const trend = determineTrend(despatchReliabilityRate, getHistoricalDispatchReliability(aircraft.id));
  
  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "DISPATCH_RELIABILITY",
    value: despatchReliabilityRate,
    unit: "%",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalDispatchReliability(aircraft.id),
    targetValue: 95, // Target 95% dispatch reliability
    trend,
    notes: `Industry Standard Formula: Rd = 1 - (${technicalDelays} + ${technicalCancellations}) / ${totalCycles}`
  };
}

function calculatePilotReportReliabilityIndustryStandard(aircraft: Aircraft, pireps: PIREP[], periodStart: Date): ReliabilityMetric | null {
  const cache = readCache();
  
  const totalPireps = pireps.length;
  const totalTakeoffs = estimateTotalCycles([aircraft], cache, "30_DAYS");
  
  // Formula 5: ip = np / nto × 100
  const pirepRatePer100Takeoffs = (totalPireps / totalTakeoffs) * 100;
  
  const trend = determineTrend(pirepRatePer100Takeoffs, getHistoricalPIREPFrequency(aircraft.id));
  
  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "PIREP_FREQUENCY",
    value: pirepRatePer100Takeoffs,
    unit: "PIREPs/100 takeoffs",
    period: "30_DAYS",
    calculatedDate: new Date().toISOString(),
    baselineValue: getHistoricalPIREPFrequency(aircraft.id),
    targetValue: 2, // Target 2 PIREPs per 100 takeoffs
    trend,
    notes: `Industry Standard Formula: ip = ${totalPireps} / ${totalTakeoffs} × 100`
  };
}

function calculateAircraftAvailabilityIndustryStandard(aircraft: Aircraft, snags: Snag[], periodStart: Date, period: string): ReliabilityMetric | null {
  const cache = readCache();
  
  // Use the period parameter directly
  const periodHours = getPeriodHours(period);
  
  // Formula 1: huk = hm × iuk
  const hm = periodHours; // Hours in the selected period
  const iuk = 1; // Single aircraft
  const huk = hm * iuk; // Total possible capacity in hours
  
  // Use actual maintenance records for downtime calculation
  const hs = estimateMaintenanceDowntime(snags, [aircraft], period, cache);
  
  // Formula 2: ia = (huk - hs) / huk × 100
  const availableHours = huk - hs;
  const availabilityPercentage = (availableHours / huk) * 100;
  
  const trend = determineTrend(availabilityPercentage, 95); // Assume 95% baseline
  
  return {
    id: generateId(),
    aircraftId: aircraft.id,
    metricType: "AIRCRAFT_AVAILABILITY",
    value: availabilityPercentage,
    unit: "%",
    period: period,
    calculatedDate: new Date().toISOString(),
    baselineValue: 95,
    targetValue: 95, // Target 95% availability
    trend,
    notes: `Industry Standard Formula: ia = (${huk} - ${hs}) / ${huk} × 100`
  };
}

// Helper functions from Industry Standards

function getPeriodHours(period: string): number {
  switch (period) {
    case "7_DAYS": return 7 * 24; // 168 hours
    case "30_DAYS": return 30 * 24; // 720 hours
    case "90_DAYS": return 90 * 24; // 2160 hours
    case "ANNUAL": return 365 * 24; // 8760 hours
    case "365_DAYS": return 365 * 24; // 8760 hours
    default: return 30 * 24; // Default to 30 days
  }
}

function estimateTotalCycles(aircraft: Aircraft[], cache: any, period: string): number {
  // Use aircraft.currentCyc as the total cycles - this is the correct approach
  // since we only track problem flights in our system, not all flights
  return aircraft.reduce((sum, a) => sum + a.currentCyc, 0);
}

function countTechnicalDelays(pireps: PIREP[], snags: Snag[], cache: any, period: string): number {
  const flights = cache.flights || [];
  const periodStart = getPeriodStart(period, new Date());
  
  const periodFlights = flights.filter((f: any) => 
    new Date(f.scheduledDeparture) >= periodStart
  );
  
  // Count actual technical delays from flight data
  const technicalDelays = periodFlights.filter((f: any) => 
    f.status === "DELAYED" &&
    f.delayReason && 
    (f.delayReason.includes("ENGINE") || 
     f.delayReason.includes("AVIONICS") || 
     f.delayReason.includes("LANDING_GEAR") || 
     f.delayReason.includes("ELECTRICAL") || 
     f.delayReason.includes("HYDRAULIC") || 
     f.delayReason.includes("FUEL") || 
     f.delayReason.includes("AIR_CONDITIONING") || 
     f.delayReason.includes("OTHER_TECHNICAL")) &&
    f.delayMinutes && 
    f.delayMinutes > 15
  );
  
  return technicalDelays.length;
}

function countTechnicalCancellations(pireps: PIREP[], snags: Snag[], cache: any, period: string): number {
  const flights = cache.flights || [];
  const periodStart = getPeriodStart(period, new Date());
  
  const periodFlights = flights.filter((f: any) => 
    new Date(f.scheduledDeparture) >= periodStart
  );
  
  // Count actual technical cancellations from flight data
  const technicalCancellations = periodFlights.filter((f: any) => 
    f.status === "CANCELLED" && 
    f.cancellationReason && 
    (f.cancellationReason.toLowerCase().includes("engine") ||
     f.cancellationReason.toLowerCase().includes("avionics") ||
     f.cancellationReason.toLowerCase().includes("landing") ||
     f.cancellationReason.toLowerCase().includes("electrical") ||
     f.cancellationReason.toLowerCase().includes("hydraulic") ||
     f.cancellationReason.toLowerCase().includes("fuel") ||
     f.cancellationReason.toLowerCase().includes("technical"))
  );
  
  return technicalCancellations.length;
}

function estimateMaintenanceDowntime(snags: Snag[], aircraft: Aircraft[], period: string, cache: any): number {
  const maintenanceRecords = cache.maintenance || [];
  const periodStart = getPeriodStart(period, new Date());
  
  const periodMaintenance = maintenanceRecords.filter((m: any) => 
    new Date(m.startDate) >= periodStart &&
    m.status === "COMPLETED"
  );
  
  const actualDowntime = periodMaintenance.reduce((sum: number, m: any) => 
    sum + (m.downtimeHours || 0), 0
  );
  
  if (actualDowntime === 0) {
    const criticalSnags = snags.filter(s => s.severity === "Critical");
    const majorSnags = snags.filter(s => s.severity === "Major");
    
    return (criticalSnags.length * 24) + (majorSnags.length * 8);
  }
  
  return actualDowntime;
}
