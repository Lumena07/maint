import { Aircraft, MaintenanceTask, Snag, Assembly, ComplianceRecord, Component } from "./types";
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



const seededTasks: MaintenanceTask[] = [
  { id: "task-C208-A.1", aircraftType: "C208B", title: "A.1 Flap Bell Crank NDI", type: "Inspection", intervalCyc: 500, lastDoneCyc: 5000, lastDoneDate: seedDate, reference: "A.1" },
];

const seededAssemblies: Assembly[] = [];
const seededSnags: Snag[] = [];
const seededCompliance: ComplianceRecord[] = [];
const seededComponents: Component[] = [];

// Cache variables
let cacheLoaded = false;
let cacheAircraft: Aircraft[] = [];
let cacheTasks: MaintenanceTask[] = [];
let cacheComponents: Component[] = [];
let lastCacheLoad = 0;

async function loadCacheIfAvailable() {
  try {
    const cachePath = path.join(process.cwd(), "public", "aaf-cache.json");
    
    if (fs.existsSync(cachePath)) {
      const stats = fs.statSync(cachePath);
      const now = Date.now();
      
      // Force reload if it's been more than 1 second since last load
      if (now - lastCacheLoad > 1000) {
        const raw = fs.readFileSync(cachePath, "utf8");
        const data = JSON.parse(raw);
        
        // Force clear any existing cache
        cacheAircraft = [];
        cacheTasks = [];
        cacheComponents = [];
        
        cacheAircraft = data.aircraft || [];
        cacheTasks = data.tasks || [];
        cacheComponents = data.components || [];
        
        lastCacheLoad = now;
        
        const timestamp = new Date().toLocaleTimeString();
        const fileTime = stats.mtime.toLocaleTimeString();
        console.log(`✅ Cache reloaded at ${timestamp} (file modified: ${fileTime}): ${cacheAircraft.length} aircraft`);
        if (cacheAircraft.length > 0) {
          console.log("Current aircraft data:", cacheAircraft[0]);
          console.log("Raw currentCyc value:", cacheAircraft[0].currentCyc);
        }
      }
    } else {
      console.warn("❌ Cache file not found at:", cachePath);
    }
  } catch (e) {
    console.error("❌ Failed to load cache:", e);
  }
}

export async function getAircraftList(): Promise<Aircraft[]> {
  await loadCacheIfAvailable();
  const result = cacheAircraft.length > 0 ? cacheAircraft : seededAircraft;
  console.log("Returning aircraft data:", result[0]);
  return result;
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



export async function getSnagsForAircraft(ac: Aircraft): Promise<Snag[]> {
  return seededSnags.filter(s => s.aircraftId === ac.id);
}

export async function getAssembliesForAircraft(ac: Aircraft): Promise<Assembly[]> {
  return seededAssemblies.filter(a => a.aircraftId === ac.id);
}

export async function getComponentsForAircraft(ac: Aircraft): Promise<Component[]> {
  await loadCacheIfAvailable();
  const src = cacheComponents.length ? cacheComponents : seededComponents;
  return src.filter(c => c.aircraftId === ac.id);
}

export async function getComplianceForAircraft(ac: Aircraft): Promise<ComplianceRecord[]> {
  return seededCompliance.filter(r => r.aircraftId === ac.id);
}

// Global catalogs (if you need lists independent of a specific aircraft)
export async function getAllTasks(): Promise<MaintenanceTask[]> {
  await loadCacheIfAvailable();
  return cacheTasks.length ? cacheTasks : seededTasks;
}



export async function getAllComponents(): Promise<Component[]> {
  await loadCacheIfAvailable();
  return cacheComponents.length ? cacheComponents : seededComponents;
}


