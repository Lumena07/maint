import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { Alert, AlertType, AlertSeverity, AlertStatus, PIREP, Snag, Aircraft, ReliabilityMetric } from "@/lib/types";

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [], pireps: [], alerts: [] };
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

// Performance thresholds based on industry standards
const PERFORMANCE_THRESHOLDS = {
  MTBF: {
    target: 1000, // hours
    warning: 800,
    critical: 500
  },
  MTTR: {
    target: 24, // hours
    warning: 48,
    critical: 72
  },
  FAILURE_RATE: {
    target: 5, // failures per 1000 hours
    warning: 10,
    critical: 20
  },
  DISPATCH_RELIABILITY: {
    target: 95, // percentage
    warning: 90,
    critical: 85
  },
  PIREP_FREQUENCY: {
    target: 2, // PIREPs per 100 hours
    warning: 5,
    critical: 10
  },
  COMPONENT_RELIABILITY: {
    target: 90, // percentage
    warning: 80,
    critical: 70
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get("aircraftId");
    const status = searchParams.get("status");

    const cache = readCache();
    let alerts: Alert[] = cache.alerts || [];

    // Filter alerts
    if (aircraftId) {
      alerts = alerts.filter((a: Alert) => a.aircraftId === aircraftId);
    }
    if (status) {
      alerts = alerts.filter((a: Alert) => a.status === status);
    }

    // Sort by creation date (newest first)
    alerts.sort((a: Alert, b: Alert) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error retrieving alerts:", error);
    return NextResponse.json({ error: "Failed to retrieve alerts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      aircraftId,
      alertType,
      severity,
      title,
      message,
      threshold,
      actualValue,
      relatedPirepId,
      relatedSnagId,
      assignedTo
    } = body;

    // Validate required fields
    if (!aircraftId || !alertType || !severity || !title || !message) {
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

    const newAlert: Alert = {
      id: generateId(),
      aircraftId,
      alertType,
      severity,
      status: "OPEN",
      title,
      message,
      threshold,
      actualValue,
      relatedPirepId,
      relatedSnagId,
      assignedTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!cache.alerts) {
      cache.alerts = [];
    }

    cache.alerts.push(newAlert);
    writeCache(cache);

    return NextResponse.json(newAlert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Function to generate alerts based on performance metrics
export async function generatePerformanceAlerts(metrics: ReliabilityMetric[]): Promise<Alert[]> {
  const cache = readCache();
  const generatedAlerts: Alert[] = [];

  for (const metric of metrics) {
    const thresholds = PERFORMANCE_THRESHOLDS[metric.metricType];
    if (!thresholds) continue;

    let severity: AlertSeverity | null = null;
    let alertType: AlertType | null = null;

    // Determine severity based on thresholds
    if (metric.value <= thresholds.critical || metric.value >= thresholds.critical) {
      severity = "CRITICAL";
    } else if (metric.value <= thresholds.warning || metric.value >= thresholds.warning) {
      severity = "HIGH";
    } else if (metric.value <= thresholds.target || metric.value >= thresholds.target) {
      severity = "MEDIUM";
    }

    // Skip if no alert needed
    if (!severity) continue;

    // Determine alert type
    switch (metric.metricType) {
      case "MTBF":
        alertType = metric.value < thresholds.target ? "PERFORMANCE_DEVIATION" : "THRESHOLD_EXCEEDED";
        break;
      case "MTTR":
        alertType = metric.value > thresholds.target ? "PERFORMANCE_DEVIATION" : "THRESHOLD_EXCEEDED";
        break;
      case "FAILURE_RATE":
        alertType = metric.value > thresholds.target ? "PERFORMANCE_DEVIATION" : "THRESHOLD_EXCEEDED";
        break;
      case "DISPATCH_RELIABILITY":
        alertType = metric.value < thresholds.target ? "PERFORMANCE_DEVIATION" : "THRESHOLD_EXCEEDED";
        break;
      case "PIREP_FREQUENCY":
        alertType = metric.value > thresholds.target ? "PERFORMANCE_DEVIATION" : "THRESHOLD_EXCEEDED";
        break;
      case "COMPONENT_RELIABILITY":
        alertType = metric.value < thresholds.target ? "PERFORMANCE_DEVIATION" : "THRESHOLD_EXCEEDED";
        break;
    }

    if (!alertType) continue;

    // Check if similar alert already exists
    const existingAlert = cache.alerts?.find((a: Alert) => 
      a.aircraftId === metric.aircraftId &&
      a.alertType === alertType &&
      a.status === "OPEN" &&
      new Date(a.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
    );

    if (existingAlert) continue; // Skip if recent similar alert exists

    const alert: Alert = {
      id: generateId(),
      aircraftId: metric.aircraftId,
      alertType,
      severity,
      status: "OPEN",
      title: `${metric.metricType} Performance Alert`,
      message: `${metric.metricType} value of ${metric.value.toFixed(2)} ${metric.unit} ${severity === "CRITICAL" ? "exceeds critical threshold" : "requires attention"}. Target: ${thresholds.target} ${metric.unit}`,
      threshold: thresholds.target,
      actualValue: metric.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    generatedAlerts.push(alert);
  }

  return generatedAlerts;
}

// Function to check for recurring PIREP patterns
export async function checkRecurringPIREPAlerts(): Promise<Alert[]> {
  const cache = readCache();
  const pireps: PIREP[] = cache.pireps || [];
  const generatedAlerts: Alert[] = [];

  // Group PIREPs by aircraft, category, and system
  const groupedPireps: { [key: string]: PIREP[] } = {};
  
  pireps.forEach(pirep => {
    const key = `${pirep.aircraftId}_${pirep.category}_${pirep.systemAffected}`;
    if (!groupedPireps[key]) {
      groupedPireps[key] = [];
    }
    groupedPireps[key].push(pirep);
  });

  // Check for recurring patterns
  Object.entries(groupedPireps).forEach(([key, groupPireps]) => {
    if (groupPireps.length >= 3) {
      const [aircraftId, category, system] = key.split('_');
      const recentPireps = groupPireps.filter(p => 
        new Date(p.reportDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      );

      if (recentPireps.length >= 3) {
        // Check if similar alert already exists
        const existingAlert = cache.alerts?.find((a: Alert) => 
          a.aircraftId === aircraftId &&
          a.alertType === "RECURRING_PIREP" &&
          a.status === "OPEN" &&
          a.message.includes(system)
        );

        if (!existingAlert) {
          const alert: Alert = {
            id: generateId(),
            aircraftId,
            alertType: "RECURRING_PIREP",
            severity: "HIGH",
            status: "OPEN",
            title: `Recurring ${category} Issues`,
            message: `Recurring ${category} issues detected in ${system} system. ${recentPireps.length} similar PIREPs reported in the last 30 days.`,
            relatedPirepId: recentPireps[0].id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          generatedAlerts.push(alert);
        }
      }
    }
  });

  return generatedAlerts;
}

// Function to check compliance issues
export async function checkComplianceAlerts(): Promise<Alert[]> {
  const cache = readCache();
  const aircraft: Aircraft[] = cache.aircraft || [];
  const generatedAlerts: Alert[] = [];

  aircraft.forEach(ac => {
    // Check for overdue maintenance
    if (ac.currentHrs > (ac.EngineTBO || 6000) * 0.95) {
      const existingAlert = cache.alerts?.find((a: Alert) => 
        a.aircraftId === ac.id &&
        a.alertType === "MAINTENANCE_OVERDUE" &&
        a.status === "OPEN"
      );

      if (!existingAlert) {
        const alert: Alert = {
          id: generateId(),
          aircraftId: ac.id,
          alertType: "MAINTENANCE_OVERDUE",
          severity: "HIGH",
          status: "OPEN",
          title: `Maintenance Overdue - ${ac.registration}`,
          message: `Aircraft ${ac.registration} is approaching TBO limits. Current hours: ${ac.currentHrs}, TBO: ${ac.EngineTBO || 6000}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        generatedAlerts.push(alert);
      }
    }
  });

  return generatedAlerts;
}

