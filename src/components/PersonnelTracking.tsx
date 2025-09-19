"use client";
import { useState, useEffect } from "react";
import { Personnel, PersonnelRole, PersonnelStatus, TrainingRecord, TrainingType, TrainingStatus, PersonnelCertification, CertificationStatus } from "@/lib/types";

interface PersonnelTrackingProps {
  // Props can be added here as needed
}

export const PersonnelTracking = ({}: PersonnelTrackingProps) => {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [editingTraining, setEditingTraining] = useState<TrainingRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [personnelForm, setPersonnelForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Maintenance Technician" as PersonnelRole,
    status: "Active" as PersonnelStatus,
    hireDate: new Date().toISOString().split('T')[0],
    terminationDate: "",
    notes: ""
  });

  const [trainingForm, setTrainingForm] = useState({
    personnelId: "",
    trainingType: "Initial Training" as TrainingType,
    title: "",
    description: "",
    provider: "",
    instructor: "",
    status: "Scheduled" as TrainingStatus,
    scheduledDate: "",
    startDate: "",
    completionDate: "",
    expiryDate: "",
    durationHours: 0,
    score: 0,
    passFail: false,
    certificateNumber: "",
    reference: "",
    notes: ""
  });

  // Load data on component mount
  useEffect(() => {
    const loadPersonnel = async () => {
      try {
        const response = await fetch('/api/personnel');
        if (response.ok) {
          const personnelData = await response.json();
          setPersonnel(personnelData);
        }
      } catch (error) {
        console.error('Error loading personnel:', error);
      }
    };

    const loadTraining = async () => {
      try {
        const response = await fetch('/api/training');
        if (response.ok) {
          const trainingData = await response.json();
          setTrainingRecords(trainingData);
        }
      } catch (error) {
        console.error('Error loading training records:', error);
      }
    };

    loadPersonnel();
    loadTraining();
  }, []);

  const handleOpenPersonnelModal = (person?: Personnel) => {
    if (person) {
      setEditingPersonnel(person);
      setPersonnelForm({
        employeeId: person.employeeId,
        firstName: person.firstName,
        lastName: person.lastName,
        email: person.email || "",
        phone: person.phone || "",
        role: person.role,
        status: person.status,
        hireDate: person.hireDate,
        terminationDate: person.terminationDate || "",
        notes: person.notes || ""
      });
    } else {
      setEditingPersonnel(null);
      setPersonnelForm({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "Maintenance Technician",
        status: "Active",
        hireDate: new Date().toISOString().split('T')[0],
        terminationDate: "",
        notes: ""
      });
    }
    setIsPersonnelModalOpen(true);
  };

  const handleClosePersonnelModal = () => {
    setIsPersonnelModalOpen(false);
    setEditingPersonnel(null);
  };

  const handleSavePersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingPersonnel ? `/api/personnel/${editingPersonnel.id}` : '/api/personnel';
      const method = editingPersonnel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personnelForm),
      });

      if (!response.ok) throw new Error('Failed to save personnel');

      const savedPersonnel = await response.json();
      
      if (editingPersonnel) {
        setPersonnel(prev => prev.map(p => p.id === editingPersonnel.id ? savedPersonnel : p));
      } else {
        setPersonnel(prev => [...prev, savedPersonnel]);
      }

      handleClosePersonnelModal();
    } catch (error) {
      console.error('Error saving personnel:', error);
      alert('Failed to save personnel. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePersonnel = async (personnelId: string) => {
    if (!confirm('Are you sure you want to delete this personnel record?')) return;

    try {
      const response = await fetch(`/api/personnel/${personnelId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete personnel');
      setPersonnel(prev => prev.filter(p => p.id !== personnelId));
    } catch (error) {
      console.error('Error deleting personnel:', error);
      alert('Failed to delete personnel. Please try again.');
    }
  };

  const handleOpenTrainingModal = (training?: TrainingRecord) => {
    if (training) {
      setEditingTraining(training);
      setTrainingForm({
        personnelId: training.personnelId,
        trainingType: training.trainingType,
        title: training.title,
        description: training.description,
        provider: training.provider,
        instructor: training.instructor || "",
        status: training.status,
        scheduledDate: training.scheduledDate || "",
        startDate: training.startDate || "",
        completionDate: training.completionDate || "",
        expiryDate: training.expiryDate || "",
        durationHours: training.durationHours || 0,
        score: training.score || 0,
        passFail: training.passFail || false,
        certificateNumber: training.certificateNumber || "",
        reference: training.reference || "",
        notes: training.notes || ""
      });
    } else {
      setEditingTraining(null);
      setTrainingForm({
        personnelId: "",
        trainingType: "Initial Training",
        title: "",
        description: "",
        provider: "",
        instructor: "",
        status: "Scheduled",
        scheduledDate: "",
        startDate: "",
        completionDate: "",
        expiryDate: "",
        durationHours: 0,
        score: 0,
        passFail: false,
        certificateNumber: "",
        reference: "",
        notes: ""
      });
    }
    setIsTrainingModalOpen(true);
  };

  const handleCloseTrainingModal = () => {
    setIsTrainingModalOpen(false);
    setEditingTraining(null);
  };

  const handleSaveTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingTraining ? `/api/training/${editingTraining.id}` : '/api/training';
      const method = editingTraining ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trainingForm),
      });

      if (!response.ok) throw new Error('Failed to save training record');

      const savedTraining = await response.json();
      
      if (editingTraining) {
        setTrainingRecords(prev => prev.map(t => t.id === editingTraining.id ? savedTraining : t));
      } else {
        setTrainingRecords(prev => [...prev, savedTraining]);
      }

      handleCloseTrainingModal();
    } catch (error) {
      console.error('Error saving training record:', error);
      alert('Failed to save training record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm('Are you sure you want to delete this training record?')) return;

    try {
      const response = await fetch(`/api/training/${trainingId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete training record');
      setTrainingRecords(prev => prev.filter(t => t.id !== trainingId));
    } catch (error) {
      console.error('Error deleting training record:', error);
      alert('Failed to delete training record. Please try again.');
    }
  };

  const getStatusColor = (status: PersonnelStatus): string => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800 border-green-200";
      case "Inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "On Leave": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Terminated": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTrainingStatusColor = (status: TrainingStatus): string => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Scheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCertificationStatusColor = (status: CertificationStatus): string => {
    switch (status) {
      case "Valid": return "bg-green-100 text-green-800 border-green-200";
      case "Expiring Soon": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Not Required": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate summary statistics
  const activePersonnel = personnel.filter(p => p.status === "Active").length;
  const expiredCertifications = personnel.reduce((count, person) => 
    count + person.certifications.filter(cert => cert.status === "Expired").length, 0);
  const expiringSoonCertifications = personnel.reduce((count, person) => 
    count + person.certifications.filter(cert => cert.status === "Expiring Soon").length, 0);
  const completedTraining = trainingRecords.filter(t => t.status === "Completed").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Maintenance Personnel Tracking</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => handleOpenPersonnelModal()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add Personnel
          </button>
          <button 
            onClick={() => handleOpenTrainingModal()}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Add Training Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded bg-blue-50 p-4">
          <div className="text-2xl font-bold text-blue-600">{activePersonnel}</div>
          <div className="text-sm text-blue-600">Active Personnel</div>
        </div>
        <div className="rounded bg-red-50 p-4">
          <div className="text-2xl font-bold text-red-600">{expiredCertifications}</div>
          <div className="text-sm text-red-600">Expired Certifications</div>
        </div>
        <div className="rounded bg-yellow-50 p-4">
          <div className="text-2xl font-bold text-yellow-600">{expiringSoonCertifications}</div>
          <div className="text-sm text-yellow-600">Expiring Soon</div>
        </div>
        <div className="rounded bg-green-50 p-4">
          <div className="text-2xl font-bold text-green-600">{completedTraining}</div>
          <div className="text-sm text-green-600">Completed Training</div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Personnel Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certifications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {personnel.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No personnel records found. Click No personnel records found. Click "Add Personnel" to create one.quot;Add PersonnelNo personnel records found. Click "Add Personnel" to create one.quot; to create one.
                  </td>
                </tr>
              ) : (
                personnel.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {person.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.firstName} {person.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(person.status)}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(person.hireDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        {person.certifications.map((cert) => (
                          <div key={cert.id} className="flex items-center space-x-2">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getCertificationStatusColor(cert.status)}`}>
                              {cert.certificationType}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenPersonnelModal(person)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePersonnel(person.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Training Records Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Training Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personnel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Training Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainingRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No training records found. Click No training records found. Click "Add Training Record" to create one.quot;Add Training RecordNo training records found. Click "Add Training Record" to create one.quot; to create one.
                  </td>
                </tr>
              ) : (
                trainingRecords.map((training) => {
                  const person = personnel.find(p => p.id === training.personnelId);
                  return (
                    <tr key={training.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {training.trainingType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {training.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {training.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getTrainingStatusColor(training.status)}`}>
                          {training.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {training.completionDate ? new Date(training.completionDate).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {training.expiryDate ? new Date(training.expiryDate).toLocaleDateString('en-GB') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenTrainingModal(training)}
                          className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTraining(training.id)}
                          className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personnel Modal */}
      {isPersonnelModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPersonnel ? `Edit Personnel - ${editingPersonnel.employeeId}` : 'Add New Personnel'}
              </h3>
              
              <form onSubmit={handleSavePersonnel} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
                    <input
                      type="text"
                      value={personnelForm.employeeId}
                      onChange={(e) => setPersonnelForm({...personnelForm, employeeId: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                    <select
                      value={personnelForm.role}
                      onChange={(e) => setPersonnelForm({...personnelForm, role: e.target.value as PersonnelRole})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Director of Maintenance">Director of Maintenance</option>
                      <option value="Quality Manager">Quality Manager</option>
                      <option value="Certifying Staff">Certifying Staff</option>
                      <option value="Maintenance Technician">Maintenance Technician</option>
                      <option value="Inspector">Inspector</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={personnelForm.firstName}
                      onChange={(e) => setPersonnelForm({...personnelForm, firstName: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={personnelForm.lastName}
                      onChange={(e) => setPersonnelForm({...personnelForm, lastName: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={personnelForm.email}
                      onChange={(e) => setPersonnelForm({...personnelForm, email: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={personnelForm.phone}
                      onChange={(e) => setPersonnelForm({...personnelForm, phone: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={personnelForm.status}
                      onChange={(e) => setPersonnelForm({...personnelForm, status: e.target.value as PersonnelStatus})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date *</label>
                    <input
                      type="date"
                      value={personnelForm.hireDate}
                      onChange={(e) => setPersonnelForm({...personnelForm, hireDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {personnelForm.status === "Terminated" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Termination Date</label>
                    <input
                      type="date"
                      value={personnelForm.terminationDate}
                      onChange={(e) => setPersonnelForm({...personnelForm, terminationDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={personnelForm.notes}
                    onChange={(e) => setPersonnelForm({...personnelForm, notes: e.target.value})}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional notes about this personnel..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClosePersonnelModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : (editingPersonnel ? "Update Personnel" : "Create Personnel")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Training Modal */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTraining ? `Edit Training Record - ${editingTraining.title}` : 'Add New Training Record'}
              </h3>
              
              <form onSubmit={handleSaveTraining} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Personnel *</label>
                    <select
                      value={trainingForm.personnelId}
                      onChange={(e) => setTrainingForm({...trainingForm, personnelId: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Personnel</option>
                      {personnel.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName} ({person.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Training Type *</label>
                    <select
                      value={trainingForm.trainingType}
                      onChange={(e) => setTrainingForm({...trainingForm, trainingType: e.target.value as TrainingType})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Initial Training">Initial Training</option>
                      <option value="Recurrent Training">Recurrent Training</option>
                      <option value="Update Training">Update Training</option>
                      <option value="Additional Training">Additional Training</option>
                      <option value="Indoctrination Training">Indoctrination Training</option>
                      <option value="Type Training">Type Training</option>
                      <option value="MEL Training">MEL Training</option>
                      <option value="SMS Training">SMS Training</option>
                      <option value="Human Factors Training">Human Factors Training</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm({...trainingForm, title: e.target.value})}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Training course title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({...trainingForm, description: e.target.value})}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detailed description of the training..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
                    <input
                      type="text"
                      value={trainingForm.provider}
                      onChange={(e) => setTrainingForm({...trainingForm, provider: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Training provider organization"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                    <input
                      type="text"
                      value={trainingForm.instructor}
                      onChange={(e) => setTrainingForm({...trainingForm, instructor: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Instructor name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                      value={trainingForm.status}
                      onChange={(e) => setTrainingForm({...trainingForm, status: e.target.value as TrainingStatus})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Expired">Expired</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      value={trainingForm.durationHours}
                      onChange={(e) => setTrainingForm({...trainingForm, durationHours: parseInt(e.target.value) || 0})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                    <input
                      type="date"
                      value={trainingForm.scheduledDate}
                      onChange={(e) => setTrainingForm({...trainingForm, scheduledDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={trainingForm.startDate}
                      onChange={(e) => setTrainingForm({...trainingForm, startDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                    <input
                      type="date"
                      value={trainingForm.completionDate}
                      onChange={(e) => setTrainingForm({...trainingForm, completionDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={trainingForm.expiryDate}
                      onChange={(e) => setTrainingForm({...trainingForm, expiryDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
                    <input
                      type="number"
                      value={trainingForm.score}
                      onChange={(e) => setTrainingForm({...trainingForm, score: parseInt(e.target.value) || 0})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Number</label>
                    <input
                      type="text"
                      value={trainingForm.certificateNumber}
                      onChange={(e) => setTrainingForm({...trainingForm, certificateNumber: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Certificate number if applicable"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                    <input
                      type="text"
                      value={trainingForm.reference}
                      onChange={(e) => setTrainingForm({...trainingForm, reference: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Reference number or document"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="passFail"
                    checked={trainingForm.passFail}
                    onChange={(e) => setTrainingForm({...trainingForm, passFail: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="passFail" className="ml-2 block text-sm text-gray-900">
                    Pass/Fail Training
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={trainingForm.notes}
                    onChange={(e) => setTrainingForm({...trainingForm, notes: e.target.value})}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional notes about the training..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseTrainingModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : (editingTraining ? "Update Training" : "Create Training")}
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
