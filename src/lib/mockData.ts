import { Aircraft, Assembly, Component, MaintenanceTask, Snag, ComplianceRecord, FlightLog, Specsheet } from "./types";

export const operator = { id: "op-001", name: "Safari Air Limited", icao: "SFR", country: "TZ" };

export const aircraft: Aircraft[] = [
  {
    id: "ac-AAC",
    registration: "5H-AAC",
    type: "C208B",
    msn: "208B-1234",
    status: "In Service",
    base: "HKJK",
    deliveryDate: "2018-06-01",
    inServiceDate: "2018-07-01",
    currentHrs: 6123.4,
    currentCyc: 5321,
    currentDate: "2025-09-15",
    avgDailyHrs: 3.2,
    avgDailyCyc: 3.0,
    // Monitoring items
    lastCofA: "2024-09-15",
    lastCofANextDue: "2025-09-14",
    lastWandB: "2020-09-15",
    lastWandBNextDue: "2025-09-14",
    navdataBaseLastDone: "2024-09-01",
    navdataBaseNextDue: "2024-10-01",
    fakLastDone: "2024-08-15",
    fakNextDue: "2025-08-15",
    survivalKitLastDone: "2024-07-01",
    survivalKitNextDue: "2025-07-01",
    // New tracking items
    eltBatteryLastDone: "2024-06-15",
    eltBatteryNextDue: "2025-06-15",
    fireExtinguisherLastDone: "2024-08-01",
    fireExtinguisherNextDue: "2025-07-31",
    standbyCompassLastDone: "2024-07-15",
    standbyCompassNextDue: "2025-07-14"
  },
  {
    id: "ac-AAG",
    registration: "5H-AAG",
    type: "DHC8-200",
    msn: "DHC8-200-0456",
    status: "In Service",
    base: "HTDA",
    deliveryDate: "2015-03-10",
    inServiceDate: "2015-04-01",
    currentHrs: 17895.6,
    currentCyc: 15820,
    currentDate: "2025-09-15",
    avgDailyHrs: 5.8,
    avgDailyCyc: 5.0,
    // Monitoring items
    lastCofA: "2024-08-15",
    lastCofANextDue: "2025-08-14",
    lastWandB: "2019-08-15",
    lastWandBNextDue: "2024-08-14",
    navdataBaseLastDone: "2024-09-10",
    navdataBaseNextDue: "2024-10-10",
    fakLastDone: "2024-07-01",
    fakNextDue: "2025-07-01",
    survivalKitLastDone: "2024-06-15",
    survivalKitNextDue: "2025-06-15",
    // New tracking items
    eltBatteryLastDone: "2024-05-20",
    eltBatteryNextDue: "2025-05-20",
    fireExtinguisherLastDone: "2024-07-10",
    fireExtinguisherNextDue: "2025-07-09",
    standbyCompassLastDone: "2024-06-01",
    standbyCompassNextDue: "2025-05-31"
  }
];

export const assemblies: Assembly[] = [
  { id: "eng-AAC-1", aircraftId: "ac-AAC", type: "Engine", position: "C", model: "PT6A-114A", serial: "PT6-114A-7788", tsnHrs: 6123.4, csn: 5321, tsoHrs: 1423.4, cso: 1240, lastOverhaulDate: "2021-10-02", tboHrs: 3600 },
  { id: "prop-AAC-1", aircraftId: "ac-AAC", type: "Propeller", position: "C", model: "Hartzell HC-B3TN-3", serial: "HZ-55621", tsnHrs: 6123.4, csn: 5321, tsoHrs: 923.4, cso: 820, lastOverhaulDate: "2023-02-11", tboHrs: 2400, tboYears: 6 },
  { id: "eng-AAG-L", aircraftId: "ac-AAG", type: "Engine", position: "L", model: "PW123", serial: "PW123-2201", tsnHrs: 17895.6, csn: 15820, tsoHrs: 2080.2, cso: 1820, lastOverhaulDate: "2020-08-20", tboHrs: 6000 },
  { id: "eng-AAG-R", aircraftId: "ac-AAG", type: "Engine", position: "R", model: "PW123", serial: "PW123-2210", tsnHrs: 16922.0, csn: 15050, tsoHrs: 580.7, cso: 520, lastOverhaulDate: "2024-02-05", tboHrs: 6000 },
  { id: "prop-AAG-L", aircraftId: "ac-AAG", type: "Propeller", position: "L", model: "DOWTY R408/6-123-F/10", serial: "DW-408-772", tsnHrs: 15030.0, csn: 13400, tsoHrs: 1800.3, cso: 1600, lastOverhaulDate: "2021-11-10", tboHrs: 3500, tboYears: 6 },
  { id: "prop-AAG-R", aircraftId: "ac-AAG", type: "Propeller", position: "R", model: "DOWTY R408/6-123-F/10", serial: "DW-408-779", tsnHrs: 14010.0, csn: 12690, tsoHrs: 620.5, cso: 540, lastOverhaulDate: "2024-03-15", tboHrs: 3500, tboYears: 6 }
];

