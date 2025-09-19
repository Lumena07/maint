"use client";
import { useState, useEffect } from "react";
import { Aircraft, Assembly, FlightLog } from "@/lib/types";

type HoursTrackingProps = {
  aircraft: Aircraft;
  assemblies: Assembly[];
};

type FlightLogEntry = {
  date: string;
  blockHrs: number;
  cycles: number;
  techlogNumber: string;
  from?: string;
  to?: string;
  pilot?: string;
  remarks?: string;
  cofaReset?: boolean;
  hoursToCheck?: number;
  isExtension?: boolean;
  engineOHReset?: boolean;
  propOHReset?: boolean;
};

type CheckExtension = {
  date: string;
  checkType: string;
  hoursGranted: number;
  reason: string;
  performedBy: string;
  reference?: string;
};

export const HoursTracking = ({ aircraft, assemblies }: HoursTrackingProps) => {
  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([]);
  const [checkExtensions, setCheckExtensions] = useState<CheckExtension[]>([]);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [newFlightEntry, setNewFlightEntry] = useState<FlightLogEntry>({
    date: new Date().toISOString().split('T')[0],
    blockHrs: 0,
    cycles: 0,
    techlogNumber: '',
    from: '',
    to: '',
    pilot: '',
    remarks: '',
    cofaReset: false,
    hoursToCheck: 0,
    isExtension: false,
    engineOHReset: false,
    propOHReset: false
  });
  const [selectedType, setSelectedType] = useState<'regular' | 'check' | 'extension' | 'cofa' | 'engineoh' | 'propoh'>('regular');

  const engines = assemblies.filter(a => a.type === "Engine");
  const props = assemblies.filter(a => a.type === "Propeller");

  // Load flight logs and related data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/flight-logs?aircraftId=${aircraft.id}`);
        if (response.ok) {
          const data = await response.json();
          setFlightLogs(data.flightLogs || []);
          setCheckExtensions(data.checkExtensions || []);
        }
      } catch (_error) {
        console.error("Error loading flight data:", _error);
      }
    };
    loadData();
  }, [aircraft.id]);

  const handleAddFlight = async () => {
    try {
      const response = await fetch("/api/flight-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          ...newFlightEntry
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFlightLogs(prev => [...prev, result.flightLog]);
        setNewFlightEntry({
          date: new Date().toISOString().split('T')[0],
          blockHrs: 0,
          cycles: 0,
          techlogNumber: '',
          from: '',
          to: '',
          pilot: '',
          remarks: '',
          cofaReset: false,
          hoursToCheck: 0,
          isExtension: false,
          engineOHReset: false,
          propOHReset: false
        });
        setSelectedType('regular');
        setIsAddingFlight(false);
        // Refresh page to update aircraft hours and totals
        window.location.reload();
      } else {
        alert("Failed to add flight log entry");
      }
    } catch (_error) {
      alert("Error adding flight log entry");
    }
  };


  const calculateEngineTSN = (engine: Assembly) => {
    // Engine TSN = Aircraft TSN - Engine TSO (since last overhaul)
    return aircraft.currentHrs - (engine.tsoHrs || 0);
  };

  const calculateEngineCSN = (engine: Assembly) => {
    // Engine CSN = Aircraft CSN - Engine CSO (since last overhaul)
    return aircraft.currentCyc - (engine.cso || 0);
  };

  const calculatePropTSN = (prop: Assembly) => {
    // Prop TSN = Aircraft TSN - Prop TSO (since last overhaul)
    return aircraft.currentHrs - (prop.tsoHrs || 0);
  };

  const calculatePropCSN = (prop: Assembly) => {
    // Prop CSN = Aircraft CSN - Prop CSO (since last overhaul)
    return aircraft.currentCyc - (prop.cso || 0);
  };

  // Calculate individual flight values for each flight log entry
  const calculateIndividualFlightValues = (log: FlightLog, index: number) => {
    // Get all flight logs sorted by date
    const sortedLogs = [...flightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Starting point values (BEFORE the first flight on 2025-08-21)
    const startingAircraftHrs = 12097.5; // Aircraft TSN baseline (12101.4 - 3.9)
    const startingAircraftCyc = 15415; // Aircraft CSN baseline (15423 - 8)
    const startingEngineTSN = 2331.4; // Engine TSN baseline (2335.3 - 3.9)
    const startingEngineCSN = 3427; // Engine CSN baseline (3435 - 8)
    const startingEngineTSO = 0;
    const startingEngineCSO = 0;
    const startingPropTSO = 2331.4; // Prop TSO baseline (2335.3 - 3.9)
    const startingPropTSN = 11240.7; // Prop TSN baseline (11244.6 - 3.9)
    const startingCofAHours = 1341.5; // CofA Hours baseline (1345.4 - 3.9)
    const startingHoursToCheck = 174.7; // Hours to Check baseline (170.8 + 3.9)
    
    // Calculate cumulative values up to and including this flight
    let currentAircraftHrs = startingAircraftHrs;
    let currentAircraftCyc = startingAircraftCyc;
    let currentEngineTSN = startingEngineTSN;
    let currentEngineCSN = startingEngineCSN;
    let currentEngineTSO = startingEngineTSO;
    let currentEngineCSO = startingEngineCSO;
    let currentEngineOH = 2768.6; // Engine OH baseline (2764.7 + 3.9)
    let currentPropTSN = startingPropTSN;
    let currentPropTSO = startingPropTSO;
    let currentPropOH = 668.6; // Prop OH baseline (664.7 + 3.9)
    let currentCofAHours = startingCofAHours;
    let currentHoursToCheck = startingHoursToCheck;
    
    // Apply all flights up to and including the current flight
    for (let i = 0; i <= index; i++) {
      const flightLog = sortedLogs[i];
      currentAircraftHrs += flightLog.blockHrs;
      currentAircraftCyc += flightLog.cycles;
      currentEngineTSN += flightLog.blockHrs;
      currentEngineCSN += flightLog.cycles;
      currentEngineTSO = startingEngineTSO; // Remains 0 until engine overhaul
      currentEngineCSO = startingEngineCSO; // Remains 0 until engine overhaul
      currentEngineOH -= flightLog.blockHrs;
      currentPropTSN += flightLog.blockHrs;
      currentPropTSO += flightLog.blockHrs;
      currentPropOH -= flightLog.blockHrs;
      
      // Handle CofA Hours (reset to 0 when CofA reset is checked)
      if ((flightLog as any).cofaReset) {
        currentCofAHours = 0;
      } else {
        currentCofAHours += flightLog.blockHrs;
      }
      
      // Handle Engine OH reset
      if ((flightLog as any).engineOHReset) {
        currentEngineOH = aircraft.EngineTBO || 5100;
      }
      
      // Handle Prop OH reset
      if ((flightLog as any).propOHReset) {
        currentPropOH = aircraft.PropTBO || 3000;
      }
      
      // Handle hours to check
      if ((flightLog as any).hoursToCheck && (flightLog as any).hoursToCheck > 0) {
        if ((flightLog as any).isExtension) {
          // Extension: previous hours to check - flight hours + extension hours
          currentHoursToCheck = currentHoursToCheck - flightLog.blockHrs + (flightLog as any).hoursToCheck;
        } else {
          // Check: replace with check hours (hours added becomes the new hours to check)
          currentHoursToCheck = (flightLog as any).hoursToCheck;
        }
      } else {
        // Regular flight: previous hours to check - flight hours
        currentHoursToCheck -= flightLog.blockHrs;
      }
    }
    
    return {
      aircraftTSN: currentAircraftHrs.toFixed(1),
      aircraftCSN: currentAircraftCyc.toString(),
      engineTSN: currentEngineTSN.toFixed(1),
      engineCSN: currentEngineCSN.toString(),
      engineTSO: currentEngineTSO.toFixed(1),
      engineCSO: currentEngineCSO.toString(),
      engineOH: currentEngineOH.toFixed(1),
      propTSN: currentPropTSN.toFixed(1),
      propTSO: currentPropTSO.toFixed(1),
      propOH: currentPropOH.toFixed(1),
      CofA_Hours: currentCofAHours.toFixed(1),
      hoursToCheck: currentHoursToCheck.toFixed(1)
    };
  };

  return (
    <div className="space-y-6">
      {/* Current Hours Summary */}
      <div className="rounded border border-gray-200 bg-white p-4">
        <h3 className="text-lg font-semibold mb-4">Current Hours & Cycles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded bg-blue-50 p-4">
            <div className="text-sm text-gray-600 mb-1">Aircraft Total</div>
            <div className="text-2xl font-mono font-bold text-blue-600">{aircraft.currentHrs.toFixed(1)}h</div>
            <div className="text-sm text-gray-500">{aircraft.currentCyc} cycles</div>
            <div className="text-xs text-gray-400 mt-1">
              CofA: {((aircraft as any).CofA_Hours || 0).toFixed(1)}h / Check: {(aircraft.hoursToCheck || 0).toFixed(1)}h
            </div>
            <div className="text-xs text-gray-400 mt-1">
              PropOH: {aircraft.propOH?.toFixed(1) || '0.0'}h
            </div>
            <div className="text-xs text-gray-400 mt-1">
              EngineOH: {aircraft.engineOH?.toFixed(1) || '0.0'}h
            </div>
          </div>
          
          {engines.map(engine => (
            <div key={engine.id} className="rounded bg-green-50 p-4">
              <div className="text-sm text-gray-600 mb-1">Engine {engine.position}</div>
              <div className="text-lg font-mono font-semibold text-green-600">{calculateEngineTSN(engine).toFixed(1)}h</div>
              <div className="text-sm text-gray-500">{calculateEngineCSN(engine)} cycles</div>
              <div className="text-xs text-gray-400 mt-1">
                TSO: {(engine.tsoHrs || 0).toFixed(1)}h / {engine.cso || 0}c
              </div>
            </div>
          ))}
          
          {props.map(prop => (
            <div key={prop.id} className="rounded bg-orange-50 p-4">
              <div className="text-sm text-gray-600 mb-1">Prop {prop.position}</div>
              <div className="text-lg font-mono font-semibold text-orange-600">{calculatePropTSN(prop).toFixed(1)}h</div>
              <div className="text-sm text-gray-500">{calculatePropCSN(prop)} cycles</div>
              <div className="text-xs text-gray-400 mt-1">
                TSO: {(prop.tsoHrs || 0).toFixed(1)}h / {prop.cso || 0}c
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => setIsAddingFlight(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add Flight Log / Check Extension
        </button>
      </div>

      {/* Flight Log Entries */}
      <div className="rounded border border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Flight Log Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Techlog #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block Hrs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cycles</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aircraft TSN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aircraft CSN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine TSN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine CSN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine TSO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine CSO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine OH</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prop TSN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prop TSO</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prop OH</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CofA Hours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours to Check</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flightLogs.map((log, index) => {
                const values = calculateIndividualFlightValues(log, index);
                return (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{log.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(log as any).techlogNumber || (log as any).techLogNo || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{log.blockHrs.toFixed(1)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{log.cycles}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {(log as any).cofaReset ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          CofA Reset
                        </span>
                      ) : (log as any).engineOHReset ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Engine O/H
                        </span>
                      ) : (log as any).propOHReset ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                          Prop O/H
                        </span>
                      ) : (log as any).isExtension ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Extension
                        </span>
                      ) : ((log as any).hoursToCheck && (log as any).hoursToCheck > 0) ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Check
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Flight
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.aircraftTSN}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.aircraftCSN}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.engineTSN}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.engineCSN}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.engineTSO}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.engineCSO}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.engineOH}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.propTSN}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.propTSO}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.propOH}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.CofA_Hours}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{values.hoursToCheck}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      {/* Check Extensions */}
      {checkExtensions.length > 0 && (
        <div className="rounded border border-gray-200 bg-white">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Check Extensions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours Granted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {checkExtensions.map((extension, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 text-sm text-gray-900">{extension.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{extension.checkType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{extension.hoursGranted.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{extension.reason}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{extension.reference || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Flight Log Modal */}
      {isAddingFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Flight Log Entry</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={newFlightEntry.date}
                  onChange={(e) => setNewFlightEntry(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Techlog Number</label>
                <input
                  type="text"
                  value={newFlightEntry.techlogNumber}
                  onChange={(e) => setNewFlightEntry(prev => ({ ...prev, techlogNumber: e.target.value }))}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => {
                    const value = e.target.value as 'regular' | 'check' | 'extension' | 'cofa' | 'engineoh' | 'propoh';
                    setSelectedType(value);
                    if (value === "regular") {
                      setNewFlightEntry(prev => ({ ...prev, isExtension: false, hoursToCheck: 0, cofaReset: false, engineOHReset: false, propOHReset: false }));
                    } else if (value === "cofa") {
                      setNewFlightEntry(prev => ({ ...prev, isExtension: false, hoursToCheck: 0, cofaReset: true, engineOHReset: false, propOHReset: false }));
                    } else if (value === "engineoh") {
                      setNewFlightEntry(prev => ({ ...prev, isExtension: false, hoursToCheck: 0, cofaReset: false, engineOHReset: true, propOHReset: false }));
                    } else if (value === "propoh") {
                      setNewFlightEntry(prev => ({ ...prev, isExtension: false, hoursToCheck: 0, cofaReset: false, engineOHReset: false, propOHReset: true }));
                    } else {
                      setNewFlightEntry(prev => ({ ...prev, isExtension: value === "extension", cofaReset: false, engineOHReset: false, propOHReset: false }));
                    }
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="regular">Regular Flight</option>
                  <option value="check">Check (replaces hoursToCheck)</option>
                  <option value="extension">Extension (adds to existing hoursToCheck)</option>
                  <option value="cofa">CofA (resets CofA_Hours to 0)</option>
                  <option value="engineoh">Engine O/H (resets Engine OH to TBO)</option>
                  <option value="propoh">Prop O/H (resets Prop OH to TBO)</option>
                </select>
              </div>
              {(selectedType === 'check' || selectedType === 'extension') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Add Hours</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFlightEntry.hoursToCheck}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numericValue = value === '' ? 0 : parseFloat(value) || 0;
                      setNewFlightEntry(prev => ({ ...prev, hoursToCheck: numericValue }));
                    }}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Block Hours</label>
                <input
                  type="number"
                  step="0.1"
                  value={newFlightEntry.blockHrs}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
                    setNewFlightEntry(prev => ({ ...prev, blockHrs: numericValue }));
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cycles (Landings)</label>
                <input
                  type="number"
                  value={newFlightEntry.cycles}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value === '' ? 0 : parseInt(value) || 0;
                    setNewFlightEntry(prev => ({ ...prev, cycles: numericValue }));
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddingFlight(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFlight}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

