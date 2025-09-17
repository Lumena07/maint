import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Aircraft, MaintenanceTask, Component } from "@/lib/types";

const CACHE_PATH = path.join(process.cwd(), "public", "aaf-cache.json");

// Function to calculate projected days for a single item
const calculateItemProjectedDays = (item: MaintenanceTask | Component, aircraft: Aircraft): number => {
  if (!item.dueUnits || item.dueUnits.length === 0) return 0;
  
  // Check if initial or repeat intervals should be used
  const hasLastDone = 'lastDoneDate' in item ? item.lastDoneDate : ('installedDate' in item ? item.installedDate : null);
  const hasRepeatInterval = item.repeatIntervalHrs || item.repeatIntervalCyc || item.repeatIntervalDays;
  const useRepeat = !!hasLastDone && !!hasRepeatInterval;
  
  const projectedDaysList: number[] = [];
  
  // Calculate projected days for each due unit
  item.dueUnits.forEach(unit => {
    let projectedDays = 0;
    
    if (unit === "HOURS") {
      const interval = useRepeat ? item.repeatIntervalHrs : item.initialIntervalHrs;
      const lastDone = 'lastDoneHrs' in item ? item.lastDoneHrs : ('installedAtAcHrs' in item ? item.installedAtAcHrs : undefined);
      
      if (interval && lastDone !== undefined) {
        const nextHrs = lastDone + interval;
        const remainingHrs = nextHrs - aircraft.currentHrs;
        projectedDays = remainingHrs / aircraft.avgDailyHrs;
      } else if (interval) {
        const remainingHrs = interval - aircraft.currentHrs;
        projectedDays = remainingHrs / aircraft.avgDailyHrs;
      }
    } else if (unit === "CYCLES") {
      const interval = useRepeat ? item.repeatIntervalCyc : item.initialIntervalCyc;
      const lastDone = 'lastDoneCyc' in item ? item.lastDoneCyc : ('installedAtAcCyc' in item ? item.installedAtAcCyc : undefined);
      
      if (interval && lastDone !== undefined) {
        const nextCyc = lastDone + interval;
        const remainingCyc = nextCyc - aircraft.currentCyc;
        projectedDays = remainingCyc / aircraft.avgDailyCyc;
      } else if (interval) {
        const remainingCyc = interval - aircraft.currentCyc;
        projectedDays = remainingCyc / aircraft.avgDailyCyc;
      }
    } else if (unit === "DAYS") {
      const interval = useRepeat ? item.repeatIntervalDays : item.initialIntervalDays;
      const lastDoneDate = 'lastDoneDate' in item ? item.lastDoneDate : ('installedDate' in item ? item.installedDate : null);
      
      if (interval && lastDoneDate) {
        const lastDate = new Date(lastDoneDate);
        const nextDate = new Date(lastDate.getTime() + (interval * 24 * 60 * 60 * 1000));
        const currentDate = new Date(aircraft.currentDate);
        const diffTime = nextDate.getTime() - currentDate.getTime();
        projectedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (interval) {
        const currentDate = new Date(aircraft.currentDate);
        const nextDate = new Date(currentDate.getTime() + (interval * 24 * 60 * 60 * 1000));
        const diffTime = nextDate.getTime() - currentDate.getTime();
        projectedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    
    if (projectedDays > 0) {
      projectedDaysList.push(projectedDays);
    }
  });
  
  // Use the smallest projected days
  return projectedDaysList.length > 0 ? Math.min(...projectedDaysList) : 0;
};

// POST endpoint to calculate and save projected days
export async function POST(request: NextRequest) {
  try {
    const { aircraftId } = await request.json();
    
    if (!aircraftId) {
      return NextResponse.json({ error: "Aircraft ID required" }, { status: 400 });
    }
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Find the aircraft
    const aircraft = data.aircraft?.find((a: Aircraft) => a.id === aircraftId);
    if (!aircraft) {
      return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });
    }
    
    // Get all tasks and components for this aircraft
    const tasks = data.tasks?.filter((t: MaintenanceTask) => t.aircraftType === aircraft.type || t.tailSpecificId === aircraft.id) || [];
    const components = data.components?.filter((c: Component) => c.aircraftId === aircraft.id) || [];
    
    // Calculate projected days for tasks
    const updatedTasks = tasks.map((task: MaintenanceTask) => ({
      ...task,
      projectedDays: calculateItemProjectedDays(task, aircraft)
    }));
    
    // Calculate projected days for components
    const updatedComponents = components.map((component: Component) => ({
      ...component,
      projectedDays: calculateItemProjectedDays(component, aircraft)
    }));
    
    // Update the data with new projected days
    data.tasks = data.tasks?.map((task: MaintenanceTask) => {
      const updated = updatedTasks.find((t: MaintenanceTask) => t.id === task.id);
      return updated || task;
    }) || [];
    
    data.components = data.components?.map((component: Component) => {
      const updated = updatedComponents.find((c: Component) => c.id === component.id);
      return updated || component;
    }) || [];
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ 
      success: true, 
      updatedTasks: updatedTasks.length,
      updatedComponents: updatedComponents.length 
    });
  } catch (error) {
    console.error("Error calculating projected days:", error);
    return NextResponse.json({ error: "Failed to calculate projected days" }, { status: 500 });
  }
}
