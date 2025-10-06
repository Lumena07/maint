"use client";

import { useState, useEffect } from "react";
import { ReliabilityMetric, Aircraft, ReliabilityMetricType } from "@/lib/types";

interface ReliabilityMetricsProps {
  aircraft: Aircraft[];
}

const ReliabilityMetrics = ({ aircraft }: ReliabilityMetricsProps) => {
  const [metrics, setMetrics] = useState<ReliabilityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAircraft, setSelectedAircraft] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30_DAYS");
  const [viewMode, setViewMode] = useState<"all" | "grouped">("all");

  useEffect(() => {
    fetchMetrics();
  }, [selectedAircraft, selectedPeriod]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedAircraft !== "all") {
        params.append("aircraftId", selectedAircraft);
      }
      params.append("period", selectedPeriod);

      const response = await fetch(`/api/reliability/metrics?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        setError("Failed to fetch metrics");
      }
    } catch (err) {
      setError("Error fetching metrics");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (type: ReliabilityMetricType) => {
    switch (type) {
      case "MTBF":
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "MTTR":
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case "FAILURE_RATE":
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case "DISPATCH_RELIABILITY":
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "PIREP_FREQUENCY":
        return (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        );
      case "COMPONENT_RELIABILITY":
        return (
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case "AIRCRAFT_AVAILABILITY":
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
        );
      case "DEGRADING":
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
          </svg>
        );
      case "STABLE":
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "IMPROVING":
        return "text-green-600 bg-green-100";
      case "DEGRADING":
        return "text-red-600 bg-red-100";
      case "STABLE":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case "hours":
        return `${value.toFixed(1)}h`;
      case "failures/1000h":
        return `${value.toFixed(2)}`;
      case "%":
        return `${value.toFixed(2)}%`;
      case "PIREPs/100h":
        return `${value.toFixed(2)}`;
      default:
        return value.toFixed(2);
    }
  };

  const getAircraftName = (aircraftId: string) => {
    const ac = aircraft.find(a => a.id === aircraftId);
    return ac ? ac.registration : aircraftId;
  };

  const getMetricFullName = (type: ReliabilityMetricType, metric?: ReliabilityMetric) => {
    switch (type) {
      case "MTBF": return "Mean Time Between Failures";
      case "MTTR": return "Mean Time To Repair";
      case "FAILURE_RATE": return "Failure Rate";
      case "DISPATCH_RELIABILITY": return "Dispatch Reliability";
      case "PIREP_FREQUENCY": return "Pilot Report Frequency";
      case "COMPONENT_RELIABILITY": 
        // Try to extract ATA system from notes or component ID
        if (metric?.notes) {
          const ataMatch = metric.notes.match(/ATA[-\s]*(\d+)/i);
          if (ataMatch) {
            return `${getATASystemName(ataMatch[1])} Reliability`;
          }
        }
        if (metric?.componentId) {
          // Try to extract ATA from component ID if it contains ATA info
          const ataMatch = metric.componentId.match(/ATA[-\s]*(\d+)/i);
          if (ataMatch) {
            return `${getATASystemName(ataMatch[1])} Reliability`;
          }
        }
        return "Aircraft System Reliability";
      case "AIRCRAFT_AVAILABILITY": return "Aircraft Availability";
      default: return type.replace(/_/g, ' ');
    }
  };

  const getATASystemName = (ataCode: string) => {
    const ataSystems: { [key: string]: string } = {
      "21": "Air Conditioning",
      "22": "Auto Flight",
      "23": "Communications",
      "24": "Electrical Power",
      "25": "Equipment/Furnishings",
      "26": "Fire Protection",
      "27": "Flight Controls",
      "28": "Fuel",
      "29": "Hydraulic Power",
      "30": "Ice and Rain Protection",
      "31": "Indicating/Recording Systems",
      "32": "Landing Gear",
      "33": "Lights",
      "34": "Navigation",
      "35": "Oxygen",
      "36": "Pneumatic",
      "49": "Airborne Auxiliary Power",
      "52": "Doors",
      "53": "Fuselage",
      "54": "Nacelles/Pylons",
      "55": "Stabilizers",
      "56": "Windows",
      "57": "Wings",
      "70": "Standard Practices - Engines",
      "71": "Power Plant",
      "72": "Engine",
      "73": "Engine Fuel and Control",
      "74": "Ignition",
      "75": "Air",
      "76": "Engine Controls",
      "77": "Engine Indicating",
      "78": "Exhaust",
      "79": "Oil",
      "80": "Starting",
      "81": "Turbines",
      "82": "Water Injection",
      "83": "Accessory Gearboxes",
      "84": "Propulsion Augmentation",
      "85": "Reciprocating Engines",
      "86": "Turbine Engines",
      "87": "Turbine Engine (Turbo/Prop)",
      "88": "Turbine Engine (Turbo/Shaft)",
      "89": "Turbine Engine (Turbo/Jet)",
      "90": "Turbine Engine (Turbo/Fan)",
      "91": "Fuel Cell Power",
      "92": "Turbine Engine (Turbo/Shaft)",
      "93": "Turbine Engine (Turbo/Jet)",
      "94": "Turbine Engine (Turbo/Fan)",
      "95": "Turbine Engine (Turbo/Prop)",
      "96": "Turbine Engine (Turbo/Shaft)",
      "97": "Turbine Engine (Turbo/Jet)",
      "98": "Turbine Engine (Turbo/Fan)",
      "99": "Turbine Engine (Turbo/Prop)"
    };
    return ataSystems[ataCode] || `ATA ${ataCode}`;
  };


  const groupMetricsByType = () => {
    const grouped: { [key: string]: ReliabilityMetric[] } = {};
    metrics.forEach(metric => {
      if (!grouped[metric.metricType]) {
        grouped[metric.metricType] = [];
      }
      grouped[metric.metricType].push(metric);
    });
    return grouped;
  };

  const groupMetricsByAircraft = () => {
    const grouped: { [key: string]: ReliabilityMetric[] } = {};
    metrics.forEach(metric => {
      if (!grouped[metric.aircraftId]) {
        grouped[metric.aircraftId] = [];
      }
      grouped[metric.aircraftId].push(metric);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Calculating metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const groupedMetrics = groupMetricsByType();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="aircraft-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft
            </label>
            <select
              id="aircraft-filter"
              value={selectedAircraft}
              onChange={(e) => setSelectedAircraft(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Aircraft</option>
              {aircraft.map(ac => (
                <option key={ac.id} value={ac.id}>{ac.registration}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              id="period-filter"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="90_DAYS">Last 90 Days</option>
              <option value="ANNUAL">Last Year</option>
            </select>
          </div>
          <div>
            <label htmlFor="view-mode" className="block text-sm font-medium text-gray-700 mb-1">
              View
            </label>
            <select
              id="view-mode"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as "all" | "grouped")}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Metrics</option>
              <option value="grouped">Grouped by Aircraft</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Display */}
      {Object.keys(groupedMetrics).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center text-gray-500">
            <p>No metrics available for the selected period.</p>
            <p className="text-sm mt-2">Try selecting a different aircraft or time period.</p>
          </div>
        </div>
      ) : viewMode === "all" ? (
        /* All Metrics Table */
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Reliability Metrics</h3>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive view of all reliability metrics across all aircraft
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aircraft
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Baseline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.map((metric) => {
                  const isTargetMet = metric.targetValue ? 
                    (metric.metricType === "FAILURE_RATE" || metric.metricType === "MTTR" ? 
                      metric.value <= metric.targetValue : 
                      metric.value >= metric.targetValue) : null;
                  
                  const getStatusColor = () => {
                    if (isTargetMet === null) return "bg-gray-100 text-gray-800";
                    if (isTargetMet) return "bg-green-100 text-green-800";
                    return "bg-red-100 text-red-800";
                  };

                  const getStatusText = () => {
                    if (isTargetMet === null) return "No Target";
                    if (isTargetMet) return "Target Met";
                    return "Below Target";
                  };

                  return (
                    <tr key={metric.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                          {getMetricIcon(metric.metricType)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getMetricFullName(metric.metricType, metric)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {metric.componentId && `Component: ${metric.componentId}`}
                            </div>
              </div>
            </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                        {getAircraftName(metric.aircraftId)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatValue(metric.value, metric.unit)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {metric.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.targetValue ? formatValue(metric.targetValue, metric.unit) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {metric.baselineValue ? formatValue(metric.baselineValue, metric.unit) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(metric.trend)}`}>
                        {getTrendIcon(metric.trend)}
                        <span className="ml-1">{metric.trend}</span>
                      </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
                          {getStatusText()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(metric.calculatedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
                    </div>
                    
          {/* Summary Statistics */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.length}</div>
                <div className="text-sm text-gray-500">Total Metrics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.filter(m => m.targetValue && 
                    (m.metricType === "FAILURE_RATE" || m.metricType === "MTTR" ? 
                      m.value <= m.targetValue : m.value >= m.targetValue)).length}
                </div>
                <div className="text-sm text-gray-500">Targets Met</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.filter(m => m.targetValue && 
                    (m.metricType === "FAILURE_RATE" || m.metricType === "MTTR" ? 
                      m.value > m.targetValue : m.value < m.targetValue)).length}
                </div>
                <div className="text-sm text-gray-500">Below Target</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.filter(m => m.trend === "IMPROVING").length}
                </div>
                <div className="text-sm text-gray-500">Improving</div>
              </div>
            </div>
                    </div>
                    </div>
      ) : (
        /* Grouped by Aircraft */
        <div className="space-y-6">
          {Object.entries(groupMetricsByAircraft()).map(([aircraftId, aircraftMetrics]) => {
            const aircraftData = aircraft.find(a => a.id === aircraftId);
            const aircraftName = aircraftData ? aircraftData.registration : aircraftId;
            
            return (
              <div key={aircraftId} className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{aircraftName}</h3>
                        <p className="text-sm text-gray-600">
                          {aircraftData?.type} • {aircraftMetrics.length} metrics
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {aircraftMetrics.filter(m => m.targetValue && 
                            (m.metricType === "FAILURE_RATE" || m.metricType === "MTTR" ? 
                              m.value <= m.targetValue : m.value >= m.targetValue)).length}
                        </div>
                        <div className="text-xs text-gray-500">Targets Met</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-red-600">
                          {aircraftMetrics.filter(m => m.targetValue && 
                            (m.metricType === "FAILURE_RATE" || m.metricType === "MTTR" ? 
                              m.value > m.targetValue : m.value < m.targetValue)).length}
                        </div>
                        <div className="text-xs text-gray-500">Below Target</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Metric Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Current Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Target
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Baseline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {aircraftMetrics.map((metric) => {
                        const isTargetMet = metric.targetValue ? 
                          (metric.metricType === "FAILURE_RATE" || metric.metricType === "MTTR" ? 
                            metric.value <= metric.targetValue : 
                            metric.value >= metric.targetValue) : null;
                        
                        const getStatusColor = () => {
                          if (isTargetMet === null) return "bg-gray-100 text-gray-800";
                          if (isTargetMet) return "bg-green-100 text-green-800";
                          return "bg-red-100 text-red-800";
                        };

                        const getStatusText = () => {
                          if (isTargetMet === null) return "No Target";
                          if (isTargetMet) return "Target Met";
                          return "Below Target";
                        };

                        return (
                          <tr key={metric.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getMetricIcon(metric.metricType)}
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {getMetricFullName(metric.metricType, metric)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {metric.componentId && `Component: ${metric.componentId}`}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatValue(metric.value, metric.unit)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {metric.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {metric.targetValue ? formatValue(metric.targetValue, metric.unit) : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {metric.baselineValue ? formatValue(metric.baselineValue, metric.unit) : "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(metric.trend)}`}>
                                {getTrendIcon(metric.trend)}
                                <span className="ml-1">{metric.trend}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
                                {getStatusText()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(metric.calculatedDate).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReliabilityMetrics;
