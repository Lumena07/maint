import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Aircraft } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { aircraftId, updates } = await request.json();
    
    // Read the current cache file
    const cachePath = path.join(process.cwd(), "public", "aaf-cache.json");
    
    if (!fs.existsSync(cachePath)) {
      return NextResponse.json({ error: "Cache file not found" }, { status: 404 });
    }
    
    const rawData = fs.readFileSync(cachePath, "utf8");
    const cacheData = JSON.parse(rawData);
    
    // Find and update the aircraft
    const aircraftIndex = cacheData.aircraft.findIndex((ac: Aircraft) => ac.id === aircraftId);
    
    if (aircraftIndex === -1) {
      return NextResponse.json({ error: "Aircraft not found" }, { status: 404 });
    }
    
    // Update the aircraft with new data
    cacheData.aircraft[aircraftIndex] = {
      ...cacheData.aircraft[aircraftIndex],
      ...updates
    };
    
    // Write the updated data back to the cache file
    fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    
    return NextResponse.json(cacheData.aircraft[aircraftIndex]);
  } catch (error) {
    console.error("Error updating cache:", error);
    return NextResponse.json({ error: "Failed to update cache" }, { status: 500 });
  }
}
