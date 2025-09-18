"use client";
import { useState, useEffect } from "react";
import { Aircraft, GroundingRecord, GroundingReason, SpareStatus } from "@/lib/types";

interface GroundingManagementProps {
  aircraft: Aircraft;
  onAircraftUpdate?: (updatedAircraft: Aircraft) => void;
}

const calculateDaysOnGround = (groundingDate: string, ungroundingDate?: string): number => {
  const start = new Date(groundingDate);
  const end = ungroundingDate ? new Date(ungroundingDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getSpareStatusColor = (status: SpareStatus): string => {
  switch (status) {
    case "Not Required":
      return "bg-gray-100 text-gray-800";
    case "Required":
      return "bg-red-100 text-red-800";
    case "Ordered":
      return "bg-yellow-100 text-yellow-800";
    case "In Transit":
      return "bg-blue-100 text-blue-800";
    case "Received":
      return "bg-green-100 text-green-800";
    case "Installed":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const groundingReasons: GroundingReason[] = [
  "Maintenance",
  "Inspection", 
  "Component Failure",
  "Weather",
  "Regulatory",
  "Spare Parts",
  "Engine Overhaul",
  "Avionics",
  "Structural",
  "Other"
];

const spareStatuses: SpareStatus[] = [
  "Not Required",
  "Required",
  "Ordered",
  "In Transit",
  "Received",
  "Installed"
];

export const GroundingManagement = ({ aircraft, onAircraftUpdate }: GroundingManagementProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GroundingRecord | null>(null);
  const [formData, setFormData] = useState<Partial<GroundingRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentAircraft, setCurrentAircraft] = useState<Aircraft>(aircraft);

  const groundingStatus = currentAircraft.groundingStatus;
  const isGrounded = groundingStatus?.isGrounded || false;
  const currentRecord = groundingStatus?.currentRecord;

  useEffect(() => {
    setCurrentAircraft(aircraft);
  }, [aircraft]);

  const handleOpenModal = (record?: GroundingRecord) => {
    if (record) {
      setIsEditing(true);
      setEditingRecord(record);
      setFormData({
        reason: record.reason,
        description: record.description,
        planOfAction: record.planOfAction,
        sparePartsRequired: record.sparePartsRequired,
        spareStatus: record.spareStatus,
        spareOrderDate: record.spareOrderDate,
        spareExpectedDate: record.spareExpectedDate,
        spareReceivedDate: record.spareReceivedDate,
        estimatedUngroundingDate: record.estimatedUngroundingDate
      });
    } else {
      setIsEditing(false);
      setEditingRecord(null);
      setFormData({
        reason: "Maintenance",
        description: "",
        planOfAction: "",
        sparePartsRequired: false,
        spareStatus: "Not Required"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingRecord(null);
    setFormData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleGroundAircraft = async () => {
    setIsSaving(true);
    try {
      const newRecord: Partial<GroundingRecord> = {
        aircraftId: aircraft.id,
        isGrounded: true,
        groundingDate: new Date().toISOString().split('T')[0],
        reason: formData.reason,
        description: formData.description,
        planOfAction: formData.planOfAction,
        sparePartsRequired: formData.sparePartsRequired || false,
        spareStatus: formData.spareStatus || "Not Required",
        spareOrderDate: formData.spareOrderDate,
        spareExpectedDate: formData.spareExpectedDate,
        estimatedUngroundingDate: formData.estimatedUngroundingDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response = await fetch('/api/aircraft/grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          action: 'ground',
          record: newRecord
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to ground aircraft');
      }

      const updatedAircraft = await response.json();
      setCurrentAircraft(updatedAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error grounding aircraft:', error);
      alert('Failed to ground aircraft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUngroundAircraft = async () => {
    if (!currentRecord) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/aircraft/grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          action: 'unground',
          recordId: currentRecord.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unground aircraft');
      }

      const updatedAircraft = await response.json();
      setCurrentAircraft(updatedAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }
    } catch (error) {
      console.error('Error ungrounding aircraft:', error);
      alert('Failed to unground aircraft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!editingRecord) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/aircraft/grounding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          recordId: editingRecord.id,
          updates: formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grounding record');
      }

      const updatedAircraft = await response.json();
      setCurrentAircraft(updatedAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error updating grounding record:', error);
      alert('Failed to update grounding record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const daysOnGround = currentRecord?.groundingDate 
    ? calculateDaysOnGround(currentRecord.groundingDate, currentRecord.ungroundingDate)
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <div className={`rounded-lg border p-6 ${
        isGrounded 
          ? "border-red-300 bg-red-50" 
          : "border-green-300 bg-green-50"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Aircraft Status: {isGrounded ? "GROUNDED" : "IN SERVICE"}
            </h3>
            {isGrounded && currentRecord && (
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-medium">Reason:</span> {currentRecord.reason}</p>
                <p><span className="font-medium">Grounded Since:</span> {formatDate(currentRecord.groundingDate!)}</p>
                <p><span className="font-medium">Days on Ground:</span> {daysOnGround}</p>
                {currentRecord.estimatedUngroundingDate && (
                  <p><span className="font-medium">Estimated Return:</span> {formatDate(currentRecord.estimatedUngroundingDate)}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {isGrounded ? (
              <>
                <button
                  onClick={() => handleOpenModal(currentRecord || undefined)}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Update Status
                </button>
                <button
                  onClick={handleUngroundAircraft}
                  disabled={isSaving}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                >
                  {isSaving ? "Processing..." : "Unground Aircraft"}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleOpenModal()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Ground Aircraft
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current Grounding Details */}
      {isGrounded && currentRecord && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold mb-4">Current Grounding Details</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Grounding</label>
                <p className="mt-1 text-sm text-gray-900">{currentRecord.reason}</p>
              </div>
              
              {currentRecord.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{currentRecord.description}</p>
                </div>
              )}
              
              {currentRecord.planOfAction && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plan of Action</label>
                  <p className="mt-1 text-sm text-gray-900">{currentRecord.planOfAction}</p>
                </div>
              )}
            </div>

            {/* Spare Parts Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Spare Parts Required</label>
                <p className="mt-1 text-sm text-gray-900">
                  {currentRecord.sparePartsRequired ? "Yes" : "No"}
                </p>
              </div>
              
              {currentRecord.sparePartsRequired && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Spare Status</label>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getSpareStatusColor(currentRecord.spareStatus || "Not Required")}`}>
                      {currentRecord.spareStatus}
                    </span>
                  </div>
                  
                  {currentRecord.spareOrderDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Order Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(currentRecord.spareOrderDate)}</p>
                    </div>
                  )}
                  
                  {currentRecord.spareExpectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(currentRecord.spareExpectedDate)}</p>
                    </div>
                  )}
                  
                  {currentRecord.spareReceivedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Received Date</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(currentRecord.spareReceivedDate)}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? "Update Grounding Status" : "Ground Aircraft"}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); isEditing ? handleUpdateRecord() : handleGroundAircraft(); }} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Grounding
                    </label>
                    <select
                      value={formData.reason || ""}
                      onChange={(e) => handleInputChange('reason', e.target.value as GroundingReason)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      {groundingReasons.map((reason) => (
                        <option key={reason} value={reason}>{reason}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Return Date
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedUngroundingDate || ""}
                      onChange={(e) => handleInputChange('estimatedUngroundingDate', e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detailed description of the grounding reason..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan of Action
                  </label>
                  <textarea
                    value={formData.planOfAction || ""}
                    onChange={(e) => handleInputChange('planOfAction', e.target.value)}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Steps to resolve the issue and return aircraft to service..."
                  />
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Spare Parts Information</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="sparePartsRequired"
                        checked={formData.sparePartsRequired || false}
                        onChange={(e) => handleInputChange('sparePartsRequired', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sparePartsRequired" className="ml-2 block text-sm text-gray-900">
                        Spare parts are required
                      </label>
                    </div>
                    
                    {formData.sparePartsRequired && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Spare Status
                          </label>
                          <select
                            value={formData.spareStatus || "Not Required"}
                            onChange={(e) => handleInputChange('spareStatus', e.target.value as SpareStatus)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {spareStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Date
                          </label>
                          <input
                            type="date"
                            value={formData.spareOrderDate || ""}
                            onChange={(e) => handleInputChange('spareOrderDate', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Date
                          </label>
                          <input
                            type="date"
                            value={formData.spareExpectedDate || ""}
                            onChange={(e) => handleInputChange('spareExpectedDate', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Received Date
                          </label>
                          <input
                            type="date"
                            value={formData.spareReceivedDate || ""}
                            onChange={(e) => handleInputChange('spareReceivedDate', e.target.value)}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : (isEditing ? "Update" : "Ground Aircraft")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
