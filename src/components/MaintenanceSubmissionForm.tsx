"use client";

import { useState } from "react";
import { Aircraft, MaintenanceType, MaintenanceStatus } from "@/lib/types";

interface MaintenanceSubmissionFormProps {
  aircraft: Aircraft[];
  onSubmit: (maintenanceData: any) => void;
  onCancel: () => void;
}

const MaintenanceSubmissionForm = ({ aircraft, onSubmit, onCancel }: MaintenanceSubmissionFormProps) => {
  const [formData, setFormData] = useState({
    aircraftId: "",
    maintenanceType: "" as MaintenanceType | "",
    startDate: "",
    endDate: "",
    description: "",
    workPerformed: "",
    performedBy: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const maintenanceTypes: { value: MaintenanceType; label: string }[] = [
    { value: "SCHEDULED", label: "Scheduled" },
    { value: "UNSCHEDULED", label: "Unscheduled" },
    { value: "INSPECTION", label: "Inspection" },
    { value: "REPAIR", label: "Repair" },
    { value: "OVERHAUL", label: "Overhaul" },
    { value: "PREVENTIVE", label: "Preventive" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate downtime hours automatically
      const startTime = new Date(formData.startDate).getTime();
      const endTime = new Date(formData.endDate).getTime();
      const calculatedDowntimeHours = Math.round((endTime - startTime) / (1000 * 60 * 60));

      const maintenanceData = {
        ...formData,
        status: "COMPLETED" as MaintenanceStatus,
        downtimeHours: calculatedDowntimeHours
      };

      onSubmit(maintenanceData);
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculatedDowntime = formData.startDate && formData.endDate ? 
    Math.round((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60)) : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Add Maintenance Record</h3>
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
        {/* Row 1: Aircraft and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aircraft *</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              {maintenanceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="datetime-local"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input
              type="datetime-local"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Row 3: Downtime Display */}
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-blue-800">Downtime:</span>
            <span className="text-sm font-semibold text-blue-900">
              {calculatedDowntime > 0 ? `${calculatedDowntime} hours` : "Enter dates"}
            </span>
          </div>
        </div>

        {/* Row 4: Description and Performed By */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 200 hour inspection"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Performed By *</label>
            <input
              type="text"
              name="performedBy"
              value={formData.performedBy}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., John Smith"
            />
          </div>
        </div>

        {/* Row 5: Work Performed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Performed *</label>
          <textarea
            name="workPerformed"
            value={formData.workPerformed}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the work performed..."
          />
        </div>

        {/* Row 6: Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Additional notes..."
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
            disabled={isSubmitting || calculatedDowntime <= 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Maintenance Record"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceSubmissionForm;