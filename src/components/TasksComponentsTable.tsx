"use client";
import { Aircraft, MaintenanceTask, Component } from "@/lib/types";

type TasksComponentsTableProps = {
  aircraft: Aircraft;
  tasks: MaintenanceTask[];
  components: Component[];
};

type TableRow = {
  id: string;
  type: "Task" | "Component";
  title: string;
  category?: string;
  pn?: string;
  sn?: string;
  unit: string;
  lastDone: string;
  installedAt: string;
  initialInterval: string;
  repeatInterval: string;
  current: string;
  nextInspection: string;
  status: "OK" | "DUE_SOON" | "DUE" | "OVERDUE";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "OK": return "text-green-600 bg-green-50";
    case "DUE_SOON": return "text-yellow-600 bg-yellow-50";
    case "DUE": return "text-orange-600 bg-orange-50";
    case "OVERDUE": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const formatUnit = (item: MaintenanceTask | Component): string => {
  const units = item.dueUnits || [];
  return units.length > 0 ? units.join("/") : "N/A";
};

const formatLastDone = (item: MaintenanceTask | Component): string => {
  // Check if it's a MaintenanceTask (has lastDoneDate)
  if ('lastDoneDate' in item && item.lastDoneDate) {
    return item.lastDoneDate;
  }
  
  // For components, use installedDate as lastDoneDate (no hrs/cyc)
  if ('installedDate' in item && item.installedDate) {
    return item.installedDate;
  }
  
  return "N/A";
};

const formatInstalledAt = (item: MaintenanceTask | Component): string => {
  const parts: string[] = [];
  
  // For components, use installedAtAcHrs/installedAtAcCyc
  if ('installedAtAcHrs' in item || 'installedAtAcCyc' in item) {
    if (item.installedAtAcHrs !== undefined) parts.push(`${item.installedAtAcHrs.toFixed(1)}h`);
    if (item.installedAtAcCyc !== undefined) parts.push(`${item.installedAtAcCyc}c`);
  }
  
  // For tasks, use lastDoneHrs/lastDoneCyc if available
  if ('lastDoneHrs' in item || 'lastDoneCyc' in item) {
   
    
    if (item.lastDoneHrs !== undefined) parts.push(`${item.lastDoneHrs.toFixed(1)}h`);
    if (item.lastDoneCyc !== undefined) parts.push(`${item.lastDoneCyc}c`);
  }
  
  console.log('formatInstalledAt result:', parts.join(" / "));
  return parts.length > 0 ? parts.join(" / ") : "N/A";
};

const formatInitialInterval = (item: MaintenanceTask | Component): string => {
  const parts: string[] = [];
  
  if (item.initialIntervalHrs) parts.push(`${item.initialIntervalHrs}h`);
  if (item.initialIntervalCyc) parts.push(`${item.initialIntervalCyc}c`);
  if (item.initialIntervalDays) parts.push(`${item.initialIntervalDays}d`);
  
  // Fallback to legacy intervals (only for MaintenanceTask)
  if (parts.length === 0 && 'intervalHrs' in item) {
    if (item.intervalHrs) parts.push(`${item.intervalHrs}h`);
    if (item.intervalCyc) parts.push(`${item.intervalCyc}c`);
    if (item.intervalDays) parts.push(`${item.intervalDays}d`);
  }
  
  return parts.length > 0 ? parts.join(" / ") : "N/A";
};

const formatRepeatInterval = (item: MaintenanceTask | Component): string => {
  const parts: string[] = [];
  
  if (item.repeatIntervalHrs) parts.push(`${item.repeatIntervalHrs}h`);
  if (item.repeatIntervalCyc) parts.push(`${item.repeatIntervalCyc}c`);
  if (item.repeatIntervalDays) parts.push(`${item.repeatIntervalDays}d`);
  
  return parts.length > 0 ? parts.join(" / ") : "N/A";
};

const formatCurrent = (item: MaintenanceTask | Component): string => {
  const parts: string[] = [];
  
  if (item.remainingHrs !== undefined) parts.push(`${item.remainingHrs.toFixed(1)}h`);
  if (item.remainingCyc !== undefined) parts.push(`${item.remainingCyc}c`);
  if (item.remainingDays !== undefined) parts.push(`${item.remainingDays}d`);
  
  return parts.length > 0 ? parts.join(" / ") : "N/A";
};

const formatNextInspection = (item: MaintenanceTask | Component, aircraft: Aircraft): string => {
  // For days-based intervals, calculate from last done date
  if (item.dueUnits?.includes("DAYS")) {
    if ('lastDoneDate' in item && item.lastDoneDate) {
      const lastDone = new Date(item.lastDoneDate);
      const intervalDays = item.initialIntervalDays || item.repeatIntervalDays || 0;
      if (intervalDays > 0) {
        const nextDate = new Date(lastDone);
        nextDate.setDate(nextDate.getDate() + intervalDays);
        return nextDate.toISOString().slice(0, 10);
      }
    }
  }
  
  // For hours-based intervals, calculate from aircraft TSN/CSN at installation + interval
  if (item.dueUnits?.includes("HOURS")) {
    const intervalHrs = item.initialIntervalHrs || item.repeatIntervalHrs || 0;
    if (intervalHrs > 0) {
      // For tasks, use lastDoneHrs; for components, use installedAtAcHrs
      let baseHrs = 0;
      if ('lastDoneHrs' in item && item.lastDoneHrs !== undefined) {
        baseHrs = item.lastDoneHrs;
      } else if ('installedAtAcHrs' in item && item.installedAtAcHrs !== undefined) {
        baseHrs = item.installedAtAcHrs;
      }
      const nextHrs = baseHrs + intervalHrs;
      return `${nextHrs.toFixed(1)}h`;
    }
  }
  
  // For cycles-based intervals, calculate from aircraft TSN/CSN at installation + interval
  if (item.dueUnits?.includes("CYCLES")) {
    const intervalCyc = item.initialIntervalCyc || item.repeatIntervalCyc || 0;
    if (intervalCyc > 0) {
      // For tasks, use lastDoneCyc; for components, use installedAtAcCyc
      let baseCyc = 0;
      if ('lastDoneCyc' in item && item.lastDoneCyc !== undefined) {
        baseCyc = item.lastDoneCyc;
      } else if ('installedAtAcCyc' in item && item.installedAtAcCyc !== undefined) {
        baseCyc = item.installedAtAcCyc;
      }
      const nextCyc = baseCyc + intervalCyc;
      return `${nextCyc}c`;
    }
  }
  
  return "N/A";
};

const getStatus = (item: MaintenanceTask | Component): "OK" | "DUE_SOON" | "DUE" | "OVERDUE" => {
  const remainingHrs = item.remainingHrs || 0;
  const remainingCyc = item.remainingCyc || 0;
  const remainingDays = item.remainingDays || 0;
  
  // Check if any remaining value is negative (overdue)
  if (remainingHrs < 0 || remainingCyc < 0 || remainingDays < 0) {
    return "OVERDUE";
  }
  
  // Check if any remaining value is very low (due soon)
  if (remainingHrs <= 10 || remainingCyc <= 10 || remainingDays <= 7) {
    return "DUE_SOON";
  }
  
  // Check if any remaining value is zero (due)
  if (remainingHrs === 0 || remainingCyc === 0 || remainingDays === 0) {
    return "DUE";
  }
  
  return "OK";
};

export const TasksComponentsTable = ({ aircraft, tasks, components }: TasksComponentsTableProps) => {
  // Ensure components is an array, default to empty array if undefined
  const safeComponents = components || [];
  
  const rows: TableRow[] = [
    // Tasks
    ...tasks.map(task => ({
      id: task.id,
      type: "Task" as const,
      title: task.title,
      category: task.type,
      pn: task.pn,
      sn: task.sn,
      unit: formatUnit(task),
      lastDone: formatLastDone(task),
      installedAt: formatInstalledAt(task),
      initialInterval: formatInitialInterval(task),
      repeatInterval: formatRepeatInterval(task),
      current: "N/A",
      nextInspection: formatNextInspection(task, aircraft),
      status: getStatus(task),
    })),
    
    // Components
    ...safeComponents.map(component => ({
      id: component.id,
      type: "Component" as const,
      title: component.name,
      category: component.category,
      pn: component.pn,
      sn: component.sn,
      unit: formatUnit(component),
      lastDone: formatLastDone(component),
      installedAt: formatInstalledAt(component),
      initialInterval: formatInitialInterval(component),
      repeatInterval: formatRepeatInterval(component),
      current: formatCurrent(component),
      nextInspection: formatNextInspection(component, aircraft),
      status: getStatus(component),
    })),
  ];

  // Sort by status priority (overdue first, then due, then due soon, then ok)
  const statusPriority = { "OVERDUE": 0, "DUE": 1, "DUE_SOON": 2, "OK": 3 };
  rows.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  if (rows.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-500">No tasks or components found.</p>
      </div>
    );
  }

  return (
    <div className="rounded border border-gray-200 bg-white overflow-hidden">
      {/* Aircraft Current Status Header */}
      <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Aircraft Hours:</span>
            <span className="ml-2 text-gray-900">{aircraft.currentHrs.toFixed(1)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Aircraft Landings:</span>
            <span className="ml-2 text-gray-900">{aircraft.currentCyc}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date:</span>
            <span className="ml-2 text-gray-900">{aircraft.currentDate}</span>
          </div>
        </div>
      </div>
      
      {/* Compact table without horizontal scroll */}
      <div className="overflow-hidden">
        <table className="w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                P/N
              </th>
              <th className="px-1 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                S/N
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intervals
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Done
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aircraft TSN/CSN at Installation/Inspection
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current
              </th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-1 py-0.5 text-xs font-semibold rounded-full ${
                    row.type === "Task" ? "bg-blue-100 text-blue-800" :
                    "bg-purple-100 text-purple-800"
                  }`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-2 py-2 max-w-xs">
                  <div className="text-xs font-medium text-gray-900 truncate">{row.title}</div>
                  <div className="text-xs text-gray-500 truncate">{row.category}</div>
                </td>
                <td className="px-1 py-2 text-xs text-gray-900 w-20">
                  <div className="break-words">{row.pn || "N/A"}</div>
                </td>
                <td className="px-1 py-2 text-xs text-gray-900 w-20">
                  <div className="break-words">{row.sn || "N/A"}</div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                  <div className="space-y-1">
                    <div>Init: {row.initialInterval}</div>
                    <div>Rep: {row.repeatInterval}</div>
                  </div>
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                  {row.lastDone}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                  {row.installedAt}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                  {row.nextInspection}
                </td>
                <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                  {row.current}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                    {row.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 