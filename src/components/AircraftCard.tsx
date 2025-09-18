"use client";
import Link from "next/link";
import { useState } from "react";
import { Aircraft, DueStatus, GroundingReason, SpareStatus } from "@/lib/types";

const calculateDueStatus = (nextDueDate: string, currentDate: string): DueStatus => {
  const nextDue = new Date(nextDueDate);
  const current = new Date(currentDate);
  const daysUntilDue = Math.ceil((nextDue.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return "OVERDUE";
  if (daysUntilDue <= 30) return "DUE_SOON";
  if (daysUntilDue <= 60) return "DUE";
  return "OK";
};

const calculateNextDueDate = (lastDoneDate: string, intervalYears: number): string => {
  const lastDone = new Date(lastDoneDate);
  const nextDue = new Date(lastDone);
  nextDue.setFullYear(nextDue.getFullYear() + intervalYears);
  // Subtract one day to make it due the day before the anniversary
  nextDue.setDate(nextDue.getDate() - 1);
  return nextDue.toISOString().split('T')[0];
};

export const AircraftCard = ({ aircraft, onAircraftUpdate }: { aircraft: Aircraft; onAircraftUpdate?: (updatedAircraft: Aircraft) => void }) => {
  const [isGroundingModalOpen, setIsGroundingModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [groundingForm, setGroundingForm] = useState({
    reason: "Maintenance" as GroundingReason,
    description: "",
    planOfAction: "",
    sparePartsRequired: false,
    spareStatus: "Not Required" as SpareStatus,
    spareOrderDate: "",
    spareExpectedDate: "",
    spareReceivedDate: "",
    estimatedUngroundingDate: ""
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter") {
      const link = document.getElementById(`go-${aircraft.id}`) as HTMLAnchorElement | null;
      if (link) link.click();
    }
  };

  // Check for expiring items
  const getExpiringItems = () => {
    const items = [];
    
    // Check CofA (1 year interval)
    if (aircraft.lastCofA) {
      const nextDue = aircraft.lastCofANextDue || calculateNextDueDate(aircraft.lastCofA, 1);
      const status = calculateDueStatus(nextDue, aircraft.currentDate);
      if (status === "OVERDUE" || status === "DUE_SOON") {
        items.push({ name: "CofA", status });
      }
    }
    
    // Check W&B (5 year interval)
    if (aircraft.lastWandB) {
      const nextDue = aircraft.lastWandBNextDue || calculateNextDueDate(aircraft.lastWandB, 5);
      const status = calculateDueStatus(nextDue, aircraft.currentDate);
      if (status === "OVERDUE" || status === "DUE_SOON") {
        items.push({ name: "W&B", status });
      }
    }
    
    // Check Navdata Base
    if (aircraft.navdataBaseNextDue) {
      const status = calculateDueStatus(aircraft.navdataBaseNextDue, aircraft.currentDate);
      if (status === "OVERDUE" || status === "DUE_SOON") {
        items.push({ name: "Navdata", status });
      }
    }
    
    // Check FAK
    if (aircraft.fakNextDue) {
      const status = calculateDueStatus(aircraft.fakNextDue, aircraft.currentDate);
      if (status === "OVERDUE" || status === "DUE_SOON") {
        items.push({ name: "FAK", status });
      }
    }
    
    // Check Survival Kit
    if (aircraft.survivalKitNextDue) {
      const status = calculateDueStatus(aircraft.survivalKitNextDue, aircraft.currentDate);
      if (status === "OVERDUE" || status === "DUE_SOON") {
        items.push({ name: "Survival Kit", status });
      }
    }
    
    return items;
  };

  const expiringItems = getExpiringItems();
  const hasExpiringItems = expiringItems.length > 0;
  const hasOverdueItems = expiringItems.some(item => item.status === "OVERDUE");
  
  // Check grounding status
  const isGrounded = aircraft.groundingStatus?.isGrounded || false;
  const groundingRecord = aircraft.groundingStatus?.currentRecord;
  const daysOnGround = groundingRecord?.groundingDate 
    ? Math.ceil((new Date().getTime() - new Date(groundingRecord.groundingDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const handleOpenGroundingModal = (editing = false) => {
    setIsEditing(editing);
    if (editing && groundingRecord) {
      // Pre-populate form with existing data
      setGroundingForm({
        reason: groundingRecord.reason || "Maintenance",
        description: groundingRecord.description || "",
        planOfAction: groundingRecord.planOfAction || "",
        sparePartsRequired: groundingRecord.sparePartsRequired || false,
        spareStatus: groundingRecord.spareStatus || "Not Required",
        spareOrderDate: groundingRecord.spareOrderDate || "",
        spareExpectedDate: groundingRecord.spareExpectedDate || "",
        spareReceivedDate: groundingRecord.spareReceivedDate || "",
        estimatedUngroundingDate: groundingRecord.estimatedUngroundingDate || ""
      });
    } else {
      // Reset form for new grounding
      setGroundingForm({
        reason: "Maintenance",
        description: "",
        planOfAction: "",
        sparePartsRequired: false,
        spareStatus: "Not Required",
        spareOrderDate: "",
        spareExpectedDate: "",
        spareReceivedDate: "",
        estimatedUngroundingDate: ""
      });
    }
    setIsGroundingModalOpen(true);
  };

  const handleGroundAircraft = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/aircraft/grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          action: 'ground',
          record: {
            reason: groundingForm.reason,
            description: groundingForm.description,
            planOfAction: groundingForm.planOfAction,
            sparePartsRequired: groundingForm.sparePartsRequired,
            spareStatus: groundingForm.spareStatus,
            spareOrderDate: groundingForm.spareOrderDate,
            spareExpectedDate: groundingForm.spareExpectedDate,
            spareReceivedDate: groundingForm.spareReceivedDate,
            estimatedUngroundingDate: groundingForm.estimatedUngroundingDate,
            groundingDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to ground aircraft');
      }

      const updatedAircraft = await response.json();
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }

      setIsGroundingModalOpen(false);
      setGroundingForm({
        reason: "Maintenance",
        description: "",
        planOfAction: "",
        sparePartsRequired: false,
        spareStatus: "Not Required",
        spareOrderDate: "",
        spareExpectedDate: "",
        spareReceivedDate: "",
        estimatedUngroundingDate: ""
      });
    } catch (error) {
      console.error('Error grounding aircraft:', error);
      alert('Failed to ground aircraft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateGroundingRecord = async () => {
    if (!groundingRecord) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/aircraft/grounding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          recordId: groundingRecord.id,
          updates: {
            reason: groundingForm.reason,
            description: groundingForm.description,
            planOfAction: groundingForm.planOfAction,
            sparePartsRequired: groundingForm.sparePartsRequired,
            spareStatus: groundingForm.spareStatus,
            spareOrderDate: groundingForm.spareOrderDate,
            spareExpectedDate: groundingForm.spareExpectedDate,
            spareReceivedDate: groundingForm.spareReceivedDate,
            estimatedUngroundingDate: groundingForm.estimatedUngroundingDate
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update grounding record');
      }

      const updatedAircraft = await response.json();
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }

      setIsGroundingModalOpen(false);
    } catch (error) {
      console.error('Error updating grounding record:', error);
      alert('Failed to update grounding record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUngroundAircraft = async () => {
    if (!groundingRecord) return;

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
          recordId: groundingRecord.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unground aircraft');
      }

      const updatedAircraft = await response.json();
      
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

  return (
    <article
      className={`rounded-lg border p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 ${
        isGrounded
          ? "border-red-400 bg-red-100"
          : hasOverdueItems 
            ? "border-red-300 bg-red-50" 
            : hasExpiringItems 
              ? "border-orange-300 bg-orange-50" 
              : "border-gray-200 bg-white"
      }`}
      tabIndex={0}
      aria-label={`Aircraft ${aircraft.registration}`}
      onKeyDown={handleKeyDown}
    >
      {/* Grounding Status Bar */}
      {isGrounded && (
        <div className="mb-3 rounded bg-red-100 border border-red-200 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-red-800">🚫 GROUNDED</span>
              <span className="text-sm text-red-700">({daysOnGround} days)</span>
              {groundingRecord?.reason && (
                <span className="text-xs text-red-600">• {groundingRecord.reason}</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleOpenGroundingModal(true)}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update
              </button>
              <button
                onClick={handleUngroundAircraft}
                disabled={isSaving}
                className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
              >
                {isSaving ? "..." : "Unground"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{aircraft.registration}</h3>
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-600">{aircraft.type}</span>
          {!isGrounded && hasExpiringItems && (
            <span className={`text-xs font-medium ${
              hasOverdueItems ? "text-red-600" : "text-orange-600"
            }`}>
              {expiringItems.length} item{expiringItems.length > 1 ? 's' : ''} expiring
            </span>
          )}
        </div>
      </div>
      
      {isGrounded && groundingRecord && (
        <div className="mt-2 rounded bg-white/80 p-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Grounding Details:</div>
          <div className="space-y-1">
            <div className="text-xs text-gray-600">
              <span className="font-medium">Reason:</span> {groundingRecord.reason}
            </div>
            {groundingRecord.sparePartsRequired && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Spares:</span> {groundingRecord.spareStatus}
              </div>
            )}
            {groundingRecord.estimatedUngroundingDate && (
              <div className="text-xs text-gray-600">
                <span className="font-medium">Est. Return:</span> {new Date(groundingRecord.estimatedUngroundingDate).toLocaleDateString('en-GB')}
              </div>
            )}
          </div>
        </div>
      )}
      
      {!isGrounded && hasExpiringItems && (
        <div className="mt-2 rounded bg-white/80 p-2">
          <div className="text-xs font-medium text-gray-700 mb-1">Expiring Items:</div>
          <div className="flex flex-wrap gap-1">
            {expiringItems.map((item, index) => (
              <span
                key={index}
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  item.status === "OVERDUE" 
                    ? "bg-red-100 text-red-800" 
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {item.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div className="rounded bg-gray-50 p-2">
          <div className="text-gray-500">TSN (hrs)</div>
          <div className="font-mono">{aircraft.currentHrs.toFixed(1)}</div>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <div className="text-gray-500">CSN</div>
          <div className="font-mono">{aircraft.currentCyc}</div>
        </div>
        <div className="rounded bg-gray-50 p-2">
          <div className="text-gray-500">Avg/day</div>
          <div className="font-mono">{aircraft.avgDailyHrs.toFixed(1)}h / {aircraft.avgDailyCyc}c</div>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <Link 
          id={`go-${aircraft.id}`} 
          href={`/aircraft/${aircraft.id}`} 
          className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-center text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-600"
        >
          Open
        </Link>
        {!isGrounded && (
          <button
            onClick={() => handleOpenGroundingModal(false)}
            className="rounded-md bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Ground
          </button>
        )}
      </div>

      {/* Enhanced Grounding Modal */}
      {isGroundingModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isEditing ? `Update Grounding Status - ${aircraft.registration}` : `Ground Aircraft ${aircraft.registration}`}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); isEditing ? handleUpdateGroundingRecord() : handleGroundAircraft(); }} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Grounding
                    </label>
                    <select
                      value={groundingForm.reason}
                      onChange={(e) => setGroundingForm({...groundingForm, reason: e.target.value as GroundingReason})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inspection">Inspection</option>
                      <option value="Component Failure">Component Failure</option>
                      <option value="Weather">Weather</option>
                      <option value="Regulatory">Regulatory</option>
                      <option value="Spare Parts">Spare Parts</option>
                      <option value="Engine Overhaul">Engine Overhaul</option>
                      <option value="Avionics">Avionics</option>
                      <option value="Structural">Structural</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Return Date
                    </label>
                    <input
                      type="date"
                      value={groundingForm.estimatedUngroundingDate}
                      onChange={(e) => setGroundingForm({...groundingForm, estimatedUngroundingDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={groundingForm.description}
                    onChange={(e) => setGroundingForm({...groundingForm, description: e.target.value})}
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
                    value={groundingForm.planOfAction}
                    onChange={(e) => setGroundingForm({...groundingForm, planOfAction: e.target.value})}
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
                        checked={groundingForm.sparePartsRequired}
                        onChange={(e) => setGroundingForm({...groundingForm, sparePartsRequired: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="sparePartsRequired" className="ml-2 block text-sm text-gray-900">
                        Spare parts are required
                      </label>
                    </div>
                    
                    {groundingForm.sparePartsRequired && (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Spare Status
                          </label>
                          <select
                            value={groundingForm.spareStatus}
                            onChange={(e) => setGroundingForm({...groundingForm, spareStatus: e.target.value as SpareStatus})}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="Not Required">Not Required</option>
                            <option value="Required">Required</option>
                            <option value="Ordered">Ordered</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Received">Received</option>
                            <option value="Installed">Installed</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Date
                          </label>
                          <input
                            type="date"
                            value={groundingForm.spareOrderDate}
                            onChange={(e) => setGroundingForm({...groundingForm, spareOrderDate: e.target.value})}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expected Date
                          </label>
                          <input
                            type="date"
                            value={groundingForm.spareExpectedDate}
                            onChange={(e) => setGroundingForm({...groundingForm, spareExpectedDate: e.target.value})}
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Received Date
                          </label>
                          <input
                            type="date"
                            value={groundingForm.spareReceivedDate}
                            onChange={(e) => setGroundingForm({...groundingForm, spareReceivedDate: e.target.value})}
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
                    onClick={() => setIsGroundingModalOpen(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400"
                  >
                    {isSaving ? (isEditing ? "Updating..." : "Grounding...") : (isEditing ? "Update Status" : "Ground Aircraft")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};


