"use client";

import { useState, useEffect } from "react";
import { Aircraft } from "@/lib/types";

interface IndustryReliabilityMetricsProps {
  aircraft: Aircraft[];
}

interface ReliabilityCalculationResult {
  period: string;
  aircraftType: string;
  aircraftAvailability: {
    totalPossibleHours: number;
    unavailableHours: number;
    availableHours: number;
    averageAvailableAircraft: number;
    availabilityPercentage: number;
  };
  despatchReliability: {
    totalCycles: number;
    technicalDelays: number;
    technicalCancellations: number;
    despatchReliability: number;
    despatchReliabilityRate: number;
  };
  systemReliability: {
    [systemCode: string]: {
      systemName: string;
      componentCount: number;
      unscheduledRemovals: number;
      systemReliabilityRate: number;
    };
  };
  pilotReportReliability: {
    totalPireps: number;
    totalTakeoffs: number;
    pirepRatePer100Takeoffs: number;
  };
}

const IndustryReliabilityMetrics = ({ aircraft }: IndustryReliabilityMetricsProps) => {
  const [calculations, setCalculations] = useState<ReliabilityCalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAircraftType, setSelectedAircraftType] = useState<string>("C208B");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30_DAYS");

  useEffect(() => {
    fetchCalculations();
  }, [selectedAircraftType, selectedPeriod]);

  const fetchCalculations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("aircraftType", selectedAircraftType);
      params.append("period", selectedPeriod);

      const response = await fetch(`/api/reliability/calculations?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCalculations(data);
      } else {
        setError("Failed to fetch calculations");
      }
    } catch (err) {
      setError("Error fetching calculations");
      console.error("Error fetching calculations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getDispatchReliabilityColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getPIREPRateColor = (rate: number) => {
    if (rate <= 2) return "text-green-600";
    if (rate <= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getSystemReliabilityColor = (rate: number) => {
    if (rate <= 5) return "text-green-600";
    if (rate <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Calculating industry-standard metrics...</span>
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
            onClick={fetchCalculations}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!calculations) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>No calculation data available.</p>
        </div>
      </div>
    );
  }

  const aircraftTypes = Array.from(new Set(aircraft.map(a => a.type)));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="aircraft-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Aircraft Type
            </label>
            <select
              id="aircraft-type-filter"
              value={selectedAircraftType}
              onChange={(e) => setSelectedAircraftType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {aircraftTypes.map(type => (
                <option key={type} value={type}>{type}</option>
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
          <div className="flex items-end">
            <button
              onClick={fetchCalculations}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Calculate
            </button>
          </div>
        </div>
      </div>

      {/* Industry Standard Calculations */}
      <div className="space-y-6">
        {/* Aircraft Availability - Formula 1 & 2 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aircraft Availability</h3>
              <p className="text-sm text-gray-600">Formula 1 & 2: huk = hm × iuk, ia = (huk - hs) / huk × iuk</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {calculations.aircraftAvailability.totalPossibleHours.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Possible Hours</div>
              <div className="text-xs text-gray-400">huk = hm × iuk</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {calculations.aircraftAvailability.unavailableHours.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Unavailable Hours</div>
              <div className="text-xs text-gray-400">Due to maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {calculations.aircraftAvailability.availableHours.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Available Hours</div>
              <div className="text-xs text-gray-400">huk - hs</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getAvailabilityColor(calculations.aircraftAvailability.availabilityPercentage)}`}>
                {calculations.aircraftAvailability.availabilityPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Availability Rate</div>
              <div className="text-xs text-gray-400">Average available aircraft</div>
            </div>
          </div>
        </div>

        {/* Despatch Reliability - Formula 3 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Despatch Reliability</h3>
              <p className="text-sm text-gray-600">Formula 3: Rd = 1 - (nd + nc) / n</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {calculations.despatchReliability.totalCycles.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Cycles</div>
              <div className="text-xs text-gray-400">n = takeoffs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {calculations.despatchReliability.technicalDelays}
              </div>
              <div className="text-sm text-gray-500">Technical Delays</div>
              <div className="text-xs text-gray-400">nd &gt; 5-15 min</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {calculations.despatchReliability.technicalCancellations}
              </div>
              <div className="text-sm text-gray-500">Technical Cancellations</div>
              <div className="text-xs text-gray-400">nc</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getDispatchReliabilityColor(calculations.despatchReliability.despatchReliabilityRate)}`}>
                {calculations.despatchReliability.despatchReliabilityRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Despatch Rate</div>
              <div className="text-xs text-gray-400">Success rate</div>
            </div>
          </div>
        </div>

        {/* Pilot Report Reliability - Formula 5 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pilot Report Reliability</h3>
              <p className="text-sm text-gray-600">Formula 5: ip = np / nto × 100</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {calculations.pilotReportReliability.totalPireps}
              </div>
              <div className="text-sm text-gray-500">Total PIREPs</div>
              <div className="text-xs text-gray-400">np in period</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {calculations.pilotReportReliability.totalTakeoffs.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Takeoffs</div>
              <div className="text-xs text-gray-400">nto = cycles</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getPIREPRateColor(calculations.pilotReportReliability.pirepRatePer100Takeoffs)}`}>
                {calculations.pilotReportReliability.pirepRatePer100Takeoffs.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500">PIREPs per 100 Takeoffs</div>
              <div className="text-xs text-gray-400">ip = np/nto × 100</div>
            </div>
          </div>
        </div>

        {/* System Reliability - Formula 4 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">System Reliability Rate</h3>
              <p className="text-sm text-gray-600">Formula 4: iur = nur / (nks × h) × 1000</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(calculations.systemReliability)
              .filter(([_, data]) => data.unscheduledRemovals > 0)
              .sort((a, b) => b[1].systemReliabilityRate - a[1].systemReliabilityRate)
              .map(([systemCode, data]) => (
                <div key={systemCode} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{data.systemName}</h4>
                    <span className="text-xs text-gray-500">ATA {systemCode}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Components:</span>
                      <span className="font-medium">{data.componentCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Removals:</span>
                      <span className="font-medium text-orange-600">{data.unscheduledRemovals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Rate (per 1000h):</span>
                      <span className={`font-medium ${getSystemReliabilityColor(data.systemReliabilityRate)}`}>
                        {data.systemReliabilityRate.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          
          {Object.values(calculations.systemReliability).filter(data => data.unscheduledRemovals > 0).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>No system reliability issues detected in the selected period.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndustryReliabilityMetrics;
