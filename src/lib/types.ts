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
  EngineTBO?: number;
  PropTBO?: number;
  // Aircraft Details
  yearOfManufacture?: number;
  serialNumber?: string;
  manufacturer?: string;
  engineNumber?: string;
  propellerNumber?: string;
  lastCofA?: string;
  lastCofANextDue?: string;
  cofaExtensionDate?: string;
  cofaExtensionDays?: number;
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

// PIREP (Pilot Report) Types for Reliability Program
export type PIREPCategory = 
  | "ENGINE" 
  | "AVIONICS" 
  | "HYDRAULIC" 
  | "ELECTRICAL" 
  | "STRUCTURAL" 
  | "PERFORMANCE" 
  | "ENVIRONMENTAL" 
  | "NAVIGATION" 
  | "COMMUNICATION" 
  | "LANDING_GEAR" 
  | "PNEUMATIC" 
  | "FUEL_SYSTEM" 
  | "OTHER";

export type PIREPSeverity = 
  | "INFORMATIONAL" 
  | "MINOR" 
  | "MAJOR" 
  | "CRITICAL";

export type PIREPStatus = 
  | "SUBMITTED" 
  | "REVIEWED" 
  | "INVESTIGATING" 
  | "RESOLVED" 
  | "CLOSED";

export type PIREP = {
  id: ID;
  pirepNumber: string; // Auto-generated unique identifier
  aircraftId: ID;
  flightId?: ID; // Optional link to specific flight
  reportedBy: string; // Pilot name/ID
  reportDate: string;
  category: PIREPCategory;
  severity: PIREPSeverity;
  status: PIREPStatus;
  title: string;
  description: string;
  systemAffected: string;
  flightPhase?: "PRE_FLIGHT" | "TAXI" | "TAKEOFF" | "CLIMB" | "CRUISE" | "DESCENT" | "APPROACH" | "LANDING" | "POST_FLIGHT";
  weatherConditions?: string;
  altitude?: number;
  airspeed?: number;
  actionTaken?: string;
  followUpRequired: boolean;
  followUpNotes?: string;
  snagGenerated?: boolean; // Whether this PIREP generated a snag
  generatedSnagId?: ID; // Reference to auto-generated snag
  reviewedBy?: string;
  reviewedDate?: string;
  investigationNotes?: string;
  resolvedDate?: string;
  resolvedBy?: string;
  // Engine-specific fields (only populated when category = "ENGINE")
  engineNumber?: string;
  engineEventType?: string;
  oilTemperature?: number;
  oilPressure?: number;
  vibrationLevel?: number;
  egtTemperature?: number;
  n1RPM?: number;
  n2RPM?: number;
  createdAt: string;
  updatedAt: string;
};

// Reliability Metrics Types
export type ReliabilityMetricType = 
  | "MTBF" // Mean Time Between Failures
  | "MTTR" // Mean Time To Repair
  | "FAILURE_RATE" 
  | "DISPATCH_RELIABILITY"
  | "PIREP_FREQUENCY"
  | "SNAG_FREQUENCY"
  | "COMPONENT_RELIABILITY"
  | "AIRCRAFT_AVAILABILITY";

export type ReliabilityMetric = {
  id: ID;
  aircraftId: ID;
  componentId?: ID;
  metricType: ReliabilityMetricType;
  value: number;
  unit: string;
  period: string; // e.g., "30_DAYS", "90_DAYS", "ANNUAL"
  calculatedDate: string;
  baselineValue?: number;
  targetValue?: number;
  trend: "IMPROVING" | "STABLE" | "DEGRADING";
  notes?: string;
};

// Alert System Types
export type AlertType = 
  | "PERFORMANCE_DEVIATION" 
  | "TREND_ANOMALY" 
  | "THRESHOLD_EXCEEDED" 
  | "RECURRING_PIREP" 
  | "COMPLIANCE_ISSUE"
  | "MAINTENANCE_OVERDUE";

export type AlertSeverity = 
  | "LOW" 
  | "MEDIUM" 
  | "HIGH" 
  | "CRITICAL";

export type AlertStatus = 
  | "OPEN" 
  | "INVESTIGATING" 
  | "RESOLVED" 
  | "CLOSED";

export type Alert = {
  id: ID;
  aircraftId: ID;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  threshold?: number;
  actualValue?: number;
  relatedPirepId?: ID;
  relatedSnagId?: ID;
  assignedTo?: string;
  investigationNotes?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
};

// Flight Operations Tracking Types
export type FlightDelayReason =
  | "TECHNICAL"
  | "WEATHER"
  | "OPERATIONAL"
  | "AIR_TRAFFIC"
  | "PASSENGER"
  | "CREW"
  | "SECURITY"
  | "OTHER";

export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "IN_FLIGHT"
  | "LANDED"
  | "DELAYED"
  | "CANCELLED"
  | "DIVERTED";

