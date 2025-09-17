"use client";
import { useState, useEffect } from "react";
import { Aircraft, MaintenanceTask, Component } from "@/lib/types";
import { EditModal } from "./EditModal";
import { AddModal } from "./AddModal";

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

const formatCurrent = (item: MaintenanceTask | Component, aircraft: Aircraft): string => {
  if (!item.dueUnits || item.dueUnits.length === 0) return "N/A";
  
  const results: string[] = [];
  
  // Check if initial or repeat intervals should be used
  const hasLastDone = 'lastDoneDate' in item ? item.lastDoneDate : ('installedDate' in item ? item.installedDate : null);
  const hasRepeatInterval = item.repeatIntervalHrs || item.repeatIntervalCyc || item.repeatIntervalDays;
  const useRepeat = !!hasLastDone && !!hasRepeatInterval;
  
  item.dueUnits.forEach(unit => {
    let remaining: number | null = null;
    
    if (unit === "HOURS") {
      const interval = useRepeat ? item.repeatIntervalHrs : item.initialIntervalHrs;
      const lastDone = 'lastDoneHrs' in item ? item.lastDoneHrs : ('installedAtAcHrs' in item ? item.installedAtAcHrs : undefined);
      
      if (interval && lastDone !== undefined) {
        const nextHrs = lastDone + interval;
        remaining = nextHrs - aircraft.currentHrs;
      } else if (interval) {
        // No installation data, use initial interval
        remaining = interval - aircraft.currentHrs;
      }
    } else if (unit === "CYCLES") {
      const interval = useRepeat ? item.repeatIntervalCyc : item.initialIntervalCyc;
      const lastDone = 'lastDoneCyc' in item ? item.lastDoneCyc : ('installedAtAcCyc' in item ? item.installedAtAcCyc : undefined);
      
      if (interval && lastDone !== undefined) {
        const nextCyc = lastDone + interval;
        remaining = nextCyc - aircraft.currentCyc;
      } else if (interval) {
        // No installation data, use initial interval
        remaining = interval - aircraft.currentCyc;
      }
    } else if (unit === "DAYS") {
      const interval = useRepeat ? item.repeatIntervalDays : item.initialIntervalDays;
      const lastDoneDate = 'lastDoneDate' in item ? item.lastDoneDate : ('installedDate' in item ? item.installedDate : null);
      
      if (interval && lastDoneDate) {
        const lastDate = new Date(lastDoneDate);
        const nextDate = new Date(lastDate.getTime() + (interval * 24 * 60 * 60 * 1000));
        const currentDate = new Date(aircraft.currentDate);
        const diffTime = nextDate.getTime() - currentDate.getTime();
        remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (interval) {
        // No installation data, use initial interval
        const currentDate = new Date(aircraft.currentDate);
        const nextDate = new Date(currentDate.getTime() + (interval * 24 * 60 * 60 * 1000));
        const diffTime = nextDate.getTime() - currentDate.getTime();
        remaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }
    
    if (remaining !== null) {
      if (unit === "HOURS") {
        results.push(`${remaining.toFixed(1)}h`);
      } else if (unit === "CYCLES") {
        results.push(`${remaining}c`);
      } else if (unit === "DAYS") {
        results.push(`${remaining}d`);
      }
    }
  });
  
  return results.length > 0 ? results.join(", ") : "N/A";
};

const formatNextInspection = (item: MaintenanceTask | Component, aircraft: Aircraft) => {
  if (!item.dueUnits || item.dueUnits.length === 0) return "N/A";
  
  const results: string[] = [];
  
  // Check if initial or repeat intervals should be used
  const hasLastDone = 'lastDoneDate' in item ? item.lastDoneDate : ('installedDate' in item ? item.installedDate : null);
  // If repeat interval is N/A, always use initial interval
  const hasRepeatInterval = item.repeatIntervalHrs || item.repeatIntervalCyc || item.repeatIntervalDays;
  const useRepeat = !!hasLastDone && !!hasRepeatInterval;
  
  item.dueUnits.forEach(unit => {
    let nextValue: string | number = "N/A";
    
    if (unit === "HOURS") {
      const interval = useRepeat ? item.repeatIntervalHrs : item.initialIntervalHrs;
      // Use aircraft TSN/CSN at installation/inspection
      const lastDone = 'lastDoneHrs' in item ? item.lastDoneHrs : ('installedAtAcHrs' in item ? item.installedAtAcHrs : undefined);
      
      if (interval && lastDone !== undefined) {
        nextValue = lastDone + interval;
      } else if (interval) {
        // Fallback: just the initial interval value (aircraft hasn't reached it yet)
        nextValue = interval;
      }
    } else if (unit === "CYCLES") {
      const interval = useRepeat ? item.repeatIntervalCyc : item.initialIntervalCyc;
      // Use aircraft TSN/CSN at installation/inspection
      const lastDone = 'lastDoneCyc' in item ? item.lastDoneCyc : ('installedAtAcCyc' in item ? item.installedAtAcCyc : undefined);
      
      if (interval && lastDone !== undefined) {
        nextValue = lastDone + interval;
      } else if (interval) {
        // Fallback: just the initial interval value (aircraft hasn't reached it yet)
        nextValue = interval;
      }
    } else if (unit === "DAYS") {
      const interval = useRepeat ? item.repeatIntervalDays : item.initialIntervalDays;
      // Use last done date + interval
      const lastDoneDate = 'lastDoneDate' in item ? item.lastDoneDate : ('installedDate' in item ? item.installedDate : null);
      
      if (interval && lastDoneDate) {
        const lastDate = new Date(lastDoneDate);
        const nextDate = new Date(lastDate.getTime() + (interval * 24 * 60 * 60 * 1000));
        nextValue = nextDate.toISOString().split('T')[0];
      } else if (interval) {
        // Fallback: just the initial interval value (aircraft hasn't reached it yet)
        nextValue = interval;
      }
    }
    
    if (nextValue !== "N/A") {
      // Format with unit suffix
      if (unit === "HOURS") {
        results.push(`${nextValue}h`);
      } else if (unit === "CYCLES") {
        results.push(`${nextValue}c`);
      } else if (unit === "DAYS") {
        results.push(`${nextValue}`);
      }
    }
  });
  
  return results.length > 0 ? results.join(", ") : "N/A";
};

const getStatus = (item: MaintenanceTask | Component, aircraft: Aircraft): "OK" | "DUE_SOON" | "DUE" | "OVERDUE" => {
  if (!item.dueUnits || item.dueUnits.length === 0) return "OK";
  
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
  const minProjectedDays = projectedDaysList.length > 0 ? Math.min(...projectedDaysList) : 0;
  
  // Store the projected days in the item for use in projections tab
  (item as any).projectedDays = minProjectedDays;
  
  // Determine status based on projected days
  if (minProjectedDays <= 0) {
    return "OVERDUE";
  } else if (minProjectedDays <= 30) {
    return "DUE_SOON";
  } else if (minProjectedDays <= 60) {
    return "DUE";
  } else {
    return "OK";
  }
};

const getRowBackgroundColor = (status: string) => {
  switch (status) {
    case "DUE_SOON": return "bg-red-50";
    case "DUE": return "bg-yellow-50";
    default: return "";
  }
};

export const TasksComponentsTable = ({ aircraft, tasks, components }: TasksComponentsTableProps) => {
  // State for modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MaintenanceTask | Component | null>(null);
  const [editingType, setEditingType] = useState<"Task" | "Component">("Task");
  const [addType, setAddType] = useState<"Task" | "Component">("Task");

  // Ensure components is an array, default to empty array if undefined
  const safeComponents = components || [];

  // Calculate and save projected days when component mounts or data changes
  useEffect(() => {
    const calculateProjectedDays = async () => {
      try {
        const response = await fetch("/api/calculate-projected-days", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ aircraftId: aircraft.id }),
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log("Projected days calculated and saved:", result);
        } else {
          console.error("Failed to calculate projected days");
        }
      } catch (error) {
        console.error("Error calculating projected days:", error);
      }
    };

    // Only calculate if we have tasks or components
    if (tasks.length > 0 || safeComponents.length > 0) {
      calculateProjectedDays();
    }
  }, [aircraft.id, tasks.length, safeComponents.length]);
  
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
      current: formatCurrent(task, aircraft),
      nextInspection: formatNextInspection(task, aircraft),
      status: getStatus(task, aircraft),
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
      current: formatCurrent(component, aircraft),
      nextInspection: formatNextInspection(component, aircraft),
      status: getStatus(component, aircraft),
    })),
  ];

  // Sort by status priority (overdue first, then due, then due soon, then ok)
  const statusPriority = { "OVERDUE": 0, "DUE": 1, "DUE_SOON": 2, "OK": 3 };
  rows.sort((a, b) => statusPriority[a.status] - statusPriority[b.status]);

  const handleEdit = (item: MaintenanceTask | Component) => {
    setEditingItem(item);
    setEditingType(item.id.startsWith('task-') ? "Task" : "Component");
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, type: "Task" | "Component") => {
    if (confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
      try {
        const endpoint = type === "Task" ? "/api/tasks" : "/api/components";
        const response = await fetch(`${endpoint}?id=${id}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          // Refresh the page to show updated data
          window.location.reload();
        } else {
          alert("Failed to delete item");
        }
      } catch (error) {
        alert("Error deleting item");
      }
    }
  };

  const handleSave = async (item: MaintenanceTask | Component) => {
    try {
      const endpoint = item.id.startsWith('task-') ? "/api/tasks" : "/api/components";
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });
      
      if (response.ok) {
        // Calculate and save projected days after successful save
        await fetch("/api/calculate-projected-days", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ aircraftId: aircraft.id }),
        });
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert("Failed to save changes");
      }
    } catch (error) {
      alert("Error saving changes");
    }
  };

  const handleAdd = async (item: MaintenanceTask | Component) => {
    try {
      const endpoint = addType === "Task" ? "/api/tasks" : "/api/components";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });
      
      if (response.ok) {
        // Calculate and save projected days after successful add
        await fetch("/api/calculate-projected-days", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ aircraftId: aircraft.id }),
        });
        
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        alert("Failed to add item");
      }
    } catch (error) {
      alert("Error adding item");
    }
  };

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
        <div className="flex justify-between items-center">
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
          
          {/* Add buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setAddType("Task");
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              + Add Task
            </button>
            <button
              onClick={() => {
                setAddType("Component");
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              + Add Component
            </button>
          </div>
        </div>
      </div>
      
      {/* Full width table with horizontal scroll if needed */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Type
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Title
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                P/N
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                S/N
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                Intervals
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Last Done
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                Aircraft TSN/CSN at Installation/Inspection
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Next
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Current
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row) => (
              <tr key={row.id} className={`hover:bg-gray-50 ${getRowBackgroundColor(row.status)}`}>
                <td className="px-2 py-3 whitespace-nowrap w-16">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.type === "Task" ? "bg-blue-100 text-blue-800" :
                    "bg-purple-100 text-purple-800"
                  }`}>
                    {row.type}
                  </span>
                </td>
                <td className="px-2 py-3 w-48">
                  <div className="text-sm font-medium text-gray-900">{row.title}</div>
                  <div className="text-sm text-gray-500">{row.category}</div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-32">
                  <div className="break-words">{row.pn || "N/A"}</div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-32">
                  <div className="break-words">{row.sn || "N/A"}</div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-40">
                  <div className="space-y-1">
                    <div>Init: {row.initialInterval}</div>
                    <div>Rep: {row.repeatInterval}</div>
                  </div>
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-28">
                  {row.lastDone}
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-48">
                  {row.installedAt}
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-32">
                  {row.nextInspection}
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 w-32">
                  {row.current}
                </td>
                <td className="px-2 py-3 whitespace-nowrap w-24">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
                    {row.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-2 py-3 whitespace-nowrap w-32">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(row.type === "Task" ? tasks.find(t => t.id === row.id)! : components.find(c => c.id === row.id)!)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row.id, row.type)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        item={editingItem}
        type={editingType}
        onSave={handleSave}
      />
      
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        type={addType}
        onSave={handleAdd}
      />
    </div>
  );
}; 