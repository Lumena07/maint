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
  CofA_Hours?: number;
  hoursToCheck?: number;
  engineOH?: number;
  propOH?: number;
  // Aircraft Details
  yearOfManufacture?: number;
  serialNumber?: string;
  manufacturer?: string;
  engineNumber?: string;
  propellerNumber?: string;
  lastCofA?: string;
  lastCofANextDue?: string;
  lastWandB?: string;
  lastWandBNextDue?: string;
  navdataBaseLastDone?: string;
  navdataBaseNextDue?: string;
  fakLastDone?: string;
  fakNextDue?: string;
  survivalKitLastDone?: string;
  survivalKitNextDue?: string;
  // ELT Battery tracking
  eltBatteryLastDone?: string;
  eltBatteryNextDue?: string;
  // Fire Extinguisher tracking (1 year - 1 day validity)
  fireExtinguisherLastDone?: string;
  fireExtinguisherNextDue?: string;
  // Standby Compass tracking (1 year - 1 day validity)
  standbyCompassLastDone?: string;
  standbyCompassNextDue?: string;
  // Grounding Status
  groundingStatus?: GroundingStatus;
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

export type AircraftMonitoringItem = {
  id: string;
  name: string;
  lastDone?: string;
  nextDue?: string;
  intervalYears?: number;
  status: DueStatus;
  daysUntilDue?: number;
};

export type GroundingReason = 
  | "Maintenance" 
  | "Inspection" 
  | "Component Failure" 
  | "Weather" 
  | "Regulatory" 
  | "Spare Parts" 
  | "Engine Overhaul" 
  | "Avionics" 
  | "Structural" 
  | "Other";

export type SpareStatus = 
  | "Not Required" 
  | "Required" 
  | "Ordered" 
  | "In Transit" 
  | "Received" 
  | "Installed";

export type GroundingRecord = {
  id: ID;
  aircraftId: ID;
  isGrounded: boolean;
  groundingDate?: string;
  ungroundingDate?: string;
  reason?: GroundingReason;
  description?: string;
  planOfAction?: string;
  sparePartsRequired: boolean;
  spareStatus?: SpareStatus;
  spareOrderDate?: string;
  spareExpectedDate?: string;
  spareReceivedDate?: string;
  estimatedUngroundingDate?: string;
  actualUngroundingDate?: string;
  daysOnGround?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type GroundingStatus = {
  isGrounded: boolean;
  currentRecord?: GroundingRecord;
  totalDaysGrounded?: number;
  lastGroundedDate?: string;
  lastUngroundedDate?: string;
};

export type SnagStatus = 
  | "Open" 
  | "In Progress" 
  | "Awaiting Parts" 
  | "Resolved" 
  | "Closed";

export type SnagSeverity = 
  | "Critical" 
  | "Major" 
  | "Minor" 
  | "Cosmetic";

export type Snag = {
  id: ID;
  snagId: string;
  dateReported: string;
  aircraftId: ID;
  description: string;
  status: SnagStatus;
  severity: SnagSeverity;
  partsOrdered: boolean;
  action: string;
  notes?: string;
  reportedBy?: string;
  assignedTo?: string;
  estimatedResolutionDate?: string;
  actualResolutionDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ADSBType = "AD" | "SB";

export type ADSBStatus = 
  | "Active" 
  | "Compliant" 
  | "Overdue" 
  | "Due Soon" 
  | "Not Applicable" 
  | "Superseded";

export type ADSBComputedStatus = 
  | "Active" 
  | "Compliant" 
  | "Overdue" 
  | "Due Soon" 
  | "Not Applicable" 
  | "Superseded";

export type ADSBPriority = 
  | "Critical" 
  | "High" 
  | "Medium" 
  | "Low";

export type ADSB = {
  id: ID;
  documentNumber: string;
  type: ADSBType;
  title: string;
  description: string;
  aircraftType?: string;
  aircraftId?: ID; // If specific to one aircraft
  applicableToAll?: boolean; // If applies to all aircraft of this type
  status: ADSBStatus;
  priority: ADSBPriority;
  issueDate: string;
  effectiveDate: string;
  complianceDate?: string;
  dueDate?: string;
  completedDate?: string;
  reference?: string;
  revision?: string;
  supersededBy?: string;
  supersedes?: string;
  complianceAction?: string;
  complianceNotes?: string;
  assignedTo?: string;
  estimatedCost?: number;
  actualCost?: number;
  partsRequired?: boolean;
  partsOrdered?: boolean;
  partsReceived?: boolean;
  workOrderNumber?: string;
  complianceCertificate?: string;
  createdAt: string;
  updatedAt: string;
};

export type ADDStatus = 
  | "Active" 
  | "Resolved";

export type ADDComputedStatus = 
  | "Active" 
  | "Resolved"
  | "Expired"
  | "Due Soon";

export type ADDCategory = 
  | "A" 
  | "B" 
  | "C" 
  | "D";

export type ADD = {
  id: ID;
  addNumber: string;
  aircraftId: ID;
  title: string;
  description: string;
  category: ADDCategory;
  status: ADDStatus;
  reportedDate: string;
  reportedBy: string;
  deferralPeriod: number; // Days - user specified for Category A, auto for B/C/D
  deferralExpiryDate: string;
  resolvedDate?: string;
  resolvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Personnel and Training Types
export type PersonnelRole = 
  | "Director of Maintenance" 
  | "Quality Manager" 
  | "Certifying Staff" 
  | "Maintenance Technician" 
  | "Inspector" 
  | "Part-time" 
  | "Contract";

export type PersonnelStatus = 
  | "Active" 
  | "Inactive" 
  | "On Leave" 
  | "Terminated";

export type TrainingType = 
  | "Initial Training" 
  | "Recurrent Training" 
  | "Update Training" 
  | "Additional Training" 
  | "Indoctrination Training" 
  | "Type Training" 
  | "MEL Training" 
  | "SMS Training" 
  | "Human Factors Training";

export type TrainingStatus = 
  | "Scheduled" 
  | "In Progress" 
  | "Completed" 
  | "Expired" 
  | "Cancelled";

export type CertificationStatus = 
  | "Valid" 
  | "Expiring Soon" 
  | "Expired" 
  | "Not Required";

export type Personnel = {
  id: ID;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role: PersonnelRole;
  status: PersonnelStatus;
  hireDate: string;
  terminationDate?: string;
  certifications: PersonnelCertification[];
  trainingRecords: TrainingRecord[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PersonnelCertification = {
  id: ID;
  personnelId: ID;
  certificationType: string;
  certificationNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: CertificationStatus;
  renewalRequired: boolean;
  renewalIntervalMonths?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type TrainingRecord = {
  id: ID;
  personnelId: ID;
  trainingType: TrainingType;
  title: string;
  description: string;
  provider: string;
  instructor?: string;
  status: TrainingStatus;
  scheduledDate?: string;
  startDate?: string;
  completionDate?: string;
  expiryDate?: string;
  durationHours?: number;
  score?: number;
  passFail?: boolean;
  certificateNumber?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};


