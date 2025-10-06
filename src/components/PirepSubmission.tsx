"use client";

import { useState } from "react";
import { PIREPCategory, PIREPSeverity } from "@/lib/types";

interface PirepSubmissionProps {
  aircraftId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PirepSubmission = ({ aircraftId, onSuccess, onCancel }: PirepSubmissionProps) => {
  const [formData, setFormData] = useState({
    reportedBy: "",
    reportDate: new Date().toISOString().split('T')[0],
    category: "" as PIREPCategory | "",
    severity: "" as PIREPSeverity | "",
    title: "",
    description: "",
    systemAffected: "",
    flightPhase: "",
    weatherConditions: "",
    altitude: "",
    airspeed: "",
    actionTaken: "",
    followUpRequired: false,
    followUpNotes: "",
    // Engine-specific fields (only shown when category = "ENGINE")
    engineNumber: "",
    engineEventType: "",
    oilTemperature: "",
    oilPressure: "",
    vibrationLevel: "",
    egtTemperature: "",
    n1RPM: "",
    n2RPM: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories: { value: PIREPCategory; label: string }[] = [
    { value: "ENGINE", label: "Engine" },
    { value: "AVIONICS", label: "Avionics" },
    { value: "HYDRAULIC", label: "Hydraulic" },
    { value: "ELECTRICAL", label: "Electrical" },
    { value: "STRUCTURAL", label: "Structural" },
    { value: "PERFORMANCE", label: "Performance" },
    { value: "ENVIRONMENTAL", label: "Environmental" },
    { value: "NAVIGATION", label: "Navigation" },
    { value: "COMMUNICATION", label: "Communication" },
    { value: "LANDING_GEAR", label: "Landing Gear" },
    { value: "PNEUMATIC", label: "Pneumatic" },
    { value: "FUEL_SYSTEM", label: "Fuel System" },
    { value: "OTHER", label: "Other" }
  ];

  const severities: { value: PIREPSeverity; label: string; description: string }[] = [
    { value: "INFORMATIONAL", label: "Informational", description: "General observation, no action required" },
    { value: "MINOR", label: "Minor", description: "Minor issue, monitor for trends" },
    { value: "MAJOR", label: "Major", description: "Significant issue, requires investigation" },
    { value: "CRITICAL", label: "Critical", description: "Serious issue, immediate action required" }
  ];

  const flightPhases = [
    { value: "PRE_FLIGHT", label: "Pre-flight" },
    { value: "TAXI", label: "Taxi" },
    { value: "TAKEOFF", label: "Takeoff" },
    { value: "CLIMB", label: "Climb" },
    { value: "CRUISE", label: "Cruise" },
    { value: "DESCENT", label: "Descent" },
    { value: "APPROACH", label: "Approach" },
    { value: "LANDING", label: "Landing" },
    { value: "POST_FLIGHT", label: "Post-flight" }
  ];

  const engineEventTypes = [
    { value: "INFLIGHT_SHUTDOWN", label: "In-flight Shutdown" },
    { value: "FLAME_OUT", label: "Flame Out" },
    { value: "OVERSPEED", label: "Overspeed" },
    { value: "OVERTEMP", label: "Overtemperature" },
    { value: "VIBRATION_ALARM", label: "Vibration Alarm" },
    { value: "OIL_PRESSURE_LOW", label: "Low Oil Pressure" },
    { value: "FUEL_PRESSURE_LOW", label: "Low Fuel Pressure" },
    { value: "OTHER", label: "Other Engine Issue" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch('/api/pireps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId,
          ...formData,
          altitude: formData.altitude ? parseInt(formData.altitude) : undefined,
          airspeed: formData.airspeed ? parseInt(formData.airspeed) : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit PIREP');
      }

      const newPirep = await response.json();
      console.log('PIREP submitted successfully:', newPirep);
      
      // Reset form
      setFormData({
        reportedBy: "",
        reportDate: new Date().toISOString().split('T')[0],
        category: "" as PIREPCategory | "",
        severity: "" as PIREPSeverity | "",
        title: "",
        description: "",
        systemAffected: "",
        flightPhase: "",
        weatherConditions: "",
        altitude: "",
        airspeed: "",
        actionTaken: "",
        followUpRequired: false,
        followUpNotes: "",
        // Engine-specific fields
        engineNumber: "",
        engineEventType: "",
        oilTemperature: "",
        oilPressure: "",
        vibrationLevel: "",
        egtTemperature: "",
        n1RPM: "",
        n2RPM: ""
      });

      onSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSeverity = severities.find(s => s.value === formData.severity);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pilot Report (PIREP)</h2>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reported By *
            </label>
            <input
              type="text"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pilot name/ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Date *
            </label>
            <input
              type="date"
              name="reportDate"
              value={formData.reportDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category and Severity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity *
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select severity</option>
              {severities.map(sev => (
                <option key={sev.value} value={sev.value}>
                  {sev.label}
                </option>
              ))}
            </select>
            {selectedSeverity && (
              <p className="text-xs text-gray-500 mt-1">{selectedSeverity.description}</p>
            )}
          </div>
        </div>

        {/* Title and System */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of the issue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Affected *
          </label>
          <input
            type="text"
            name="systemAffected"
            value={formData.systemAffected}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Left Engine, Hydraulic System A, GPS Unit"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of what was observed..."
          />
        </div>

        {/* Flight Conditions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Phase
            </label>
            <select
              name="flightPhase"
              value={formData.flightPhase}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select phase</option>
              {flightPhases.map(phase => (
                <option key={phase.value} value={phase.value}>
                  {phase.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altitude (ft)
            </label>
            <input
              type="number"
              name="altitude"
              value={formData.altitude}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 8000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airspeed (kts)
            </label>
            <input
              type="number"
              name="airspeed"
              value={formData.airspeed}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 150"
            />
          </div>
        </div>

        {/* Engine-Specific Fields (only show when category = "ENGINE") */}
        {formData.category === "ENGINE" && (
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Engine Details</h4>
            
            {/* Engine Number and Event Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engine Number *
                </label>
                <select
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select engine</option>
                  <option value="1">Engine 1</option>
                  <option value="2">Engine 2</option>
                  <option value="3">Engine 3</option>
                  <option value="4">Engine 4</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engine Event Type *
                </label>
                <select
                  name="engineEventType"
                  value={formData.engineEventType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select event type</option>
                  {engineEventTypes.map(event => (
                    <option key={event.value} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Engine Parameters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oil Temperature (°C)
                </label>
                <input
                  type="number"
                  name="oilTemperature"
                  value={formData.oilTemperature}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 85"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Oil Pressure (PSI)
                </label>
                <input
                  type="number"
                  name="oilPressure"
                  value={formData.oilPressure}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vibration Level
                </label>
                <input
                  type="number"
                  name="vibrationLevel"
                  value={formData.vibrationLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  EGT Temperature (°C)
                </label>
                <input
                  type="number"
                  name="egtTemperature"
                  value={formData.egtTemperature}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 650"
                />
              </div>
            </div>

            {/* RPM Readings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N1 RPM (%)
                </label>
                <input
                  type="number"
                  name="n1RPM"
                  value={formData.n1RPM}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 95"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N2 RPM (%)
                </label>
                <input
                  type="number"
                  name="n2RPM"
                  value={formData.n2RPM}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 100"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Weather Conditions
          </label>
          <input
            type="text"
            name="weatherConditions"
            value={formData.weatherConditions}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Turbulence, Icing, Crosswinds"
          />
        </div>

        {/* Action Taken */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Action Taken
          </label>
          <textarea
            name="actionTaken"
            value={formData.actionTaken}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What action was taken, if any?"
          />
        </div>

        {/* Follow-up */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="followUpRequired"
            checked={formData.followUpRequired}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm font-medium text-gray-700">
            Follow-up required
          </label>
        </div>

        {formData.followUpRequired && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Notes
            </label>
            <textarea
              name="followUpNotes"
              value={formData.followUpNotes}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What follow-up is needed?"
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit PIREP'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PirepSubmission;
