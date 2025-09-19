"use client";
import { useState } from "react";
import { Aircraft, AircraftMonitoringItem, DueStatus } from "@/lib/types";

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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getStatusColor = (status: DueStatus): string => {
  switch (status) {
    case "OVERDUE":
      return "bg-red-100 text-red-800 border-red-200";
    case "DUE_SOON":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "DUE":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-green-100 text-green-800 border-green-200";
  }
};

const getStatusText = (status: DueStatus): string => {
  switch (status) {
    case "OVERDUE":
      return "Overdue";
    case "DUE_SOON":
      return "Due Soon";
    case "DUE":
      return "Due";
    default:
      return "OK";
  }
};

interface AircraftDetailsProps {
  aircraft: Aircraft;
  onAircraftUpdate?: (updatedAircraft: Aircraft) => void;
}

export const AircraftDetails = ({ aircraft, onAircraftUpdate }: AircraftDetailsProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentAircraft, setCurrentAircraft] = useState<Aircraft>(aircraft);
  const [isCofAExtensionOpen, setIsCofAExtensionOpen] = useState(false);
  const [cofaExtensionData, setCofAExtensionData] = useState({ extensionDate: '', extensionDays: '' });

  const handleOpenForm = (itemId?: string) => {
    setEditingItem(itemId || null);
    setIsFormOpen(true);
    
    // Pre-populate form with existing data if editing
    if (itemId) {
      const item = monitoringItems.find(m => m.id === itemId);
      if (item) {
        setFormData({
          lastDone: item.lastDone || "",
          nextDue: item.nextDue || ""
        });
      }
    } else {
      setFormData({ lastDone: "", nextDue: "" });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updateData: Partial<Aircraft> = {};
      
      if (editingItem) {
        // Update existing item
        const fieldMap: Record<string, { lastDone: keyof Aircraft; nextDue: keyof Aircraft }> = {
          'cofa': { lastDone: 'lastCofA', nextDue: 'lastCofANextDue' },
          'wandb': { lastDone: 'lastWandB', nextDue: 'lastWandBNextDue' },
          'navdata': { lastDone: 'navdataBaseLastDone', nextDue: 'navdataBaseNextDue' },
          'fak': { lastDone: 'fakLastDone', nextDue: 'fakNextDue' },
          'survival': { lastDone: 'survivalKitLastDone', nextDue: 'survivalKitNextDue' },
          'eltbattery': { lastDone: 'eltBatteryLastDone', nextDue: 'eltBatteryNextDue' },
          'fireextinguisher': { lastDone: 'fireExtinguisherLastDone', nextDue: 'fireExtinguisherNextDue' },
          'standbycompass': { lastDone: 'standbyCompassLastDone', nextDue: 'standbyCompassNextDue' }
        };

        const fields = fieldMap[editingItem];
        if (fields) {
          updateData[fields.lastDone] = formData.lastDone as any;
          
          // Auto-calculate next due for CofA, W&B, Fire Extinguisher, and Standby Compass
          if (editingItem === 'cofa' && formData.lastDone) {
            updateData[fields.nextDue] = calculateNextDueDate(formData.lastDone, 1) as any;
          } else if (editingItem === 'wandb' && formData.lastDone) {
            updateData[fields.nextDue] = calculateNextDueDate(formData.lastDone, 5) as any;
          } else if ((editingItem === 'fireextinguisher' || editingItem === 'standbycompass') && formData.lastDone) {
            updateData[fields.nextDue] = calculateNextDueDate(formData.lastDone, 1) as any;
          } else {
            updateData[fields.nextDue] = formData.nextDue as any;
          }
        }
      } else {
        // Update basic aircraft information
        updateData.yearOfManufacture = formData.yearOfManufacture ? parseInt(formData.yearOfManufacture) : undefined;
        updateData.serialNumber = formData.serialNumber || undefined;
        updateData.manufacturer = formData.manufacturer || undefined;
        updateData.engineNumber = formData.engineNumber || undefined;
        updateData.propellerNumber = formData.propellerNumber || undefined;
      }

      const response = await fetch('/api/aircraft/update-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          updates: updateData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save aircraft details');
      }

      const updatedAircraft = await response.json();
      
      // Update local state
      setCurrentAircraft(updatedAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }

      handleCloseForm();
    } catch (error) {
      console.error('Error saving aircraft details:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCofAExtensionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const extensionDays = parseInt(cofaExtensionData.extensionDays);
      if (!cofaExtensionData.extensionDate || isNaN(extensionDays) || extensionDays <= 0) {
        alert('Please enter valid extension date and days');
        return;
      }

      const updateData: Partial<Aircraft> = {
        cofaExtensionDate: cofaExtensionData.extensionDate,
        cofaExtensionDays: extensionDays
      };

      const response = await fetch('/api/aircraft/update-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aircraftId: aircraft.id,
          updates: updateData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save CofA extension');
      }

      const updatedAircraft = await response.json();
      
      // Update local state
      setCurrentAircraft(updatedAircraft);
      
      if (onAircraftUpdate) {
        onAircraftUpdate(updatedAircraft);
      }

      setIsCofAExtensionOpen(false);
      setCofAExtensionData({ extensionDate: '', extensionDays: '' });
    } catch (error) {
      console.error('Error saving CofA extension:', error);
      alert('Failed to save CofA extension. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCofAExtensionClose = () => {
    setIsCofAExtensionOpen(false);
    setCofAExtensionData({ extensionDate: '', extensionDays: '' });
  };

  const monitoringItems: AircraftMonitoringItem[] = [
    {
      id: "cofa",
      name: "Certificate of Airworthiness (CofA)",
      lastDone: currentAircraft.lastCofA,
      nextDue: currentAircraft.lastCofANextDue || (currentAircraft.lastCofA ? calculateNextDueDate(currentAircraft.lastCofA, 1) : undefined),
      intervalYears: 1,
      status: currentAircraft.lastCofANextDue ? calculateDueStatus(currentAircraft.lastCofANextDue, currentAircraft.currentDate) : (currentAircraft.lastCofA ? calculateDueStatus(calculateNextDueDate(currentAircraft.lastCofA, 1), currentAircraft.currentDate) : "OK"),
      daysUntilDue: currentAircraft.lastCofANextDue ? Math.ceil((new Date(currentAircraft.lastCofANextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : (currentAircraft.lastCofA ? Math.ceil((new Date(calculateNextDueDate(currentAircraft.lastCofA, 1)).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined)
    },
    {
      id: "wandb",
      name: "Weight & Balance (W&B)",
      lastDone: currentAircraft.lastWandB,
      nextDue: currentAircraft.lastWandBNextDue || (currentAircraft.lastWandB ? calculateNextDueDate(currentAircraft.lastWandB, 5) : undefined),
      intervalYears: 5,
      status: currentAircraft.lastWandBNextDue ? calculateDueStatus(currentAircraft.lastWandBNextDue, currentAircraft.currentDate) : (currentAircraft.lastWandB ? calculateDueStatus(calculateNextDueDate(currentAircraft.lastWandB, 5), currentAircraft.currentDate) : "OK"),
      daysUntilDue: currentAircraft.lastWandBNextDue ? Math.ceil((new Date(currentAircraft.lastWandBNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : (currentAircraft.lastWandB ? Math.ceil((new Date(calculateNextDueDate(currentAircraft.lastWandB, 5)).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined)
    },
    {
      id: "navdata",
      name: "Navdata Base",
      lastDone: currentAircraft.navdataBaseLastDone,
      nextDue: currentAircraft.navdataBaseNextDue,
      status: currentAircraft.navdataBaseNextDue ? calculateDueStatus(currentAircraft.navdataBaseNextDue, currentAircraft.currentDate) : "OK",
      daysUntilDue: currentAircraft.navdataBaseNextDue ? Math.ceil((new Date(currentAircraft.navdataBaseNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined
    },
    {
      id: "fak",
      name: "First Aid Kit (FAK)",
      lastDone: currentAircraft.fakLastDone,
      nextDue: currentAircraft.fakNextDue,
      status: currentAircraft.fakNextDue ? calculateDueStatus(currentAircraft.fakNextDue, currentAircraft.currentDate) : "OK",
      daysUntilDue: currentAircraft.fakNextDue ? Math.ceil((new Date(currentAircraft.fakNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined
    },
    {
      id: "survival",
      name: "Survival Kit",
      lastDone: currentAircraft.survivalKitLastDone,
      nextDue: currentAircraft.survivalKitNextDue,
      status: currentAircraft.survivalKitNextDue ? calculateDueStatus(currentAircraft.survivalKitNextDue, currentAircraft.currentDate) : "OK",
      daysUntilDue: currentAircraft.survivalKitNextDue ? Math.ceil((new Date(currentAircraft.survivalKitNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined
    },
    {
      id: "eltbattery",
      name: "ELT Battery",
      lastDone: currentAircraft.eltBatteryLastDone,
      nextDue: currentAircraft.eltBatteryNextDue,
      status: currentAircraft.eltBatteryNextDue ? calculateDueStatus(currentAircraft.eltBatteryNextDue, currentAircraft.currentDate) : "OK",
      daysUntilDue: currentAircraft.eltBatteryNextDue ? Math.ceil((new Date(currentAircraft.eltBatteryNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined
    },
    {
      id: "fireextinguisher",
      name: "Fire Extinguisher",
      lastDone: currentAircraft.fireExtinguisherLastDone,
      nextDue: currentAircraft.fireExtinguisherNextDue || (currentAircraft.fireExtinguisherLastDone ? calculateNextDueDate(currentAircraft.fireExtinguisherLastDone, 1) : undefined),
      intervalYears: 1,
      status: currentAircraft.fireExtinguisherNextDue ? calculateDueStatus(currentAircraft.fireExtinguisherNextDue, currentAircraft.currentDate) : (currentAircraft.fireExtinguisherLastDone ? calculateDueStatus(calculateNextDueDate(currentAircraft.fireExtinguisherLastDone, 1), currentAircraft.currentDate) : "OK"),
      daysUntilDue: currentAircraft.fireExtinguisherNextDue ? Math.ceil((new Date(currentAircraft.fireExtinguisherNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : (currentAircraft.fireExtinguisherLastDone ? Math.ceil((new Date(calculateNextDueDate(currentAircraft.fireExtinguisherLastDone, 1)).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined)
    },
    {
      id: "standbycompass",
      name: "Standby Compass",
      lastDone: currentAircraft.standbyCompassLastDone,
      nextDue: currentAircraft.standbyCompassNextDue || (currentAircraft.standbyCompassLastDone ? calculateNextDueDate(currentAircraft.standbyCompassLastDone, 1) : undefined),
      intervalYears: 1,
      status: currentAircraft.standbyCompassNextDue ? calculateDueStatus(currentAircraft.standbyCompassNextDue, currentAircraft.currentDate) : (currentAircraft.standbyCompassLastDone ? calculateDueStatus(calculateNextDueDate(currentAircraft.standbyCompassLastDone, 1), currentAircraft.currentDate) : "OK"),
      daysUntilDue: currentAircraft.standbyCompassNextDue ? Math.ceil((new Date(currentAircraft.standbyCompassNextDue).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : (currentAircraft.standbyCompassLastDone ? Math.ceil((new Date(calculateNextDueDate(currentAircraft.standbyCompassLastDone, 1)).getTime() - new Date(currentAircraft.currentDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Aircraft Basic Information Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Aircraft Information</h3>
          <button
            onClick={() => handleOpenForm()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit Aircraft Info
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Year of Manufacture</div>
            <div className="text-sm text-gray-900">{currentAircraft.yearOfManufacture || "Not set"}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Serial Number</div>
            <div className="text-sm text-gray-900">{currentAircraft.serialNumber || "Not set"}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Manufacturer</div>
            <div className="text-sm text-gray-900">{currentAircraft.manufacturer || "Not set"}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Engine Number</div>
            <div className="text-sm text-gray-900">{currentAircraft.engineNumber || "Not set"}</div>
          </div>
          <div className="rounded bg-gray-50 p-3">
            <div className="text-sm font-medium text-gray-700">Propeller Number</div>
            <div className="text-sm text-gray-900">{currentAircraft.propellerNumber || "Not set"}</div>
          </div>
        </div>
      </div>

      {/* Monitoring Items Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Monitoring Items</h3>
          <button
            onClick={() => handleOpenForm()}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add/Edit Items
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Done
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Remaining
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monitoringItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    {item.intervalYears && (
                      <div className="text-sm text-gray-500">{item.intervalYears} year interval</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.lastDone ? formatDate(item.lastDone) : "Not set"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.nextDue ? (
                      <div>
                        <div>{formatDate(item.nextDue)}</div>
                        {(item.id === 'cofa' || item.id === 'wandb' || item.id === 'fireextinguisher' || item.id === 'standbycompass') && (
                          <div className="text-xs text-gray-500">Auto-calculated</div>
                        )}
                        {item.id === 'cofa' && currentAircraft.cofaExtensionDate && currentAircraft.cofaExtensionDays && (
                          <div className="text-xs text-green-600 mt-1">
                            Extended {currentAircraft.cofaExtensionDays} days on {formatDate(currentAircraft.cofaExtensionDate)}
                          </div>
                        )}
                      </div>
                    ) : (
                      "Not set"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.daysUntilDue !== undefined ? (
                      <span className={item.daysUntilDue < 0 ? 'text-red-600' : item.daysUntilDue <= 30 ? 'text-orange-600' : 'text-gray-600'}>
                        {item.daysUntilDue < 0 
                          ? `${Math.abs(item.daysUntilDue)} days overdue`
                          : `${item.daysUntilDue} days`
                        }
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenForm(item.id)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                      >
                        Edit
                      </button>
                      {item.id === 'cofa' && (
                        <button
                          onClick={() => setIsCofAExtensionOpen(true)}
                          className="text-green-600 hover:text-green-900 focus:outline-none focus:underline"
                        >
                          Extend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? `Edit ${monitoringItems.find(m => m.id === editingItem)?.name || 'Item'}` : 'Edit Aircraft Information'}
              </h3>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {editingItem ? (
                  // Monitoring item form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Done Date
                      </label>
                      <input
                        type="date"
                        value={formData.lastDone}
                        onChange={(e) => handleInputChange('lastDone', e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    {(editingItem !== 'cofa' && editingItem !== 'wandb' && editingItem !== 'fireextinguisher' && editingItem !== 'standbycompass') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Next Due Date
                        </label>
                        <input
                          type="date"
                          value={formData.nextDue}
                          onChange={(e) => handleInputChange('nextDue', e.target.value)}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to auto-calculate
                        </p>
                      </div>
                    )}
                    
                    {(editingItem === 'cofa' || editingItem === 'wandb' || editingItem === 'fireextinguisher' || editingItem === 'standbycompass') && (
                      <div className="rounded bg-blue-50 p-3">
                        <p className="text-sm text-blue-800">
                          Next due date will be automatically calculated ({editingItem === 'cofa' ? '1 year' : editingItem === 'wandb' ? '5 years' : '1 year - 1 day'} from last done date)
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  // Aircraft information form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year of Manufacture
                      </label>
                      <input
                        type="number"
                        value={formData.yearOfManufacture || currentAircraft.yearOfManufacture || ''}
                        onChange={(e) => handleInputChange('yearOfManufacture', e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Serial Number
                      </label>
                      <input
                        type="text"
                        value={formData.serialNumber || currentAircraft.serialNumber || ''}
                        onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        value={formData.manufacturer || currentAircraft.manufacturer || ''}
                        onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engine Number
                      </label>
                      <input
                        type="text"
                        value={formData.engineNumber || currentAircraft.engineNumber || ''}
                        onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Propeller Number
                      </label>
                      <input
                        type="text"
                        value={formData.propellerNumber || currentAircraft.propellerNumber || ''}
                        onChange={(e) => handleInputChange('propellerNumber', e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CofA Extension Modal */}
      {isCofAExtensionOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Extend CofA
              </h3>
              
              <form onSubmit={handleCofAExtensionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extension Date
                  </label>
                  <input
                    type="date"
                    value={cofaExtensionData.extensionDate}
                    onChange={(e) => setCofAExtensionData({...cofaExtensionData, extensionDate: e.target.value})}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extension Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cofaExtensionData.extensionDays}
                    onChange={(e) => setCofAExtensionData({...cofaExtensionData, extensionDays: e.target.value})}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter number of days"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCofAExtensionClose}
                    className="rounded-md bg-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : "Extend CofA"}
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