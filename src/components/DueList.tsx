"use client";
import { Aircraft, MaintenanceTask, ComplianceRecord } from "@/lib/types";
import { computeDueForTask } from "@/lib/due";

export const DueList = ({ aircraft, tasks, compliance, onMarkDone }: { aircraft: Aircraft; tasks: MaintenanceTask[]; compliance?: ComplianceRecord[]; onMarkDone?: (itemId: string, type: "task" | "check") => void }) => {
  
  

  const visibleTasks = tasks.filter(t => !t.checkId);
  const taskRows = visibleTasks
    .map(task => ({ id: task.id, title: task.title, type: task.type, ref: task.reference, sourceDoc: task.sourceDoc, due: computeDueForTask(task, aircraft, compliance) }))
    .filter(row => row.due.limits.length > 0);


  const rows = taskRows.sort((a, b) => {
    const aMin = Math.min(...a.due.limits.map(l => l.remaining));
    const bMin = Math.min(...b.due.limits.map(l => l.remaining));
    return aMin - bMin;
  });

  if (rows.length === 0) return <p className="text-sm text-gray-500">No interval-based tasks configured.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600">
          <tr>
            <th className="px-3 py-2">Task</th>
            <th className="px-3 py-2">Limits</th>
            <th className="px-3 py-2">Est. Days</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
            <th className="px-3 py-2">Ref</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, title, type, ref, sourceDoc, due }) => (
            <tr key={id} className="border-b last:border-0">
              <td className="px-3 py-2">
                <div className="font-medium">{title}</div>
                <div className="text-xs text-gray-500">{type}{sourceDoc ? ` • ${sourceDoc}` : ""}</div>
              </td>
              <td className="px-3 py-2 font-mono">
                {due.limits.map(l => `${l.type[0]}:${l.remaining.toFixed(1)}`).join("  ")}
              </td>
              <td className="px-3 py-2 text-xs">{typeof due.estimatedDays === "number" ? `${due.estimatedDays} d` : "-"}</td>
              <td className="px-3 py-2">
                <span className={
                  "rounded px-2 py-1 text-xs class:" +
                  (due.status === "OVERDUE" ? "bg-red-100 text-red-700" :
                   due.status === "DUE" ? "bg-amber-100 text-amber-700" :
                   "bg-emerald-100 text-emerald-700")
                }>
                  {due.status}
                </span>
              </td>
              <td className="px-3 py-2 text-xs">
                {onMarkDone && (
                  <button
                    className="rounded bg-gray-900 px-2 py-1 text-white hover:bg-gray-800"
                    onClick={() => onMarkDone(id, type === "Check" ? "check" : "task")}
                  >Mark done</button>
                )}
              </td>
              <td className="px-3 py-2 text-xs text-gray-600">{ref || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


