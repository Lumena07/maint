import { NextRequest, NextResponse } from "next/server";
import { PIREP, PIREPCategory, PIREPSeverity, PIREPStatus } from "@/lib/types";
import fs from "fs";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "public", "aaf-cache.json");

// Helper functions
const generateId = () => `pirep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generatePirepNumber = () => `PIREP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

const readCache = () => {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return { pireps: [] };
  }
};

const writeCache = (data: any) => {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
};

// Auto-generate snag from critical PIREP
const shouldGenerateSnag = (severity: PIREPSeverity, category: PIREPCategory): boolean => {
  // Critical PIREPs always generate snags
  if (severity === "CRITICAL") return true;
  
  // Major PIREPs in critical systems generate snags
  if (severity === "MAJOR" && ["ENGINE", "STRUCTURAL", "LANDING_GEAR", "HYDRAULIC"].includes(category)) {
    return true;
  }
  
  return false;
};

const generateSnagFromPirep = async (pirep: PIREP) => {
  try {
    console.log("🔧 Generating snag from PIREP:", pirep.pirepNumber);
    
    const snagData = {
      snagId: `SNG-${pirep.pirepNumber}`,
      dateReported: pirep.reportDate,
      aircraftId: pirep.aircraftId,
      description: `Auto-generated from PIREP ${pirep.pirepNumber}: ${pirep.description}`,
      status: "Open",
      severity: pirep.severity === "CRITICAL" ? "Critical" : "Major",
      partsOrdered: false,
      action: "Investigation required - generated from PIREP",
      notes: `Original PIREP: ${pirep.title}`,
      reportedBy: `System (from PIREP by ${pirep.reportedBy})`,
      assignedTo: "",
      estimatedResolutionDate: ""
    };

    console.log("🔧 Snag data to create:", snagData);

    // Call the snag API endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/snags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snagData),
    });

    console.log("🔧 Snag API response status:", response.status);

    if (response.ok) {
      const newSnag = await response.json();
      console.log("✅ Snag created successfully:", newSnag.id);
      return newSnag.id;
    } else {
      const errorData = await response.json();
      console.error("❌ Failed to auto-generate snag:", errorData);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error generating snag from PIREP:', error);
    return null;
  }
};

// Check for recurring PIREP patterns
const checkRecurringPatterns = (pirep: PIREP, allPireps: PIREP[]) => {
  const recentPireps = allPireps.filter(p => 
    p.aircraftId === pirep.aircraftId && 
    p.systemAffected === pirep.systemAffected &&
    p.category === pirep.category &&
    new Date(p.reportDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
  );

  // If 3 or more similar PIREPs in 30 days, flag for investigation
  if (recentPireps.length >= 3) {
    return {
      isRecurring: true,
      count: recentPireps.length,
      message: `Recurring issue detected: ${recentPireps.length} similar reports in 30 days`
    };
  }

  return { isRecurring: false };
};

// GET /api/pireps
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get("aircraftId");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const severity = searchParams.get("severity");

    const cache = readCache();
    let pireps = cache.pireps || [];

    // Filter PIREPs based on query parameters
    if (aircraftId) {
      pireps = pireps.filter((p: PIREP) => p.aircraftId === aircraftId);
    }
    if (status) {
      pireps = pireps.filter((p: PIREP) => p.status === status);
    }
    if (category) {
      pireps = pireps.filter((p: PIREP) => p.category === category);
    }
    if (severity) {
      pireps = pireps.filter((p: PIREP) => p.severity === severity);
    }

    // Sort by report date (newest first)
    pireps.sort((a: PIREP, b: PIREP) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    return NextResponse.json(pireps);
  } catch (error) {
    console.error('Error retrieving PIREPs:', error);
    return NextResponse.json({ error: 'Failed to retrieve PIREPs' }, { status: 500 });
  }
}

// POST /api/pireps
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      aircraftId,
      flightId,
      reportedBy,
      reportDate,
      category,
      severity,
      title,
      description,
      systemAffected,
      flightPhase,
      weatherConditions,
      altitude,
      airspeed,
      actionTaken,
      followUpRequired,
      followUpNotes,
      // Engine-specific fields
      engineNumber,
      engineEventType,
      oilTemperature,
      oilPressure,
      vibrationLevel,
      egtTemperature,
      n1RPM,
      n2RPM
    } = body;

    // Validate required fields
    const requiredFields = ['aircraftId', 'reportedBy', 'reportDate', 'category', 'severity', 'title', 'description', 'systemAffected'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const cache = readCache();
    
    // Verify aircraft exists
    const aircraft = cache.aircraft?.find((a: any) => a.id === aircraftId);
    if (!aircraft) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    const newPirep: PIREP = {
      id: generateId(),
      pirepNumber: generatePirepNumber(),
      aircraftId,
      flightId,
      reportedBy,
      reportDate,
      category: category as PIREPCategory,
      severity: severity as PIREPSeverity,
      status: "SUBMITTED" as PIREPStatus,
      title,
      description,
      systemAffected,
      flightPhase,
      weatherConditions,
      altitude,
      airspeed,
      actionTaken,
      followUpRequired: followUpRequired || false,
      followUpNotes,
      snagGenerated: false,
      // Engine-specific fields
      engineNumber,
      engineEventType,
      oilTemperature,
      oilPressure,
      vibrationLevel,
      egtTemperature,
      n1RPM,
      n2RPM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Check if this PIREP should generate a snag
    console.log("🔍 Checking if PIREP should generate snag:", {
      severity: newPirep.severity,
      category: newPirep.category,
      shouldGenerate: shouldGenerateSnag(newPirep.severity, newPirep.category)
    });
    
    if (shouldGenerateSnag(newPirep.severity, newPirep.category)) {
      console.log("✅ PIREP qualifies for snag generation, calling generateSnagFromPirep...");
      const snagId = await generateSnagFromPirep(newPirep);
      if (snagId) {
        newPirep.snagGenerated = true;
        newPirep.generatedSnagId = snagId;
        console.log("✅ Snag generation completed for PIREP:", newPirep.pirepNumber);
      } else {
        console.log("❌ Snag generation failed for PIREP:", newPirep.pirepNumber);
      }
    } else {
      console.log("ℹ️ PIREP does not qualify for snag generation");
    }

    // Check for recurring patterns
    const patternCheck = checkRecurringPatterns(newPirep, cache.pireps || []);
    if (patternCheck.isRecurring) {
      // TODO: Generate alert for recurring pattern
      console.log(`Recurring pattern detected: ${patternCheck.message}`);
    }

    // Re-read cache to include any snags that were created
    const updatedCache = readCache();
    
    if (!updatedCache.pireps) {
      updatedCache.pireps = [];
    }

    updatedCache.pireps.push(newPirep);
    writeCache(updatedCache);

    return NextResponse.json(newPirep, { status: 201 });

  } catch (error) {
    console.error('Error creating PIREP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
