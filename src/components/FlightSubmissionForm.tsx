"use client";

import { useState } from "react";
import { Aircraft, FlightDelayReason, FlightStatus } from "@/lib/types";

interface FlightSubmissionFormProps {
  aircraft: Aircraft[];
  onSubmit: (flightData: any) => void;
  onCancel: () => void;
}

const FlightSubmissionForm = ({ aircraft, onSubmit, onCancel }: FlightSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    flightNumber: "",
    aircraftId: "",
    scheduledDeparture: "",
    scheduledArrival: "",
    actualDeparture: "",
    actualArrival: "",
    delayReason: "" as FlightDelayReason | "",
    status: "DELAYED" as FlightStatus,
    cancellationReason: "",
    diversionReason: "",
    departureAirport: "",
    arrivalAirport: "",
    additionalDetails: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const delayReasons: { value: FlightDelayReason; label: string }[] = [
    { value: "ENGINE_ISSUES", label: "Engine Issues" },
    { value: "AVIONICS_PROBLEMS", label: "Avionics Problems" },
    { value: "LANDING_GEAR", label: "Landing Gear" },
    { value: "ELECTRICAL_SYSTEMS", label: "Electrical Systems" },
    { value: "HYDRAULIC_SYSTEMS", label: "Hydraulic Systems" },
    { value: "FUEL_SYSTEM", label: "Fuel System" },
    { value: "AIR_CONDITIONING", label: "Air Conditioning" },
    { value: "WEATHER", label: "Weather" },
    { value: "AIR_TRAFFIC", label: "Air Traffic Control" },
    { value: "PASSENGER", label: "Passenger Related" },
    { value: "CREW", label: "Crew Related" },
    { value: "GROUND_EQUIPMENT", label: "Ground Equipment" },
    { value: "SECURITY", label: "Security" },
    { value: "OTHER_TECHNICAL", label: "Other Technical" }
  ];

  const flightStatuses: { value: FlightStatus; label: string }[] = [
    { value: "DELAYED", label: "Delayed" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "DIVERTED", label: "Diverted" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate delay minutes automatically
  const calculateDelayMinutes = () => {
    if (!formData.scheduledDeparture || !formData.actualDeparture) {
      return 0;
    }
    
    const scheduled = new Date(formData.scheduledDeparture);
    const actual = new Date(formData.actualDeparture);
    const delayMs = actual.getTime() - scheduled.getTime();
    const delayMinutes = Math.round(delayMs / (1000 * 60));
    
    return delayMinutes > 0 ? delayMinutes : 0;
  };

  const delayMinutes = calculateDelayMinutes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const flightData = {
        ...formData,
        delayMinutes: delayMinutes > 0 ? delayMinutes : undefined,
        delayReason: formData.delayReason || undefined,
        cancellationReason: formData.cancellationReason || undefined,
        diversionReason: formData.diversionReason || undefined,
        additionalDetails: formData.additionalDetails || undefined,
        flightHours: 0, // Default values for API compatibility
        flightCycles: 1
      };

      onSubmit(flightData);
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Add Flight Data</h3>
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
        {/* Basic Flight Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Number *
            </label>
            <input
              type="text"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., AA123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft *
            </label>
            <select
              name="aircraftId"
              value={formData.aircraftId}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select aircraft</option>
              {aircraft.map(ac => (
                <option key={ac.id} value={ac.id}>
                  {ac.registration} ({ac.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Departure *
            </label>
            <input
              type="datetime-local"
              name="scheduledDeparture"
              value={formData.scheduledDeparture}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Arrival *
            </label>
            <input
              type="datetime-local"
              name="scheduledArrival"
              value={formData.scheduledArrival}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actual Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Departure
            </label>
            <input
              type="datetime-local"
              name="actualDeparture"
              value={formData.actualDeparture}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Arrival
            </label>
            <input
              type="datetime-local"
              name="actualArrival"
              value={formData.actualArrival}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Route Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Airport *
            </label>
            <input
              type="text"
              name="departureAirport"
              value={formData.departureAirport}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., KJFK"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival Airport *
            </label>
            <input
              type="text"
              name="arrivalAirport"
              value={formData.arrivalAirport}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., KLAX"
            />
          </div>
        </div>

        {/* Flight Status and Delays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Flight Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {flightStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calculated Delay
            </label>
            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
              {delayMinutes > 0 ? `${delayMinutes} minutes` : "On time"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay Reason {delayMinutes > 0 && <span className="text-red-500">*</span>}
            </label>
            <select
              name="delayReason"
              value={formData.delayReason}
              onChange={handleInputChange}
              required={delayMinutes > 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select reason</option>
              {delayReasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cancellation/Diversion Reasons */}
        {(formData.status === "CANCELLED" || formData.status === "DIVERTED") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.status === "CANCELLED" ? "Cancellation Reason" : "Diversion Reason"}
            </label>
            <input
              type="text"
              name={formData.status === "CANCELLED" ? "cancellationReason" : "diversionReason"}
              value={formData.status === "CANCELLED" ? formData.cancellationReason : formData.diversionReason}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.status === "CANCELLED" ? "e.g., engine failure" : "e.g., weather diversion"}
            />
          </div>
        )}

        {/* Additional Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details
          </label>
          <textarea
            name="additionalDetails"
            value={formData.additionalDetails}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide specific details about the issue, component affected, actions taken, etc."
          />
        </div>


        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Flight'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlightSubmissionForm;

