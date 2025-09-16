"use client";
import { Aircraft, MaintenanceTask } from "@/lib/types";
import { computeDueForTask, inProjectionWindow } from "@/lib/due";

const Window = ({ d }: { d: number }) => <span className="rounded bg-gray-100 px-2 py-1 text-xs">{d}d</span>;

export const Projections = ({ aircraft, tasks }: { aircraft: Aircraft; tasks: MaintenanceTask[] }) => {
  const windows = [30, 60, 90] as const;

  return (
    <div className="space-y-3">
      {windows.map(d => {
        const visibleTasks = tasks.filter(t => !t.checkId);
        const taskHits = visibleTasks
          .map(t => computeDueForTask(t, aircraft))
          .filter(due => inProjectionWindow(due, aircraft, d));

        return (
          <div key={d} className="rounded border border-gray-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">Projection <Window d={d} /></div>
              <div className="text-xs text-gray-500">{taskHits.length} due within {d} days</div>
            </div>
            {taskHits.length === 0 ? (
              <p className="text-sm text-gray-500">Nothing due in this window.</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5">
                {taskHits.map(h => (
                  <li key={h.itemId} className="text-sm">
                    <span className="font-medium">{h.title}</span>{" "}
                    <span className="font-mono text-gray-700">
                      [{h.limits.map(l => `${l.type[0]}:${l.remaining.toFixed(1)}`).join(" ")}]
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};