export const components: Component[] = [
  { id: "cmp-AAC-elt", aircraftId: "ac-AAC", name: "ELT Battery", pn: "ELT-406", sn: "ELT-406-9931", category: "HardTime", limitDays: 730, installedDate: "2024-10-01" },
  { id: "cmp-AAG-llc-discL", aircraftId: "ac-AAG", assemblyId: "eng-AAG-L", name: "HP Compressor Disc", pn: "PW123-HPD", sn: "HPD-1102", category: "LifeLimited", limitCyc: 25000, tsnHrs: 17895.6, csn: 15820, installedDate: "2019-01-15" },
  // C208B Life Limited and Hard Time Components (subset from provided list)
  { id: "cmp-C208-LLC-FLAPBELLCRANK-1", aircraftId: "ac-AAC", name: "Flap Bell Crank Replace", pn: "2622083-18", sn: "N/A", category: "LifeLimited", limitCyc: 2250 },
  { id: "cmp-C208-LLC-FLAPBELLCRANK-2", aircraftId: "ac-AAC", name: "Flap Bell Crank Replace", pn: "DDA00028-4", sn: "N/A", category: "LifeLimited", limitCyc: 2250 },
  { id: "cmp-C208-LLC-FLAPBELLCRANK-3", aircraftId: "ac-AAC", name: "Flap Bell Crank Replace", pn: "2622281-2/-12", sn: "N/A", category: "LifeLimited", limitCyc: 7000 },
  { id: "cmp-C208-LLC-FLAPBELLCRANK-4", aircraftId: "ac-AAC", name: "Flap Bell Crank Replace", pn: "2692001-2", sn: "N/A", category: "LifeLimited", limitCyc: 7000 },
  { id: "cmp-C208-LLC-FLAPBELLCRANK-5", aircraftId: "ac-AAC", name: "Flap Bell Crank Replace", pn: "2622311-7/-16", sn: "N/A", category: "LifeLimited", limitCyc: 40000 },
  { id: "cmp-C208-LLC-FLAPBELLCRANK-6", aircraftId: "ac-AAC", name: "Flap Bell Crank attaching parts Replace", pn: "MS27641-5/S3952-5/AN5-77", sn: "N/A", category: "LifeLimited", limitCyc: 10000 },
  { id: "cmp-C208-LLC-FLAPBELLCRANK-7", aircraftId: "ac-AAC", name: "Flap Bell Crank attaching parts Replace", pn: "KP5A-H/AN5-77", sn: "N/A", category: "LifeLimited", limitCyc: 10000 },
  { id: "cmp-C208-LLC-ELEVATORPUSHROD-1", aircraftId: "ac-AAC", name: "Elevator Forward Pushrod Replace", pn: "2613440-1/2613414-1/2660034", sn: "N/A", category: "LifeLimited", limitCyc: 9500 },
  { id: "cmp-C208-LLC-ELEVATORPUSHROD-2", aircraftId: "ac-AAC", name: "Elevator Forward Pushrod Replace", pn: "2613440-3/2613440-5/DDA05946-1", sn: "N/A", category: "LifeLimited", limitCyc: 40000 },
  { id: "cmp-C208-LLC-ELEVATORPUSHROD-3", aircraftId: "ac-AAC", name: "Elevator Aft Pushrod Replace", pn: "2634009-1/2634027-1/2634027-3", sn: "N/A", category: "LifeLimited", limitCyc: 40000 },
  { id: "cmp-C208-LLC-MLG-CENTER-SPRING", aircraftId: "ac-AAC", name: "Main Landing Gear Center Spring Replace", pn: "2641014 series", sn: "N/A", category: "LifeLimited", limitCyc: 31500 },
  { id: "cmp-C208-LLC-MLG-TRUNNION", aircraftId: "ac-AAC", name: "Main Landing Gear Trunnion Assembly Replace", pn: "2641012 series", sn: "N/A", category: "LifeLimited", limitCyc: 31500 },
  { id: "cmp-C208-LLC-MLG-SPRING", aircraftId: "ac-AAC", name: "Main Landing Gear Spring Replace", pn: "2641013 series/DDA06280", sn: "N/A", category: "LifeLimited", limitCyc: 31500 },
  { id: "cmp-C208-LLC-MLG-ATTACH-PIN", aircraftId: "ac-AAC", name: "Main Landing Gear Attach Pin Replace", pn: "2641008 series", sn: "N/A", category: "LifeLimited", limitCyc: 31500 },
  { id: "cmp-C208-LLC-MLG-AXLES-1", aircraftId: "ac-AAC", name: "Main Landing Gear Axles Replace", pn: "2641011-1/-3/-4", sn: "N/A", category: "LifeLimited", limitCyc: 10000 },
  { id: "cmp-C208-LLC-MLG-AXLES-2", aircraftId: "ac-AAC", name: "Main Landing Gear Axles Replace", pn: "2641011-5", sn: "N/A", category: "LifeLimited", limitCyc: 31500 },
  { id: "cmp-C208-LLC-MLG-AXLE-FITTINGS", aircraftId: "ac-AAC", name: "Main Landing Gear Axle Fittings Replace", pn: "2641010-1/-3/-7", sn: "N/A", category: "LifeLimited", limitCyc: 31500 },
  { id: "cmp-C208-LLC-NLG-DRAG-LINK", aircraftId: "ac-AAC", name: "Nose Gear Drag Link Spring Replace", pn: "2643062 series/DDA06381 series", sn: "N/A", category: "LifeLimited", limitCyc: 15000 },
  { id: "cmp-C208-LLC-NLG-ASSEMBLY", aircraftId: "ac-AAC", name: "Nose Gear Assembly Replace", pn: "2643045/2643100/2643095 series", sn: "N/A", category: "LifeLimited", limitCyc: 40000 },
  { id: "cmp-C208-LLC-NLG-SUPPORT", aircraftId: "ac-AAC", name: "Nose Gear Spring Support Assembly Replace", pn: "2643030/2643055/2643099 series", sn: "N/A", category: "LifeLimited", limitCyc: 40000 },
  { id: "cmp-C208-LLC-NLG-FORK", aircraftId: "ac-AAC", name: "Nose Gear Spring Fork Assembly Replace", pn: "2643031-1/-7", sn: "N/A", category: "LifeLimited", limitCyc: 40000 }
];

