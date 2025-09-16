import { Aircraft, MaintenanceTask, MaintenanceCheck, Snag, Assembly, ComplianceRecord, Component } from "./types";
import fs from "fs";
import path from "path";

// Data service: replace internals of these functions to connect to your real source
// e.g., database queries, REST calls, or file parsers.

// Temporary in-memory seed for 5H-AAF (until real data source is connected)
const seedDate = new Date().toISOString().slice(0,10);
const seededAircraft: Aircraft[] = [
  {
    id: "ac-AAF",
    registration: "5H-AAF",
    type: "C208B",
    msn: "TBD",
    status: "In Service",
    base: "TBD",
    deliveryDate: undefined,
    inServiceDate: undefined,
    currentHrs: 6200,
    currentCyc: 5400,
    currentDate: seedDate,
    avgDailyHrs: 7,
    avgDailyCyc: 6,
  }
];

const seededChecks: MaintenanceCheck[] = [
  { id: "check-C208B-100hr", aircraftType: "C208B", title: "100 Hour Check", intervalHrs: 100, lastDoneHrs: 6120, lastDoneDate: seedDate, reference: "AMP-C208B-CH5-100H" },
  { id: "check-C208B-5-15-01", aircraftType: "C208B", title: "5-15-01 12M", intervalDays: 365, lastDoneDate: seedDate, reference: "5-15-01" },
];

const seededTasks: MaintenanceTask[] = [
  { id: "task-C208-A.1", aircraftType: "C208B", title: "A.1 Flap Bell Crank NDI", type: "Inspection", intervalCyc: 500, lastDoneCyc: 5000, lastDoneDate: seedDate, reference: "A.1" },
];

const seededAssemblies: Assembly[] = [];
const seededSnags: Snag[] = [];
const seededCompliance: ComplianceRecord[] = [];
const seededComponents: Component[] = [];

let cacheLoaded = false;
let cacheAircraft: Aircraft[] = [];
let cacheTasks: MaintenanceTask[] = [];
let cacheChecks: MaintenanceCheck[] = [];
let cacheComponents: Component[] = [];

async function loadCacheIfAvailable() {
  if (cacheLoaded) return;
  try {
    const cachePath = path.join(process.cwd(), "public", "aaf-cache.json");
    if (fs.existsSync(cachePath)) {
      const raw = fs.readFileSync(cachePath, "utf8");
      const data = JSON.parse(raw);
      cacheAircraft = (data.aircraft || []) as Aircraft[];
      cacheTasks = (data.tasks || []) as MaintenanceTask[];
      cacheChecks = (data.checks || []) as MaintenanceCheck[];
      cacheComponents = (data.components || []) as Component[];
    }
  } catch {
    // ignore
  }
  cacheLoaded = true;
}

export async function getAircraftList(): Promise<Aircraft[]> {
  await loadCacheIfAvailable();
  return cacheAircraft.length ? cacheAircraft : seededAircraft;
}

export async function getAircraftById(id: string): Promise<Aircraft | undefined> {
  const list = await getAircraftList();
  return list.find(a => a.id === id);
}

export async function getTasksForAircraft(ac: Aircraft): Promise<MaintenanceTask[]> {
  await loadCacheIfAvailable();
  const src = cacheTasks.length ? cacheTasks : seededTasks;
  return src.filter(t => t.aircraftType === ac.type || t.tailSpecificId === ac.id);
}

export async function getChecksForAircraft(ac: Aircraft): Promise<MaintenanceCheck[]> {
  await loadCacheIfAvailable();
  const src = cacheChecks.length ? cacheChecks : seededChecks;
  return src.filter(c => c.aircraftType === ac.type || c.tailSpecificId === ac.id);
}

export async function getSnagsForAircraft(ac: Aircraft): Promise<Snag[]> {
  return seededSnags.filter(s => s.aircraftId === ac.id);
}

export async function getAssembliesForAircraft(ac: Aircraft): Promise<Assembly[]> {
  return seededAssemblies.filter(a => a.aircraftId === ac.id);
}

export async function getComplianceForAircraft(ac: Aircraft): Promise<ComplianceRecord[]> {
  return seededCompliance.filter(r => r.aircraftId === ac.id);
}

// Global catalogs (if you need lists independent of a specific aircraft)
export async function getAllTasks(): Promise<MaintenanceTask[]> {
  await loadCacheIfAvailable();
  return cacheTasks.length ? cacheTasks : seededTasks;
}

export async function getAllChecks(): Promise<MaintenanceCheck[]> {
  await loadCacheIfAvailable();
  return cacheChecks.length ? cacheChecks : seededChecks;
}

export async function getAllComponents(): Promise<Component[]> {
  await loadCacheIfAvailable();
  return cacheComponents.length ? cacheComponents : seededComponents;
}


