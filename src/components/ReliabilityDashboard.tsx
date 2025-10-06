"use client";

import { useState, useEffect } from "react";
import { Aircraft, PIREP, Alert, ReliabilityMetric } from "@/lib/types";
import PirepSubmission from "./PirepSubmission";
import PirepList from "./PirepList";
import PirepDetail from "./PirepDetail";
import ReliabilityMetrics from "./ReliabilityMetrics";
import TrendAnalysis from "./TrendAnalysis";
import ReliabilityAlerts from "./ReliabilityAlerts";
import DataCollectionDashboard from "./DataCollectionDashboard";

interface ReliabilityDashboardProps {
  aircraft: Aircraft[];
  onRefreshSnags?: () => void;
}

type ViewMode = "overview" | "pireps" | "submit-pirep" | "submit-form" | "metrics" | "alerts" | "analysis" | "data-collection";

const ReliabilityDashboard = ({ aircraft, onRefreshSnags }: ReliabilityDashboardProps) => {
  const [activeView, setActiveView] = useState<ViewMode>("overview");
  const [selectedPirep, setSelectedPirep] = useState<PIREP | null>(null);
  const [pireps, setPireps] = useState<PIREP[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<ReliabilityMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReliabilityData();
  }, []);

  const loadReliabilityData = async () => {
    try {
      setLoading(true);
      
      // Load PIREPs
      const pirepsResponse = await fetch('/api/pireps');
      if (pirepsResponse.ok) {
        const pirepsData = await pirepsResponse.json();
        setPireps(pirepsData);
      }

      // TODO: Load alerts and metrics when APIs are implemented
      // const alertsResponse = await fetch('/api/reliability/alerts');
      // const metricsResponse = await fetch('/api/reliability/metrics');
      
    } catch (error) {
      console.error('Error loading reliability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePirepSelect = (pirep: PIREP) => {
    setSelectedPirep(pirep);
    setActiveView("pireps");
  };

  const handleSubmitPirep = () => {
    setActiveView("pireps");
    loadReliabilityData(); // Refresh data
  };

  const handleCloseDetail = () => {
    setSelectedPirep(null);
    setActiveView("pireps");
  };

  const handlePirepUpdate = (updatedPirep: PIREP) => {
    setSelectedPirep(updatedPirep);
    loadReliabilityData(); // Refresh data
  };

  // Calculate overview statistics
  const getOverviewStats = () => {
    const totalPireps = pireps.length;
    const criticalPireps = pireps.filter(p => p.severity === "CRITICAL").length;
    const majorPireps = pireps.filter(p => p.severity === "MAJOR").length;
    const minorPireps = pireps.filter(p => p.severity === "MINOR").length;
    const informationalPireps = pireps.filter(p => p.severity === "INFORMATIONAL").length;
    
    const snagGeneratedPireps = pireps.filter(p => p.snagGenerated).length;
    const openAlerts = alerts.filter(a => a.status === "OPEN").length;
    const highPriorityAlerts = alerts.filter(a => a.severity === "HIGH" || a.severity === "CRITICAL").length;

    return {
      totalPireps,
      criticalPireps,
      majorPireps,
      minorPireps,
      informationalPireps,
      snagGeneratedPireps,
      openAlerts,
      highPriorityAlerts
    };
  };

  const renderOverview = () => {
    const stats = getOverviewStats();
    
    return (
      <div className="space-y-6">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalPireps}</p>
                <p className="text-sm text-gray-600">Total PIREPs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.criticalPireps}</p>
                <p className="text-sm text-gray-600">Critical PIREPs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.snagGeneratedPireps}</p>
                <p className="text-sm text-gray-600">Auto-Generated Snags</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.openAlerts}</p>
                <p className="text-sm text-gray-600">Open Alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent PIREPs */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent PIREPs</h3>
              <button
                onClick={() => setActiveView("pireps")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {pireps.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No PIREPs submitted yet</p>
            ) : (
              <div className="space-y-3">
                {pireps.slice(0, 5).map((pirep) => {
                  const aircraftData = aircraft.find(a => a.id === pirep.aircraftId);
                  return (
                    <div
                      key={pirep.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => handlePirepSelect(pirep)}
                    >
                      <div>
                        <p className="font-medium text-gray-900">{pirep.title}</p>
                        <p className="text-sm text-gray-600">
                          {aircraftData?.registration || 'Unknown'} • {pirep.category} • {pirep.severity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">{pirep.reportedBy}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(pirep.reportDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveView("submit-pirep")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">Submit PIREP</p>
                <p className="text-sm text-gray-600">Report operational issues</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView("metrics")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Metrics</p>
                <p className="text-sm text-gray-600">Reliability performance</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView("alerts")}
              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L12.828 7H4.828z" />
              </svg>
              <div className="text-left">
                <p className="font-medium text-gray-900">View Alerts</p>
                <p className="text-sm text-gray-600">System notifications</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return renderOverview();
      
      case "pireps":
        if (selectedPirep) {
          return (
            <PirepDetail
              pirepId={selectedPirep.id}
              onClose={handleCloseDetail}
              onUpdate={handlePirepUpdate}
            />
          );
        }
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Pilot Reports (PIREPs)</h2>
                <button
                  onClick={() => setActiveView("submit-pirep")}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Submit PIREP
                </button>
              </div>
            </div>
            <PirepList
              onPirepSelect={handlePirepSelect}
              showFilters={true}
              onRefreshSnags={onRefreshSnags}
              aircraftList={aircraft}
            />
          </div>
        );
      
      case "submit-pirep":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Submit New PIREP</h2>
                <button
                  onClick={() => setActiveView("pireps")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Instructions:</strong> Select the aircraft for this PIREP and fill out the form below. 
                  Critical and Major PIREPs may automatically generate maintenance snags.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {aircraft.map((ac) => (
                  <button
                    key={ac.id}
                    onClick={() => {
                      // We'll pass the aircraft ID to the submission form
                      setActiveView("submit-form");
                      // Store selected aircraft for the form
                      sessionStorage.setItem('selectedAircraftId', ac.id);
                    }}
                    className="p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900">{ac.registration}</div>
                    <div className="text-sm text-gray-600">{ac.type}</div>
                    <div className="text-xs text-gray-500">
                      {ac.currentHrs.toFixed(1)}h • {ac.currentCyc} cycles
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case "submit-form":
        const selectedAircraftId = sessionStorage.getItem('selectedAircraftId');
        const selectedAircraft = aircraft.find(ac => ac.id === selectedAircraftId);
        
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Submit PIREP</h2>
                  <p className="text-sm text-gray-600">
                    {selectedAircraft ? `Aircraft: ${selectedAircraft.registration} (${selectedAircraft.type})` : 'No aircraft selected'}
                  </p>
                </div>
                <button
                  onClick={() => setActiveView("submit-pirep")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedAircraft ? (
                <PirepSubmission
                  aircraftId={selectedAircraftId!}
                  onSuccess={() => {
                    sessionStorage.removeItem('selectedAircraftId');
                    setActiveView("pireps");
                    loadReliabilityData();
                    onRefreshSnags?.(); // Refresh snags list to show auto-generated snags
                  }}
                  onCancel={() => {
                    sessionStorage.removeItem('selectedAircraftId');
                    setActiveView("submit-pirep");
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Please select an aircraft first.</p>
                  <button
                    onClick={() => setActiveView("submit-pirep")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Select Aircraft
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      
      case "metrics":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold">Reliability Metrics & Industry Standards</h2>
              <p className="text-sm text-gray-600 mt-1">
                Comprehensive reliability analysis including Mean Time Between Failures, Mean Time To Repair, failure rates, component reliability, and EASA Part M compliance calculations.
              </p>
            </div>
            <ReliabilityMetrics aircraft={aircraft} />
          </div>
        );
      
      case "alerts":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold">System Alerts</h2>
              <p className="text-sm text-gray-600 mt-1">
                Automated alerts for performance deviations, compliance issues, and maintenance requirements.
              </p>
            </div>
            <ReliabilityAlerts aircraft={aircraft} />
          </div>
        );
      
      
      case "analysis":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold">Reliability Analysis</h2>
              <p className="text-sm text-gray-600 mt-1">
                Trend analysis and statistical insights for proactive maintenance planning and performance optimization.
              </p>
            </div>
            <TrendAnalysis aircraft={aircraft} />
          </div>
        );
      
      case "data-collection":
        return <DataCollectionDashboard aircraft={aircraft} />;
      
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Reliability Program</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView("overview")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeView === "overview"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView("pireps")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeView === "pireps"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                PIREPs
              </button>
              <button
                onClick={() => setActiveView("data-collection")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeView === "data-collection"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Data Collection
              </button>
              <button
                onClick={() => setActiveView("metrics")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeView === "metrics"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Metrics
              </button>
              <button
                onClick={() => setActiveView("alerts")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeView === "alerts"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Alerts
              </button>
              <button
                onClick={() => setActiveView("analysis")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeView === "analysis"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default ReliabilityDashboard;
