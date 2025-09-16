import { Aircraft, MaintenanceTask, MaintenanceCheck, DueLimit, ComputedDue, DueStatus, ComplianceRecord } from "./types";

const clampStatus = (limits: DueLimit[]): DueStatus => {
  const hasOverdue = limits.some(l => l.remaining < 0);
  if (hasOverdue) return "OVERDUE";
  const hasDue = limits.some(l => l.remaining <= 0);
  if (hasDue) return "DUE";
  return "OK";
};

const applyLastDoneFromCompliance = (task: MaintenanceTask, ac: Aircraft, history: ComplianceRecord[] | undefined): MaintenanceTask => {
  if (!history || history.length === 0) return task;
  const last = history
    .filter(r => r.taskId === task.id && r.aircraftId === ac.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (!last) return task;
  return {
    ...task,
    lastDoneDate: last.date ?? task.lastDoneDate,
    lastDoneHrs: typeof last.hrsAt === "number" ? last.hrsAt : task.lastDoneHrs,
    lastDoneCyc: typeof last.cycAt === "number" ? last.cycAt : task.lastDoneCyc
  };
};

export const computeDueForTask = (task: MaintenanceTask, ac: Aircraft, history?: ComplianceRecord[]): ComputedDue => {
  const effective = applyLastDoneFromCompliance(task, ac, history);
  const limits: DueLimit[] = [];
  if (effective.intervalHrs != null && typeof effective.lastDoneHrs === "number") {
    const nextHrs = effective.lastDoneHrs + effective.intervalHrs;
    limits.push({ type: "HOURS", remaining: nextHrs - ac.currentHrs });
  }
  if (effective.intervalCyc != null && typeof effective.lastDoneCyc === "number") {
    const nextCyc = effective.lastDoneCyc + effective.intervalCyc;
    limits.push({ type: "CYCLES", remaining: nextCyc - ac.currentCyc });
  }
  if (effective.intervalDays != null && effective.lastDoneDate) {
    const last = new Date(effective.lastDoneDate);
    const next = new Date(last.getTime() + effective.intervalDays * 86400000);
    const remDays = Math.ceil((next.getTime() - new Date(ac.currentDate).getTime()) / 86400000);
    limits.push({ type: "DAYS", remaining: remDays });
  }
  const status = clampStatus(limits);
  const estimatedDays = estimateDaysFromLimits(limits, ac);
  return { itemId: effective.id, title: effective.title, limits, status, estimatedDays };
};

export const inProjectionWindow = (due: ComputedDue, ac: Aircraft, days: number): boolean => {
  const hrsThreshold = ac.avgDailyHrs * days;
  const cycThreshold = ac.avgDailyCyc * days;
  return due.limits.some(l => {
    if (l.type === "HOURS") return l.remaining <= hrsThreshold;
    if (l.type === "CYCLES") return l.remaining <= cycThreshold;
    if (l.type === "DAYS") return l.remaining <= days;
    return false;
  });
};

export const computeDueForCheck = (check: MaintenanceCheck, ac: Aircraft): ComputedDue => {
  const limits: DueLimit[] = [];
  if (check.intervalHrs != null && typeof check.lastDoneHrs === "number") {
    const nextHrs = check.lastDoneHrs + check.intervalHrs;
    limits.push({ type: "HOURS", remaining: nextHrs - ac.currentHrs });
  }
  if (check.intervalCyc != null && typeof check.lastDoneCyc === "number") {
    const nextCyc = check.lastDoneCyc + check.intervalCyc;
    limits.push({ type: "CYCLES", remaining: nextCyc - ac.currentCyc });
  }
  if (check.intervalDays != null && check.lastDoneDate) {
    const last = new Date(check.lastDoneDate);
    const next = new Date(last.getTime() + check.intervalDays * 86400000);
    const remDays = Math.ceil((next.getTime() - new Date(ac.currentDate).getTime()) / 86400000);
    limits.push({ type: "DAYS", remaining: remDays });
  }
  const status = clampStatus(limits);
  const estimatedDays = estimateDaysFromLimits(limits, ac);
  return { itemId: check.id, title: check.title, limits, status, estimatedDays };
};

// Estimate days remaining from HOURS/CYCLES limits using average utilization.
// Rule: if HOURS present, use remainingHours / avgDailyHrs.
// Else if CYCLES present, use remainingCycles / avgDailyCyc.
// Else if DAYS present, use that directly.
const estimateDaysFromLimits = (limits: DueLimit[], ac: Aircraft): number | undefined => {
  const hours = limits.find(l => l.type === "HOURS");
  if (hours && ac.avgDailyHrs > 0) return Math.ceil(hours.remaining / ac.avgDailyHrs);
  const cycles = limits.find(l => l.type === "CYCLES");
  if (cycles && ac.avgDailyCyc > 0) return Math.ceil(cycles.remaining / ac.avgDailyCyc);
  const days = limits.find(l => l.type === "DAYS");
  return days ? Math.ceil(days.remaining) : undefined;
};


