"use client";

import React, { useState } from "react";
import { Aircraft, ComponentStatus, RemovalReason } from "@/lib/types";

interface ComponentSubmissionFormProps {
  aircraft: Aircraft[];
  onSubmit: (componentData: any) => void;
  onCancel: () => void;
}

const ComponentSubmissionForm = ({ aircraft, onSubmit, onCancel }: ComponentSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    partNumber: "",
    serialNumber: "",
    aircraftId: "",
    componentType: "",
    ataSystem: "",
    description: "",
    status: "REMOVED" as ComponentStatus,
    installationDate: "",
    removalDate: "",
    removalReason: "UNSCHEDULED" as RemovalReason | "",
    totalFlightHours: 0,
    totalFlightCycles: 0,
    condition: "NEW",
    location: "",
    cost: "",
    supplier: "",
    notes: ""
  });

  const [existingComponents, setExistingComponents] = useState<any[]>([]);
  const [selectedExistingComponent, setSelectedExistingComponent] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing components on mount
  React.useEffect(() => {
    const loadExistingComponents = async () => {
      try {
        const response = await fetch('/api/components');
        if (response.ok) {
          const components = await response.json();
          setExistingComponents(components);
        }
      } catch (error) {
        console.error('Error loading components:', error);
      }
    };
    loadExistingComponents();
  }, []);

  const componentTypes = [
    "ENGINE",
    "PROPELLER", 
    "AVIONICS",
    "LANDING_GEAR",
    "ELECTRICAL",
    "HYDRAULIC",
    "FUEL_SYSTEM",
    "AIR_CONDITIONING",
    "STRUCTURAL",
    "INSTRUMENT",
    "NAVIGATION",
    "COMMUNICATION",
    "OTHER"
  ];

  const ataSystems = [
    "21 - AIR CONDITIONING",
    "22 - AUTO FLIGHT",
    "23 - COMMUNICATIONS", 
    "24 - ELECTRICAL POWER",
    "25 - EQUIPMENT/FURNISHINGS",
    "26 - FIRE PROTECTION",
    "27 - FLIGHT CONTROLS",
    "28 - FUEL",
    "29 - HYDRAULIC POWER",
    "30 - ICE AND RAIN PROTECTION",
    "31 - INDICATING/RECORDING SYSTEMS",
    "32 - LANDING GEAR",
    "33 - LIGHTS",
    "34 - NAVIGATION",
    "35 - OXYGEN",
    "36 - PNEUMATIC",
    "38 - WATER/WASTE",
    "49 - AUXILIARY POWER UNIT",
    "52 - DOORS",
    "53 - FUSELAGE",
    "54 - NACELLES/PYLONS",
    "55 - STABILIZERS",
    "56 - WINDOWS",
    "57 - WINGS",
    "71 - POWER PLANT",
    "72 - ENGINE",
    "73 - ENGINE FUEL AND CONTROL",
    "74 - IGNITION",
    "75 - AIR",
    "76 - ENGINE CONTROLS",
    "77 - ENGINE INDICATING",
    "78 - EXHAUST",
    "79 - OIL",
    "80 - STARTING",
    "81 - TURBINES",
    "82 - WATER INJECTION",
    "83 - ACCESSORY GEARBOXES"
  ];

  const componentStatuses: { value: ComponentStatus; label: string }[] = [
    { value: "INSTALLED", label: "Installed" },
    { value: "REMOVED", label: "Removed" },
    { value: "OVERHAULED", label: "Overhauled" },
    { value: "SCRAPPED", label: "Scrapped" },
    { value: "IN_STOCK", label: "In Stock" }
  ];

  const removalReasons: { value: RemovalReason; label: string }[] = [
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "UNSCHEDULED", label: "Unscheduled" },
    { value: "FAILURE", label: "Failure" },
    { value: "OVERHAUL", label: "Overhaul" },
    { value: "INSPECTION", label: "Inspection" }
  ];

  const calculateHoursCyclesAtRemoval = async (removalDate: string) => {
    if (!removalDate || !formData.aircraftId) return { hours: 0, cycles: 0 };
    
    try {
      // Fetch flight log entries for the aircraft
      const response = await fetch(`/api/flight-logs?aircraftId=${formData.aircraftId}`);
      if (!response.ok) {
        console.log('API response not ok:', response.status);
        return { hours: 0, cycles: 0 };
      }
      
      const flightLogsData = await response.json();
      console.log('Flight logs data:', flightLogsData);
      
      const removalDateTime = new Date(removalDate);
      
      // Extract flightLogs array from the response object
      const flightLogs = Array.isArray(flightLogsData.flightLogs) ? flightLogsData.flightLogs : [];
      console.log('Flight logs array:', flightLogs);
      
      // Calculate cumulative TSN/CSN up to the removal date
      const relevantLogs = flightLogs
        .filter((log: any) => new Date(log.date) <= removalDateTime)
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log('Relevant logs for removal date:', relevantLogs);
      
      if (relevantLogs.length > 0) {
        // Starting values (before first flight on 2025-08-21)
        const startingAircraftHrs = 12097.5; // Aircraft TSN baseline
        const startingAircraftCyc = 15415; // Aircraft CSN baseline
        
        // Calculate cumulative values up to removal date
        let cumulativeHours = startingAircraftHrs;
        let cumulativeCycles = startingAircraftCyc;
        
        for (const log of relevantLogs) {
          cumulativeHours += log.blockHrs;
          cumulativeCycles += log.cycles;
        }
        
        console.log('Calculated values:', { hours: cumulativeHours, cycles: cumulativeCycles });
        
        return { 
          hours: cumulativeHours,
          cycles: cumulativeCycles
        };
      }
      
      console.log('No relevant logs found');
      return { hours: 0, cycles: 0 };
    } catch (error) {
      console.error('Error fetching flight logs:', error);
      return { hours: 0, cycles: 0 };
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      return newData;
    });
    
    // If removal date is being changed, recalculate hours/cycles from flight logs
    if (name === 'removalDate' && value) {
      const { hours, cycles } = await calculateHoursCyclesAtRemoval(value);
      setFormData(prev => ({
        ...prev,
        totalFlightHours: hours,
        totalFlightCycles: cycles
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const componentData = {
        ...formData,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        removalReason: formData.removalReason || undefined,
        removalDate: formData.removalDate || undefined,
        installationDate: formData.installationDate || undefined
      };

      onSubmit(componentData);
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Report Component Removal</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Component Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Select Component</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose from existing components</label>
              <select
                value={selectedExistingComponent}
                onChange={(e) => {
                  setSelectedExistingComponent(e.target.value);
                  if (e.target.value) {
                    const component = existingComponents.find(c => c.id === e.target.value);
                    if (component) {
                      // Get the aircraft to calculate hours/cycles at removal time
                      const selectedAircraft = aircraft.find(a => a.id === component.aircraftId);
                      // Calculate hours/cycles at removal time based on removal date
                      // This will be updated when removal date is selected
                      const removalHours = 0; // Will be calculated when removal date is set
                      const removalCycles = 0; // Will be calculated when removal date is set
                      
                      setFormData(prev => ({
                        ...prev,
                        partNumber: component.partNumber,
                        serialNumber: component.serialNumber,
                        componentType: component.componentType,
                        ataSystem: component.ataSystem,
                        description: component.description,
                        aircraftId: component.aircraftId,
                        installationDate: component.installationDate || component.installedDate,
                        totalFlightHours: removalHours,
                        totalFlightCycles: removalCycles
                      }));
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select existing component...</option>
                {existingComponents
                  .filter(comp => comp.status === "INSTALLED")
                  .map(component => (
                  <option key={component.id} value={component.id}>
                    {component.description} - {component.partNumber} (SN: {component.serialNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-600">
              Select a component to report its removal. All components must come from the existing aircraft inventory.
            </div>
          </div>
        </div>

        {/* Row 1: Part Number and Serial Number (Read-only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.partNumber || "Select a component above"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.serialNumber || "Select a component above"}
            </div>
          </div>
        </div>

        {/* Row 2: Component Type and ATA System */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Component Type</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.componentType || "Select a component above"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ATA System {formData.ataSystem === "UNKNOWN" && <span className="text-red-500">*</span>}</label>
            {formData.ataSystem === "UNKNOWN" ? (
              <select
                name="ataSystem"
                value={formData.ataSystem}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UNKNOWN">Select ATA system...</option>
                {ataSystems.map(system => (
                  <option key={system} value={system}>
                    {system}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {formData.ataSystem || "Select a component above"}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Aircraft and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {aircraft.find(a => a.id === formData.aircraftId)?.registration || "Select a component above"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              REMOVED
            </div>
          </div>
        </div>

        {/* Row 4: Installation and Removal Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installation Date</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {formData.installationDate ? new Date(formData.installationDate).toLocaleDateString() : "Select a component above"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Removal Date *</label>
            <input
              type="date"
              name="removalDate"
              value={formData.removalDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 5: Removal Reason and Auto-calculated Hours/Cycles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Removal Reason *</label>
            <select
              name="removalReason"
              value={formData.removalReason}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select reason</option>
              {removalReasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft TSN at Removal</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-900 font-semibold">
              {formData.totalFlightHours > 0 ? `${formData.totalFlightHours.toFixed(1)} hours` : "Enter removal date above"}
            </div>
            <p className="text-xs text-gray-500 mt-1">From flight log entries at removal date</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft CSN at Removal</label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-900 font-semibold">
              {formData.totalFlightCycles > 0 ? `${formData.totalFlightCycles.toLocaleString()} cycles` : "Enter removal date above"}
            </div>
            <p className="text-xs text-gray-500 mt-1">From flight log entries at removal date</p>
          </div>
        </div>

        {/* Row 6: Description (Read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
            {formData.description || "Select a component above"}
          </div>
        </div>

        {/* Row 7: Cost and Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (USD)</label>
            <input
              type="number"
              step="0.01"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2500.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Boeing, Airbus"
            />
          </div>
        </div>

        {/* Row 8: Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes about the component..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedExistingComponent}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Reporting..." : "Report Component Removal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComponentSubmissionForm;