export const ampTasksLibrary: MaintenanceTask[] = [
  { id: "amp-c208b", title: "C208B AMP Chapter 5 Tasks", type: "Custom", aircraftType: "C208B", reference: "AMP", sourceDoc: "C208 AMP TASKS.docx" },
  { id: "amp-dh8-100", title: "DHC8-100 AMP Chapter 5 Tasks", type: "Custom", aircraftType: "DHC8-100", reference: "AMP", sourceDoc: "Dash 8-100 AMP Tasks.docx" },
  { id: "amp-dh8-200", title: "DHC8-200 AMP Chapter 5 Tasks", type: "Custom", aircraftType: "DHC8-200", reference: "AMP", sourceDoc: "DHC8-200 AMP TASKS.docx" },
  { id: "amp-dh8-300", title: "DHC8-300 AMP Chapter 5 Tasks", type: "Custom", aircraftType: "DHC8-300", reference: "AMP", sourceDoc: "DHC8-300 AMP TASKS.docx" },
  { id: "amp-pc12", title: "PC-12 AMP Chapter 5 Tasks", type: "Custom", aircraftType: "PC-12", reference: "AMP", sourceDoc: "PC-12 AMP TASKS.docx" }
];

export const maintenanceTasks: MaintenanceTask[] = [
  { id: "task-AAC-100hr", aircraftType: "C208B", title: "100 Hour Inspection", type: "Inspection", intervalHrs: 100, lastDoneDate: "2025-08-20", lastDoneHrs: 6075.0, reference: "AMP-C208B-CH5-100H", sourceDoc: "C208 AMP TASKS.docx" },
  { id: "task-AAC-prop-oh", aircraftType: "C208B", title: "Propeller Overhaul", type: "Overhaul", intervalHrs: 2400, intervalDays: 2190, lastDoneDate: "2023-02-11", lastDoneHrs: 5200.0, reference: "Hartzell MM", assemblyIds: ["prop-AAC-1"] },
  { id: "task-AAC-AD", aircraftType: "C208B", title: "AD 2020-24-05 – Fuel Hose Inspection", type: "AD", intervalDays: 365, lastDoneDate: "2025-04-01", reference: "FAA AD 2020-24-05", isAD: true, docNo: "AD 2020-24-05", revision: "Original" },
  // C208B AMP NDI/inspection tasks (subset)
  { id: "task-C208-A.1", aircraftType: "C208B", title: "A.1 Flap Bell Crank NDI (2622281-2,-12)", type: "Inspection", intervalCyc: 500, reference: "A.1", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-A.2", aircraftType: "C208B", title: "A.2 Flap Bell Crank NDI (2692001-2)", type: "Inspection", intervalCyc: 500, reference: "A.2", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-B.1", aircraftType: "C208B", title: "B.1 MLG Axles NDI - MPI", type: "Inspection", intervalCyc: 1000, reference: "B.1", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-C.1", aircraftType: "C208B", title: "C.1 Fuselage/Strut Attach NDI", type: "Inspection", intervalHrs: 2500, reference: "C.1", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-C.2", aircraftType: "C208B", title: "C.2 Carry-Thru Fitting NDI", type: "Inspection", intervalHrs: 5000, reference: "C.2", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1a", aircraftType: "C208B", title: "D.1a Center Flap Track NDI", type: "Inspection", intervalCyc: 3000, reference: "D.1a", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1b", aircraftType: "C208B", title: "D.1b Inboard Flap Track NDI", type: "Inspection", intervalCyc: 3000, reference: "D.1b", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1c", aircraftType: "C208B", title: "D.1c Outboard Flap Track NDI", type: "Inspection", intervalCyc: 3000, reference: "D.1c", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1d", aircraftType: "C208B", title: "D.1d Front Spar Lower Cap EC", type: "Inspection", intervalHrs: 5000, reference: "D.1d", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1e", aircraftType: "C208B", title: "D.1e Rear Spar Lower Cap EC", type: "Inspection", intervalHrs: 5000, reference: "D.1e", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1f", aircraftType: "C208B", title: "D.1f Wing/Strut Attach to Front Spar EC", type: "Inspection", intervalHrs: 5000, reference: "D.1f", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1g", aircraftType: "C208B", title: "D.1g Wing to Carry-Thru Front Spar EC", type: "Inspection", intervalHrs: 5000, reference: "D.1g", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.1h", aircraftType: "C208B", title: "D.1h Wing to Carry-Thru Rear Spar EC", type: "Inspection", intervalHrs: 5000, reference: "D.1h", sourceDoc: "C208 AMP TASKS" },
  { id: "task-C208-D.2a", aircraftType: "C208B", title: "D.2a Wing Strut Attach Fitting EC", type: "Inspection", intervalHrs: 5000, reference: "D.2a", sourceDoc: "C208 AMP TASKS" },
  // Regulatory recurring (examples)
  { id: "task-C208-B256001", aircraftType: "C208B", title: "ELT Functional Check (ARTEX C406-2)", type: "Inspection", intervalDays: 365, reference: "25-60-00-720", sourceDoc: "C208 AMP TASKS", checkId: "check-C208B-5-15-01" },
  { id: "task-C208-B345001", aircraftType: "C208B", title: "Transponder Functional Check", type: "Inspection", intervalDays: 730, reference: "34-50-00-720", sourceDoc: "C208 AMP TASKS", checkId: "check-C208B-5-15-02" },
  { id: "task-C208-B341103", aircraftType: "C208B", title: "Pitot/Static System Functional Check", type: "Inspection", intervalDays: 730, reference: "34-11-00-720", sourceDoc: "C208 AMP TASKS", checkId: "check-C208B-5-15-02" },
  // Engine/PT6A related simplified
  { id: "task-C208-PT6A114A-HSI", aircraftType: "C208B", title: "Engine HSI PT6A-114A", type: "Overhaul", intervalHrs: 1800, reference: "HSI-PT6A-114A", sourceDoc: "EMM/PT6" },
  { id: "task-C208-PT6A114A-TBO", aircraftType: "C208B", title: "Engine TBO PT6A-114A", type: "Overhaul", intervalHrs: 5100, reference: "TBO-PT6A-114A", sourceDoc: "EMM/PT6" },
  { id: "task-C208-Prop-McCauley-OH", aircraftType: "C208B", title: "Propeller OH McCauley (3GFR34C703)", type: "Overhaul", intervalHrs: 4000, intervalDays: 2190, reference: "Propeller-OH", sourceDoc: "HC/SL" }
];

