export type ID = string;

export type Aircraft = {
  id: ID;
  registration: string;
  type: string;
  msn: string;
  status: "In Service" | "Out of Service";
  base?: string;
  deliveryDate?: string;
  inServiceDate?: string;
  currentHrs: number;
  currentCyc: number;
  currentDate: string;
  avgDailyHrs: number;
  avgDailyCyc: number;
  cofaHours?: number;
  hoursToCheck?: number;
};

export type Assembly = {
  id: ID;
  aircraftId: ID;
  type: "Engine" | "Propeller" | "APU";
  position: "L" | "R" | "C";
  model: string;
  serial: string;
  tsnHrs: number;
  csn: number;
  tsoHrs?: number;
  cso?: number;
  lastOverhaulDate?: string;
  tboHrs?: number;
  tboYears?: number;
  // Additional engine/propeller details
  registration?: string;
  partNumber?: string;
  manufacturer?: string;
};

export type Component = {
  id: ID;
  aircraftId: ID;
  assemblyId?: ID;
  name: string;
  pn: string;
  sn: string;
  category: "HardTime" | "LifeLimited" | "OnCondition";
  limitHrs?: number;
  limitCyc?: number;
  limitDays?: number;
  // Units that govern this component's monitoring (set based on which limits are active)
  dueUnits?: ("HOURS" | "CYCLES" | "DAYS")[];
  tsnHrs?: number;
  csn?: number;
  tsoHrs?: number;
  cso?: number;
  installedDate?: string;
  graceHrs?: number;
  graceCyc?: number;
  graceDays?: number;
  // Aircraft usage at the time the component was installed
  installedAtAcHrs?: number;
  installedAtAcCyc?: number;
  // Component metrics captured at installation
  tsnAtInstallationHrs?: number;
  csnAtInstallation?: number;
  tsoAtInstallationHrs?: number;
  csoAtInstallation?: number;
  // Component metrics captured at last inspection (if different from installation)
  tsoAtInspectionHrs?: number;
  csoAtInspection?: number;
  // Interval model supporting initial and repeat intervals
  initialIntervalHrs?: number;
  initialIntervalCyc?: number;
  initialIntervalDays?: number;
  repeatIntervalHrs?: number;
  repeatIntervalCyc?: number;
  repeatIntervalDays?: number;
  // Remaining time/cycles/days until next inspection or installation
  remainingHrs?: number;
  remainingCyc?: number;
  remainingDays?: number;
  // Next inspection or installation date
  nextInspectionDate?: string;
  nextInstallationDate?: string;
  // Next inspection values (can be date, hours, or cycles)
  nextInspectionHrs?: number;
  nextInspectionCyc?: number;
  // Next installation values (can be date, hours, or cycles)
  nextInstallationHrs?: number;
  nextInstallationCyc?: number;
  projectedDays?: number;
};

export type MaintenanceTask = {
  id: ID;
  title: string;
  type: "Inspection" | "Overhaul" | "Check" | "AD" | "SB" | "Custom";
  aircraftType?: string;
  tailSpecificId?: ID;
  // Optional part and serial numbers when a task targets a specific unit
  pn?: string;
  sn?: string;
  checkId?: ID; // if the task is covered by a Check, set this to the parent check id
  // Legacy single-interval fields (still supported)
  intervalHrs?: number;
  intervalCyc?: number;
  intervalDays?: number;
  // New initial + repeat interval model
  initialIntervalHrs?: number;
  initialIntervalCyc?: number;
  initialIntervalDays?: number;
  repeatIntervalHrs?: number;
  repeatIntervalCyc?: number;
  repeatIntervalDays?: number;
  // Units and strategy defining how this task is monitored and evaluated
  dueUnits?: ("HOURS" | "CYCLES" | "DAYS")[];
  lastDoneDate?: string;
  lastDoneHrs?: number;
  lastDoneCyc?: number;
  reference?: string;
  isAD?: boolean;
  isSB?: boolean;
  docNo?: string;
  revision?: string;
  assemblyIds?: ID[];
  sourceDoc?: string;
  // Remaining time/cycles/days until next inspection
  remainingHrs?: number;
  remainingCyc?: number;
  remainingDays?: number;
  // Next inspection date
  nextInspectionDate?: string;
  // Next inspection values (can be date, hours, or cycles)
  nextInspectionHrs?: number;
  nextInspectionCyc?: number;
  projectedDays?: number;
};

export type Snag = {
  id: ID;
  aircraftId: ID;
  reportedAt: string;
  reportedBy: string;
  description: string;
  severity: "Minor" | "Significant" | "Major" | "Critical";
  status: "Open" | "Deferred" | "Closed";
  MELRef?: string;
  deferralCategory?: "A" | "B" | "C" | "D";
  deferralLimitDays?: number;
  deferralStart?: string;
  rectificationAction?: string;
  closedAt?: string;
  closedBy?: string;
};

export type ComplianceRecord = {
  id: ID;
  taskId: ID;
  aircraftId: ID;
  date: string;
  hrsAt?: number;
  cycAt?: number;
  remark?: string;
};

export type FlightLog = {
  id: ID;
  aircraftId: ID;
  date: string;
  blockHrs: number;
  cycles: number;
  from?: string;
  to?: string;
  techlogNumber?: string;
  pilot?: string;
  remarks?: string;
};

export type Specsheet = {
  aircraftId: ID;
  configuration: {
    seating: number;
    weights: { mtowKg: number; bewKg: number };
    avionics: string[];
    equipment: string[];
  };
};

export type DueLimit = { type: "HOURS" | "CYCLES" | "DAYS"; remaining: number };
export type DueStatus = "OK" | "DUE_SOON" | "DUE" | "OVERDUE";
export type ComputedDue = { itemId: ID; title: string; limits: DueLimit[]; status: DueStatus; estimatedDays?: number };


