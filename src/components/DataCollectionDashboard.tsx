"use client";

import { useState, useEffect } from "react";
import { Aircraft, Flight, MaintenanceRecord, ComponentRecord } from "@/lib/types";
import FlightSubmissionForm from "./FlightSubmissionForm";
import MaintenanceSubmissionForm from "./MaintenanceSubmissionForm";
import ComponentSubmissionForm from "./ComponentSubmissionForm";

interface DataCollectionDashboardProps {
  aircraft: Aircraft[];
}

const DataCollectionDashboard = ({ aircraft }: DataCollectionDashboardProps) => {
  const [activeTab, setActiveTab] = useState<string>("flights");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [components, setComponents] = useState<ComponentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlightForm, setShowFlightForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentRecord | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load all data types in parallel
      const [flightsRes, maintenanceRes, componentsRes] = await Promise.all([
        fetch('/api/flights'),
        fetch('/api/maintenance'),
        fetch('/api/components')
      ]);

      if (flightsRes.ok) setFlights(await flightsRes.json());
      if (maintenanceRes.ok) setMaintenance(await maintenanceRes.json());
      if (componentsRes.ok) setComponents(await componentsRes.json());
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDataStats = () => {
    const totalFlightHours = flights.reduce((sum, f) => sum + f.flightHours, 0);
    const totalFlightCycles = flights.reduce((sum, f) => sum + f.flightCycles, 0);
    
    // Count technical delays (flights with delayMinutes > 15 and technical delay reasons)
    const technicalDelays = flights.filter(f => 
      f.status === "DELAYED" && 
      f.delayMinutes && 
      f.delayMinutes > 15 && 
      f.delayReason === "TECHNICAL"
    ).length;
    
    // Count technical cancellations (flights cancelled due to technical reasons)
    const technicalCancellations = flights.filter(f => 
      f.status === "CANCELLED" && 
      f.cancellationReason === "TECHNICAL"
    ).length;
    
    const totalDowntimeHours = maintenance.reduce((sum, m) => sum + m.downtimeHours, 0);
    const unscheduledRemovals = components.filter(c => c.removalReason === "UNSCHEDULED" || c.removalReason === "FAILURE").length;

    return {
      totalFlightHours,
      totalFlightCycles,
      technicalDelays,
      technicalCancellations,
      totalDowntimeHours,
      unscheduledRemovals,
      totalFlights: flights.length,
      totalMaintenance: maintenance.length,
      totalComponents: components.filter(c => c.status === "REMOVED").length
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleFlightSubmit = async (flightData: any) => {
    try {
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flightData),
      });

      if (response.ok) {
        setShowFlightForm(false);
        loadAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting flight:', error);
      alert('Error submitting flight data');
    }
  };

  const handleMaintenanceSubmit = async (maintenanceData: any) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(maintenanceData),
      });

      if (response.ok) {
        setShowMaintenanceForm(false);
        loadAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting maintenance:', error);
      alert('Error submitting maintenance data');
    }
  };

  const handleComponentSubmit = async (componentData: any) => {
    try {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(componentData),
      });

      if (response.ok) {
        setShowComponentForm(false);
        loadAllData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting component:', error);
      alert('Error submitting component data');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading data collection dashboard...</span>
        </div>
      </div>
    );
  }

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Data Collection Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive tracking of all aviation reliability data including flights, maintenance, and component removals.
        </p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Technical Issues</p>
              <p className="mt-1 text-2xl font-semibold text-red-900">{stats.technicalDelays + stats.technicalCancellations}</p>
              <p className="text-xs text-gray-500">{stats.technicalDelays} delays • {stats.technicalCancellations} cancellations</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="mt-1 text-2xl font-semibold text-orange-900">{stats.totalMaintenance}</p>
              <p className="text-xs text-gray-500">{stats.totalDowntimeHours.toFixed(0)}h downtime</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Components</p>
              <p className="mt-1 text-2xl font-semibold text-green-900">{stats.totalComponents}</p>
              <p className="text-xs text-gray-500">{stats.unscheduledRemovals} unscheduled removals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: "flights", name: "Flight Operations", count: stats.totalFlights },
              { id: "maintenance", name: "Maintenance", count: stats.totalMaintenance },
              { id: "components", name: "Component Removals", count: stats.totalComponents },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.name} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "flights" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Flight Operations Data</h3>
                <button
                  onClick={() => setShowFlightForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Flight
                </button>
              </div>
              
              {showFlightForm && (
                <FlightSubmissionForm
                  aircraft={aircraft}
                  onSubmit={handleFlightSubmit}
                  onCancel={() => setShowFlightForm(false)}
                />
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flight</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {flights.slice(0, 10).map((flight) => (
                      <tr key={flight.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{flight.flightNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.find(a => a.id === flight.aircraftId)?.registration || flight.aircraftId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.departureAirport} → {flight.arrivalAirport}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            flight.status === "LANDED" ? "bg-green-100 text-green-800" :
                            flight.status === "DELAYED" ? "bg-yellow-100 text-yellow-800" :
                            flight.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {flight.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.delayMinutes ? `${flight.delayMinutes}min` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {flight.delayReason ? flight.delayReason.replace(/_/g, ' ') : 
                           flight.cancellationReason || flight.diversionReason || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Maintenance Records</h3>
                <button
                  onClick={() => setShowMaintenanceForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Maintenance
                </button>
              </div>
              
              {showMaintenanceForm && (
                <MaintenanceSubmissionForm
                  aircraft={aircraft}
                  onSubmit={handleMaintenanceSubmit}
                  onCancel={() => setShowMaintenanceForm(false)}
                />
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downtime</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {maintenance.slice(0, 10).map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {aircraft.find(a => a.id === record.aircraftId)?.registration || record.aircraftId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.maintenanceType.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            record.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.actualDuration || record.plannedDuration}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.downtimeHours}h</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.cost ? formatCurrency(record.cost) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(record.startDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "components" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Component Removals & Failures</h3>
                <button
                  onClick={() => setShowComponentForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Report Component Removal
                </button>
              </div>
              
              {showComponentForm && (
                <ComponentSubmissionForm
                  aircraft={aircraft}
                  onSubmit={handleComponentSubmit}
                  onCancel={() => setShowComponentForm(false)}
                />
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Component</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Removal Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Removed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aircraft</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {components
                      .filter(component => component.status === "REMOVED")
                      .slice(0, 10)
                      .map((component) => (
                      <tr key={component.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{component.partNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{component.serialNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{component.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            component.removalReason === "UNSCHEDULED" ? "bg-red-100 text-red-800" :
                            component.removalReason === "FAILURE" ? "bg-red-100 text-red-800" :
                            component.removalReason === "SCHEDULED" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {component.removalReason || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {component.removalDate ? new Date(component.removalDate).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {aircraft.find(a => a.id === component.aircraftId)?.registration || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedComponent(component)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {components.filter(component => component.status === "REMOVED").length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          No component removals recorded yet. Click "Report Component Removal" to add the first one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Component Details</h3>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Part Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComponent.partNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComponent.serialNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Component Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComponent.componentType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ATA System</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComponent.ataSystem}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedComponent.description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedComponent.status === "REMOVED" ? "bg-red-100 text-red-800" :
                    selectedComponent.status === "INSTALLED" ? "bg-green-100 text-green-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {selectedComponent.status}
                          </span>
                </div>
              </div>

              {/* Installation Information */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Installation Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Installation Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedComponent.installationDate ? new Date(selectedComponent.installationDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Aircraft</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {aircraft.find(a => a.id === selectedComponent.aircraftId)?.registration || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Removal Information */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Removal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Removal Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedComponent.removalDate ? new Date(selectedComponent.removalDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Removal Reason</label>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedComponent.removalReason === "UNSCHEDULED" ? "bg-red-100 text-red-800" :
                      selectedComponent.removalReason === "FAILURE" ? "bg-red-100 text-red-800" :
                      selectedComponent.removalReason === "SCHEDULED" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                      {selectedComponent.removalReason || "N/A"}
                          </span>
                  </div>
                </div>
              </div>

              {/* Flight Hours & Cycles */}
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Flight Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Flight Hours</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedComponent.totalFlightHours.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Flight Cycles</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedComponent.totalFlightCycles} cycles</p>
                  </div>
              </div>
              </div>

              {/* Additional Information */}
              {(selectedComponent.condition || selectedComponent.supplier || selectedComponent.cost || selectedComponent.notes) && (
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedComponent.condition && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Condition</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedComponent.condition}</p>
                      </div>
                    )}
                    {selectedComponent.supplier && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Supplier</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedComponent.supplier}</p>
                      </div>
                    )}
                    {selectedComponent.cost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cost</label>
                        <p className="mt-1 text-sm text-gray-900">${selectedComponent.cost.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {selectedComponent.notes && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedComponent.notes}</p>
                    </div>
                  )}
            </div>
          )}

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default DataCollectionDashboard;

