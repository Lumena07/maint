"use client";
import { useState } from "react";
import { MaintenanceTask, Component } from "@/lib/types";

type AddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  type: "Task" | "Component";
  onSave: (item: MaintenanceTask | Component) => void;
};

export const AddModal = ({ isOpen, onClose, type, onSave }: AddModalProps) => {
  const [formData, setFormData] = useState<any>({
    aircraftId: "ac-AAF",
    aircraftType: "C208B",
    dueUnits: ["HOURS"]
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      aircraftId: "ac-AAF",
      aircraftType: "C208B",
      dueUnits: ["HOURS"]
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, value: string) => {
    const values = value.split(',').map(v => v.trim()).filter(v => v);
    setFormData((prev: any) => ({
      ...prev,
      [field]: values
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Add New {type}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {type === "Task" ? "Title" : "Name"} *
                </label>
                <input
                  type="text"
                  value={formData.title || formData.name || ""}
                  onChange={(e) => handleChange(type === "Task" ? "title" : "name", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {type === "Task" ? "Type" : "Category"} *
                </label>
                <select
                  value={formData.type || formData.category || ""}
                  onChange={(e) => handleChange(type === "Task" ? "type" : "category", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select {type === "Task" ? "Type" : "Category"}</option>
                  {type === "Task" ? (
                    <>
                      <option value="Inspection">Inspection</option>
                      <option value="Overhaul">Overhaul</option>
                      <option value="Check">Check</option>
                      <option value="AD">AD</option>
                      <option value="SB">SB</option>
                      <option value="Custom">Custom</option>
                    </>
                  ) : (
                    <>
                      <option value="HardTime">HardTime</option>
                      <option value="LifeLimited">LifeLimited</option>
                      <option value="OnCondition">OnCondition</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">P/N</label>
                <input
                  type="text"
                  value={formData.pn || ""}
                  onChange={(e) => handleChange("pn", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">S/N</label>
                <input
                  type="text"
                  value={formData.sn || ""}
                  onChange={(e) => handleChange("sn", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Aircraft Type</label>
                <input
                  type="text"
                  value={formData.aircraftType || ""}
                  onChange={(e) => handleChange("aircraftType", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tail Specific ID</label>
                <input
                  type="text"
                  value={formData.tailSpecificId || ""}
                  onChange={(e) => handleChange("tailSpecificId", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Intervals */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Intervals</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Interval (Hrs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.initialIntervalHrs || ""}
                  onChange={(e) => handleChange("initialIntervalHrs", parseFloat(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Interval (Cyc)</label>
                <input
                  type="number"
                  value={formData.initialIntervalCyc || ""}
                  onChange={(e) => handleChange("initialIntervalCyc", parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Initial Interval (Days)</label>
                <input
                  type="number"
                  value={formData.initialIntervalDays || ""}
                  onChange={(e) => handleChange("initialIntervalDays", parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Repeat Interval (Hrs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.repeatIntervalHrs || ""}
                  onChange={(e) => handleChange("repeatIntervalHrs", parseFloat(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Repeat Interval (Cyc)</label>
                <input
                  type="number"
                  value={formData.repeatIntervalCyc || ""}
                  onChange={(e) => handleChange("repeatIntervalCyc", parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Repeat Interval (Days)</label>
                <input
                  type="number"
                  value={formData.repeatIntervalDays || ""}
                  onChange={(e) => handleChange("repeatIntervalDays", parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Legacy intervals for tasks */}
            {type === "Task" && (
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">Legacy Intervals (Optional)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interval (Hrs)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.intervalHrs || ""}
                      onChange={(e) => handleChange("intervalHrs", parseFloat(e.target.value) || undefined)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interval (Cyc)</label>
                    <input
                      type="number"
                      value={formData.intervalCyc || ""}
                      onChange={(e) => handleChange("intervalCyc", parseInt(e.target.value) || undefined)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interval (Days)</label>
                    <input
                      type="number"
                      value={formData.intervalDays || ""}
                      onChange={(e) => handleChange("intervalDays", parseInt(e.target.value) || undefined)}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Due Units (comma-separated)</label>
              <input
                type="text"
                value={formData.dueUnits?.join(', ') || ""}
                onChange={(e) => handleArrayChange("dueUnits", e.target.value)}
                placeholder="HOURS, CYCLES, DAYS"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          {/* Component-specific fields */}
          {type === "Component" && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">Component Details</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assembly ID</label>
                  <input
                    type="text"
                    value={formData.assemblyId || ""}
                    onChange={(e) => handleChange("assemblyId", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Limit (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.limitHrs || ""}
                    onChange={(e) => handleChange("limitHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Limit (Cyc)</label>
                  <input
                    type="number"
                    value={formData.limitCyc || ""}
                    onChange={(e) => handleChange("limitCyc", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Limit (Days)</label>
                  <input
                    type="number"
                    value={formData.limitDays || ""}
                    onChange={(e) => handleChange("limitDays", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grace (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.graceHrs || ""}
                    onChange={(e) => handleChange("graceHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grace (Cyc)</label>
                  <input
                    type="number"
                    value={formData.graceCyc || ""}
                    onChange={(e) => handleChange("graceCyc", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grace (Days)</label>
                  <input
                    type="number"
                    value={formData.graceDays || ""}
                    onChange={(e) => handleChange("graceDays", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Installation/Last Done Information */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">
              {type === "Task" ? "Last Done Information" : "Installation Information"}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {type === "Task" ? "Last Done Date" : "Installed Date"}
                </label>
                <input
                  type="date"
                  value={formData.lastDoneDate || formData.installedDate || ""}
                  onChange={(e) => handleChange(type === "Task" ? "lastDoneDate" : "installedDate", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference</label>
                <input
                  type="text"
                  value={formData.reference || ""}
                  onChange={(e) => handleChange("reference", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {type === "Task" ? "Last Done (Hrs)" : "Installed at Aircraft (Hrs)"}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.lastDoneHrs || formData.installedAtAcHrs || ""}
                  onChange={(e) => handleChange(type === "Task" ? "lastDoneHrs" : "installedAtAcHrs", parseFloat(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {type === "Task" ? "Last Done (Cyc)" : "Installed at Aircraft (Cyc)"}
                </label>
                <input
                  type="number"
                  value={formData.lastDoneCyc || formData.installedAtAcCyc || ""}
                  onChange={(e) => handleChange(type === "Task" ? "lastDoneCyc" : "installedAtAcCyc", parseInt(e.target.value) || undefined)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Component TSN/CSN Information */}
          {type === "Component" && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">TSN/CSN Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">TSN (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tsnHrs || ""}
                    onChange={(e) => handleChange("tsnHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CSN</label>
                  <input
                    type="number"
                    value={formData.csn || ""}
                    onChange={(e) => handleChange("csn", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">TSO (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tsoHrs || ""}
                    onChange={(e) => handleChange("tsoHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CSO</label>
                  <input
                    type="number"
                    value={formData.cso || ""}
                    onChange={(e) => handleChange("cso", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">TSN at Installation (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tsnAtInstallationHrs || ""}
                    onChange={(e) => handleChange("tsnAtInstallationHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CSN at Installation</label>
                  <input
                    type="number"
                    value={formData.csnAtInstallation || ""}
                    onChange={(e) => handleChange("csnAtInstallation", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">TSO at Installation (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tsoAtInstallationHrs || ""}
                    onChange={(e) => handleChange("tsoAtInstallationHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CSO at Installation</label>
                  <input
                    type="number"
                    value={formData.csoAtInstallation || ""}
                    onChange={(e) => handleChange("csoAtInstallation", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">TSO at Inspection (Hrs)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.tsoAtInspectionHrs || ""}
                    onChange={(e) => handleChange("tsoAtInspectionHrs", parseFloat(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">CSO at Inspection</label>
                  <input
                    type="number"
                    value={formData.csoAtInspection || ""}
                    onChange={(e) => handleChange("csoAtInspection", parseInt(e.target.value) || undefined)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Task-specific fields */}
          {type === "Task" && (
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-3">Task Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Check ID</label>
                  <input
                    type="text"
                    value={formData.checkId || ""}
                    onChange={(e) => handleChange("checkId", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Document Number</label>
                  <input
                    type="text"
                    value={formData.docNo || ""}
                    onChange={(e) => handleChange("docNo", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Revision</label>
                  <input
                    type="text"
                    value={formData.revision || ""}
                    onChange={(e) => handleChange("revision", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Source Document</label>
                  <input
                    type="text"
                    value={formData.sourceDoc || ""}
                    onChange={(e) => handleChange("sourceDoc", e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Assembly IDs (comma-separated)</label>
                <input
                  type="text"
                  value={formData.assemblyIds?.join(', ') || ""}
                  onChange={(e) => handleArrayChange("assemblyIds", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isAD || false}
                    onChange={(e) => handleChange("isAD", e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Is AD</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isSB || false}
                    onChange={(e) => handleChange("isSB", e.target.checked)}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Is SB</label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add {type}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};