// Example Check definitions (grouped intervals). Tasks that belong to a Check will set checkId and be hidden from monitoring.

export const snags: Snag[] = [
  { id: "snag-AAC-001", snagId: "AAC-001", aircraftId: "ac-AAC", dateReported: "2025-09-12", reportedBy: "Capt. K. Moyo", description: "Left landing light intermittent", severity: "Minor", status: "Open", partsOrdered: false, action: "Investigate and repair", createdAt: "2025-09-12T10:00:00Z", updatedAt: "2025-09-12T10:00:00Z" },
  { id: "snag-AAG-002", snagId: "AAG-002", aircraftId: "ac-AAG", dateReported: "2025-09-10", reportedBy: "Engineer P. Nyerere", description: "Hydraulic leak observed at right main gear", severity: "Major", status: "Open", partsOrdered: false, action: "Investigate and repair", createdAt: "2025-09-10T14:30:00Z", updatedAt: "2025-09-10T14:30:00Z" }
];

export const complianceRecords: ComplianceRecord[] = [
  { id: "comp-001", aircraftId: "ac-AAC", taskId: "task-AAC-100hr", date: "2025-08-20", hrsAt: 6075.0, remark: "No findings" }
];

export const flightLogs: FlightLog[] = [
  { id: "fl-AAC-2025-09-14", aircraftId: "ac-AAC", date: "2025-09-14", blockHrs: 3.6, cycles: 3, from: "HTDA", to: "HTZA" },
  { id: "fl-AAG-2025-09-14", aircraftId: "ac-AAG", date: "2025-09-14", blockHrs: 6.1, cycles: 5, from: "HKJK", to: "HTKJ" }
];

export const specsheets: Specsheet[] = [
  { aircraftId: "ac-AAC", configuration: { seating: 12, weights: { mtowKg: 3970, bewKg: 2210 }, avionics: ["G1000 NXi", "ADF", "DME", "Mode S"], equipment: ["Cargo Pod", "Cargo Net", "406 MHz ELT"] } },
  { aircraftId: "ac-AAG", configuration: { seating: 37, weights: { mtowKg: 15600, bewKg: 10600 }, avionics: ["EFIS", "FMS UNS-1", "TCAS II", "GPWS"], equipment: ["RVSM", "WX Radar", "CVR/FDR"] } }
];


