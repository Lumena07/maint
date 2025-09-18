"use client";
import { useEffect, useMemo, useState } from "react";
import { Aircraft, ComplianceRecord, MaintenanceTask } from "@/lib/types";
import { DueList } from "@/components/DueList";

type Props = {
  aircraft: Aircraft;
  tasks: MaintenanceTask[];
  
  compliance: ComplianceRecord[];
};

type Overrides = {
  avgDailyHrs?: number;
  avgDailyCyc?: number;
};

const storageKey = (acId: string) => `maint-overrides-${acId}`;

export default function ClientDueSection({ aircraft, tasks, compliance }: Props) {
  const [overrides, setOverrides] = useState<Overrides>({});
  const [records, setRecords] = useState<ComplianceRecord[]>(compliance);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(aircraft.id));
      if (raw) setOverrides(JSON.parse(raw));
      const histRaw = localStorage.getItem(`${storageKey(aircraft.id)}-history`);
      if (histRaw) setRecords(JSON.parse(histRaw));
    } catch {}
  }, [aircraft.id]);

  const effectiveAircraft: Aircraft = useMemo(() => ({
    ...aircraft,
    avgDailyHrs: typeof overrides.avgDailyHrs === "number" && overrides.avgDailyHrs > 0 ? overrides.avgDailyHrs : aircraft.avgDailyHrs,
    avgDailyCyc: typeof overrides.avgDailyCyc === "number" && overrides.avgDailyCyc > 0 ? overrides.avgDailyCyc : aircraft.avgDailyCyc,
  }), [aircraft, overrides]);

  const onSaveOverrides = (next: Overrides) => {
    const merged = { ...overrides, ...next };
    setOverrides(merged);
    try { localStorage.setItem(storageKey(aircraft.id), JSON.stringify(merged)); } catch {}
  };

  const onMarkDone = (itemId: string, _type: "task" | "check") => {
    const date = prompt("Completion date (YYYY-MM-DD)", new Date().toISOString().slice(0,10));
    if (!date) return;
    const hrsStr = prompt("Aircraft hours at completion (TSN)", String(aircraft.currentHrs));
    const cycStr = prompt("Aircraft cycles at completion (CSN)", String(aircraft.currentCyc));
    const hrsAt = hrsStr ? Number(hrsStr) : undefined;
    const cycAt = cycStr ? Number(cycStr) : undefined;
    const rec: ComplianceRecord = {
      id: `local-${Date.now()}`,
      aircraftId: aircraft.id,
      taskId: itemId,
      date,
      hrsAt: Number.isFinite(hrsAt) ? hrsAt : undefined,
      cycAt: Number.isFinite(cycAt) ? cycAt : undefined,
    };
    const next = [...records, rec];
    setRecords(next);
    try { localStorage.setItem(`${storageKey(aircraft.id)}-history`, JSON.stringify(next)); } catch {}
  };

  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Due List</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="flex items-center gap-1">
            <span className="text-gray-600">Avg hrs/day</span>
            <input type="number" step="0.1" className="w-20 rounded border px-2 py-1" defaultValue={effectiveAircraft.avgDailyHrs} onBlur={e => onSaveOverrides({ avgDailyHrs: Number(e.currentTarget.value) })} />
          </label>
          <label className="flex items-center gap-1">
            <span className="text-gray-600">Avg cyc/day</span>
            <input type="number" step="0.1" className="w-20 rounded border px-2 py-1" defaultValue={effectiveAircraft.avgDailyCyc} onBlur={e => onSaveOverrides({ avgDailyCyc: Number(e.currentTarget.value) })} />
          </label>
        </div>
      </div>
      <DueList aircraft={effectiveAircraft} tasks={tasks} compliance={records} onMarkDone={onMarkDone} />
    </div>
  );
}