export type Flight = {
  id: ID;
  flightNumber: string;
  aircraftId: ID;
  scheduledDeparture: string;
  actualDeparture?: string;
  scheduledArrival: string;
  actualArrival?: string;
  delayMinutes?: number;
  delayReason?: FlightDelayReason;
  status: FlightStatus;
  cancellationReason?: string;
  diversionReason?: string;
  departureAirport: string;
  arrivalAirport: string;
  flightHours: number;
  flightCycles: number;
  crewId?: string;
  passengers?: number;
  cargo?: number;
  fuelUsed?: number;
  weatherConditions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Maintenance Downtime Tracking
export type MaintenanceType =
  | "SCHEDULED"
  | "UNSCHEDULED"
  | "A_CHECK"
  | "B_CHECK"
  | "C_CHECK"
  | "D_CHECK"
  | "LINE_MAINTENANCE"
  | "HANGAR_MAINTENANCE"
  | "COMPONENT_REPLACEMENT"
  | "ENGINE_OVERHAUL"
  | "INSPECTION";

export type MaintenanceStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED";

export type MaintenanceRecord = {
  id: ID;
  aircraftId: ID;
  maintenanceType: MaintenanceType;
  status: MaintenanceStatus;
  startDate: string;
  endDate?: string;
  plannedDuration: number; // hours
  actualDuration?: number; // hours
  downtimeHours: number; // hours aircraft unavailable
  description: string;
  workPerformed: string;
  partsUsed: string[];
  laborHours: number;
  cost?: number;
  performedBy: string;
  supervisor?: string;
  inspectionResults?: string;
  nextDueDate?: string;
  notes?: string;
  relatedSnagId?: ID;
  relatedPirepId?: ID;
  createdAt: string;
  updatedAt: string;
};

// Component Tracking
export type ComponentStatus =
  | "INSTALLED"
  | "REMOVED"
  | "OVERHAULED"
  | "SCRAPPED"
  | "IN_STOCK"
  | "ON_ORDER";

export type RemovalReason =
  | "SCHEDULED"
  | "UNSCHEDULED"
  | "FAILURE"
  | "OVERHAUL"
  | "INSPECTION"
  | "UPGRADE"
  | "MODIFICATION";

export type ComponentRecord = {
  id: ID;
  partNumber: string;
  serialNumber: string;
  aircraftId?: ID;
  componentType: string;
  ataSystem: string; // ATA-100 system code
  description: string;
  status: ComponentStatus;
  installationDate?: string;
  removalDate?: string;
  removalReason?: RemovalReason;
  totalFlightHours: number;
  totalFlightCycles: number;
  timeSinceInstallation?: number; // hours
  cyclesSinceInstallation?: number;
  timeSinceOverhaul?: number; // hours
  cyclesSinceOverhaul?: number;
  nextInspectionDue?: string;
  nextOverhaulDue?: string;
  overhaulLimit: number; // hours
  cycleLimit: number;
  condition: "NEW" | "SERVICEABLE" | "UNSERVICEABLE" | "CONDEMNED";
  location?: string; // if in stock
  cost?: number;
  supplier?: string;
  warrantyExpiry?: string;
  notes?: string;
  relatedMaintenanceId?: ID;
  createdAt: string;
  updatedAt: string;
};

// Engine-Specific Tracking
export type EngineStatus =
  | "OPERATIONAL"
  | "LIMITED"
  | "GROUNDED"
  | "OVERHAUL"
  | "REMOVED";

export type EngineEvent =
  | "START"
  | "SHUTDOWN"
  | "INFLIGHT_SHUTDOWN"
  | "ABORTED_TAKEOFF"
  | "FLAME_OUT"
  | "OVERSPEED"
  | "OVERTEMP"
  | "VIBRATION_ALARM"
  | "OIL_PRESSURE_LOW"
  | "FUEL_PRESSURE_LOW";

export type EngineEventRecord = {
  id: ID;
  aircraftId: ID;
  engineNumber: number; // 1 or 2 for twin engines
  eventType: EngineEvent;
  eventDate: string;
  flightId?: ID;
  flightPhase?: "TAXI" | "TAKEOFF" | "CLIMB" | "CRUISE" | "DESCENT" | "APPROACH" | "LANDING";
  altitude?: number;
  airspeed?: number;
  engineHours: number;
  engineCycles: number;
  oilTemperature?: number;
  oilPressure?: number;
  fuelFlow?: number;
  vibrationLevel?: number;
  egtTemperature?: number;
  n1RPM?: number;
  n2RPM?: number;
  description: string;
  actionTaken: string;
  pilotReported: boolean;
  autoReported: boolean;
  maintenanceRequired: boolean;
  followUpRequired: boolean;
  resolved: boolean;
  resolutionDate?: string;
  relatedMaintenanceId?: ID;
  relatedSnagId?: ID;
  relatedPirepId?: ID;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

// Shop Visit Tracking
export type ShopVisitType =
  | "ENGINE_OVERHAUL"
  | "COMPONENT_OVERHAUL"
  | "MAJOR_INSPECTION"
  | "MODIFICATION"
  | "REPAIR"
  | "CALIBRATION"
  | "TESTING";

export type ShopVisitStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "DELAYED"
  | "CANCELLED";

export type ShopVisit = {
  id: ID;
  aircraftId?: ID;
  componentId?: ID;
  visitType: ShopVisitType;
  status: ShopVisitStatus;
  shopName: string;
  shopLocation: string;
  startDate: string;
  plannedCompletionDate: string;
  actualCompletionDate?: string;
  description: string;
  workPerformed: string;
  partsReplaced: string[];
  laborHours: number;
  totalCost: number;
  warrantyPeriod?: number; // months
  inspectionResults?: string;
  testResults?: string;
  certificationRequired: boolean;
  certificationNumber?: string;
  nextDueDate?: string;
  notes?: string;
  relatedMaintenanceId?: ID;
  relatedComponentId?: ID;
  createdAt: string;
  updatedAt: string;
};


