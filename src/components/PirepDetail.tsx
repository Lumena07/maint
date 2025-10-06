"use client";

import { useState, useEffect } from "react";
import { PIREP, PIREPStatus } from "@/lib/types";

interface PirepDetailProps {
  pirepId: string;
  onClose?: () => void;
  onUpdate?: (pirep: PIREP) => void;
}

const PirepDetail = ({ pirepId, onClose, onUpdate }: PirepDetailProps) => {
  const [pirep, setPirep] = useState<PIREP | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "" as PIREPStatus | "",
    reviewedBy: "",
    investigationNotes: "",
    resolvedBy: ""
  });

  useEffect(() => {
    fetchPirep();
  }, [pirepId]);

  const fetchPirep = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pireps/${pirepId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch PIREP');
      }

      const data = await response.json();
      setPirep(data);
      setUpdateData({
        status: data.status,
        reviewedBy: data.reviewedBy || "",
        investigationNotes: data.investigationNotes || "",
        resolvedBy: data.resolvedBy || ""
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!pirep) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/pireps/${pirepId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update PIREP');
      }

      const updatedPirep = await response.json();
      setPirep(updatedPirep);
      onUpdate?.(updatedPirep);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-100 text-red-800";
      case "MAJOR": return "bg-orange-100 text-orange-800";
      case "MINOR": return "bg-yellow-100 text-yellow-800";
      case "INFORMATIONAL": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED": return "bg-blue-100 text-blue-800";
      case "REVIEWED": return "bg-purple-100 text-purple-800";
      case "INVESTIGATING": return "bg-yellow-100 text-yellow-800";
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!pirep) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-yellow-800">PIREP not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{pirep.title}</h2>
            <p className="text-sm text-gray-500">{pirep.pirepNumber}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(pirep.severity)}`}>
              {pirep.severity}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pirep.status)}`}>
              {pirep.status}
            </span>
            {pirep.snagGenerated && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                SNAG GENERATED
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Reported By</dt>
                <dd className="text-sm text-gray-900">{pirep.reportedBy}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Report Date</dt>
                <dd className="text-sm text-gray-900">{formatDate(pirep.reportDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">{pirep.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">System Affected</dt>
                <dd className="text-sm text-gray-900">{pirep.systemAffected}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Flight Conditions</h3>
            <dl className="space-y-2">
              {pirep.flightPhase && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Flight Phase</dt>
                  <dd className="text-sm text-gray-900">{pirep.flightPhase}</dd>
                </div>
              )}
              {pirep.altitude && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Altitude</dt>
                  <dd className="text-sm text-gray-900">{pirep.altitude} ft</dd>
                </div>
              )}
              {pirep.airspeed && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Airspeed</dt>
                  <dd className="text-sm text-gray-900">{pirep.airspeed} kts</dd>
                </div>
              )}
              {pirep.weatherConditions && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Weather Conditions</dt>
                  <dd className="text-sm text-gray-900">{pirep.weatherConditions}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Engine-Specific Details (only show when category = "ENGINE") */}
        {pirep.category === "ENGINE" && (
          <div className="border-t pt-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">🚨 Engine Event Details</h3>
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                CRITICAL
              </span>
            </div>
            
            {/* Engine Event Type - Critical Flag */}
            {pirep.engineEventType && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Engine Event Type</label>
                <div className={`inline-flex items-center px-4 py-3 rounded-lg border-2 ${
                  pirep.engineEventType === "INFLIGHT_SHUTDOWN" || pirep.engineEventType === "FLAME_OUT"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : pirep.engineEventType === "OVERSPEED" || pirep.engineEventType === "OVERTEMP"
                    ? "bg-orange-50 border-orange-200 text-orange-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                }`}>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold text-lg">
                    {pirep.engineEventType === "INFLIGHT_SHUTDOWN" ? "🚨 CRITICAL: IN-FLIGHT SHUTDOWN" :
                     pirep.engineEventType === "FLAME_OUT" ? "🚨 CRITICAL: FLAME OUT" :
                     pirep.engineEventType === "OVERSPEED" ? "⚠️ MAJOR: OVERSPEED" :
                     pirep.engineEventType === "OVERTEMP" ? "⚠️ MAJOR: OVERTEMPERATURE" :
                     pirep.engineEventType === "VIBRATION_ALARM" ? "⚠️ MINOR: VIBRATION ALARM" :
                     pirep.engineEventType === "OIL_PRESSURE_LOW" ? "⚠️ MINOR: LOW OIL PRESSURE" :
                     pirep.engineEventType === "FUEL_PRESSURE_LOW" ? "⚠️ MINOR: LOW FUEL PRESSURE" :
                     pirep.engineEventType?.replace(/_/g, ' ')}
                  </span>
                </div>
                {(pirep.engineEventType === "INFLIGHT_SHUTDOWN" || pirep.engineEventType === "FLAME_OUT") && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    ⚠️ This is a critical engine event requiring immediate investigation and potential grounding.
                  </p>
                )}
              </div>
            )}

            {/* Engine Number and System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number</label>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-900">
                    {pirep.engineNumber ? `Engine ${pirep.engineNumber}` : "Not specified"}
                  </span>
                  {pirep.engineNumber && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ATA 72
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">System Affected</label>
                <p className="text-sm text-gray-900">{pirep.systemAffected}</p>
              </div>
            </div>

            {/* Engine Parameters */}
            {(pirep.oilTemperature || pirep.oilPressure || pirep.vibrationLevel || pirep.egtTemperature || pirep.n1RPM || pirep.n2RPM) && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">Engine Parameters at Time of Event</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pirep.oilTemperature && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Oil Temperature</label>
                      <p className="text-lg font-semibold text-gray-900">{pirep.oilTemperature}°C</p>
                    </div>
                  )}
                  {pirep.oilPressure && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Oil Pressure</label>
                      <p className="text-lg font-semibold text-gray-900">{pirep.oilPressure} PSI</p>
                    </div>
                  )}
                  {pirep.vibrationLevel && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Vibration Level</label>
                      <p className="text-lg font-semibold text-gray-900">{pirep.vibrationLevel}</p>
                    </div>
                  )}
                  {pirep.egtTemperature && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">EGT Temperature</label>
                      <p className="text-lg font-semibold text-gray-900">{pirep.egtTemperature}°C</p>
                    </div>
                  )}
                  {pirep.n1RPM && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">N1 RPM</label>
                      <p className="text-lg font-semibold text-gray-900">{pirep.n1RPM}%</p>
                    </div>
                  )}
                  {pirep.n2RPM && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <label className="block text-xs font-medium text-gray-500 mb-1">N2 RPM</label>
                      <p className="text-lg font-semibold text-gray-900">{pirep.n2RPM}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{pirep.description}</p>
        </div>

        {/* Action Taken */}
        {pirep.actionTaken && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Action Taken</h3>
            <p className="text-gray-700 bg-blue-50 p-4 rounded-md">{pirep.actionTaken}</p>
          </div>
        )}

        {/* Follow-up Information */}
        {pirep.followUpRequired && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-up Required</h3>
            <p className="text-gray-700 bg-yellow-50 p-4 rounded-md">{pirep.followUpNotes}</p>
          </div>
        )}

        {/* Review Information */}
        {(pirep.reviewedBy || pirep.reviewedDate) && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Review Information</h3>
            <dl className="space-y-2 bg-gray-50 p-4 rounded-md">
              {pirep.reviewedBy && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Reviewed By</dt>
                  <dd className="text-sm text-gray-900">{pirep.reviewedBy}</dd>
                </div>
              )}
              {pirep.reviewedDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Review Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(pirep.reviewedDate)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Investigation Notes */}
        {pirep.investigationNotes && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Investigation Notes</h3>
            <p className="text-gray-700 bg-yellow-50 p-4 rounded-md">{pirep.investigationNotes}</p>
          </div>
        )}

        {/* Resolution Information */}
        {(pirep.resolvedBy || pirep.resolvedDate) && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Resolution Information</h3>
            <dl className="space-y-2 bg-green-50 p-4 rounded-md">
              {pirep.resolvedBy && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Resolved By</dt>
                  <dd className="text-sm text-gray-900">{pirep.resolvedBy}</dd>
                </div>
              )}
              {pirep.resolvedDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Resolution Date</dt>
                  <dd className="text-sm text-gray-900">{formatDate(pirep.resolvedDate)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Status Update Form */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value as PIREPStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {updateData.status === "REVIEWED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviewed By
                </label>
                <input
                  type="text"
                  value={updateData.reviewedBy}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, reviewedBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Reviewer name"
                />
              </div>
            )}

            {updateData.status === "RESOLVED" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resolved By
                </label>
                <input
                  type="text"
                  value={updateData.resolvedBy}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, resolvedBy: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Resolver name"
                />
              </div>
            )}
          </div>

          {updateData.status === "INVESTIGATING" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investigation Notes
              </label>
              <textarea
                value={updateData.investigationNotes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, investigationNotes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add investigation notes..."
              />
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || updateData.status === pirep.status}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PirepDetail;
