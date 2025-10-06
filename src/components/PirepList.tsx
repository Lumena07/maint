"use client";

import { useState, useEffect } from "react";
import { PIREP, PIREPCategory, PIREPSeverity, PIREPStatus, Aircraft } from "@/lib/types";

interface PirepListProps {
  aircraftId?: string;
  showFilters?: boolean;
  onPirepSelect?: (pirep: PIREP) => void;
  onRefreshSnags?: () => void;
  aircraftList?: Aircraft[];
}

const PirepList = ({ aircraftId, showFilters = true, onPirepSelect, onRefreshSnags, aircraftList = [] }: PirepListProps) => {
  const [pireps, setPireps] = useState<PIREP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    severity: "",
    aircraftId: aircraftId || ""
  });

  useEffect(() => {
    fetchPireps();
  }, [filters]);

  const fetchPireps = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.aircraftId) params.append('aircraftId', filters.aircraftId);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.severity) params.append('severity', filters.severity);

      const response = await fetch(`/api/pireps?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch PIREPs');
      }

      const data = await response.json();
      setPireps(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: PIREPSeverity) => {
    switch (severity) {
      case "CRITICAL": return "bg-red-100 text-red-800";
      case "MAJOR": return "bg-orange-100 text-orange-800";
      case "MINOR": return "bg-yellow-100 text-yellow-800";
      case "INFORMATIONAL": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: PIREPStatus) => {
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
      month: 'short',
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="ENGINE">Engine</option>
                <option value="AVIONICS">Avionics</option>
                <option value="HYDRAULIC">Hydraulic</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="STRUCTURAL">Structural</option>
                <option value="PERFORMANCE">Performance</option>
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="NAVIGATION">Navigation</option>
                <option value="COMMUNICATION">Communication</option>
                <option value="LANDING_GEAR">Landing Gear</option>
                <option value="PNEUMATIC">Pneumatic</option>
                <option value="FUEL_SYSTEM">Fuel System</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={filters.severity}
                onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
                <option value="INFORMATIONAL">Informational</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  status: "",
                  category: "",
                  severity: "",
                  aircraftId: aircraftId || ""
                })}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIREP List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Pilot Reports ({pireps.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIREP #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aircraft
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pireps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                    No PIREPs found matching the current filters.
                  </td>
                </tr>
              ) : (
                pireps.map((pirep) => {
                  const aircraft = aircraftList.find(a => a.id === pirep.aircraftId);
                  return (
                    <tr key={pirep.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {pirep.pirepNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div>
                          <div className="font-medium">{pirep.title}</div>
                          {pirep.category === "ENGINE" && pirep.engineEventType && (
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                pirep.engineEventType === "INFLIGHT_SHUTDOWN" || pirep.engineEventType === "FLAME_OUT"
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : pirep.engineEventType === "OVERSPEED" || pirep.engineEventType === "OVERTEMP"
                                  ? "bg-orange-100 text-orange-800 border border-orange-200"
                                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              }`}>
                                {pirep.engineEventType === "INFLIGHT_SHUTDOWN" ? "🚨 IN-FLIGHT SHUTDOWN" :
                                 pirep.engineEventType === "FLAME_OUT" ? "🚨 FLAME OUT" :
                                 pirep.engineEventType === "OVERSPEED" ? "⚠️ OVERSPEED" :
                                 pirep.engineEventType === "OVERTEMP" ? "⚠️ OVERTEMPERATURE" :
                                 pirep.engineEventType === "VIBRATION_ALARM" ? "⚠️ VIBRATION ALARM" :
                                 pirep.engineEventType === "OIL_PRESSURE_LOW" ? "⚠️ LOW OIL PRESSURE" :
                                 pirep.engineEventType === "FUEL_PRESSURE_LOW" ? "⚠️ LOW FUEL PRESSURE" :
                                 pirep.engineEventType?.replace(/_/g, ' ')}
                              </span>
                            </div>
                          )}
                          <div className="text-gray-500 truncate mt-1">{pirep.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {aircraft?.registration || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pirep.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(pirep.severity)}`}>
                          {pirep.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(pirep.status)}`}>
                          {pirep.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pirep.reportedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(pirep.reportDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPirepSelect?.(pirep);
                            }}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                          >
                            View
                          </button>
                          {pirep.snagGenerated && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              SNAG
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PirepList;
