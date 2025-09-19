"use client";
import { useState, useEffect } from "react";
import { Aircraft, Snag, SnagStatus, SnagSeverity, ADSB, ADSBStatus, ADSBPriority, ADSBType, ADSBComputedStatus, ADD, ADDStatus, ADDCategory, ADDComputedStatus, Personnel, TrainingRecord } from "@/lib/types";
import { AircraftCard } from "./AircraftCard";
import { PersonnelTracking } from "./PersonnelTracking";

type Tab = "fleet" | "snags" | "ad-sb" | "active-add" | "flying-hours" | "training";

interface MainDashboardTabsProps {
  aircraft: Aircraft[];
}

export const MainDashboardTabs = ({ aircraft }: MainDashboardTabsProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("fleet");
  const [aircraftList, setAircraftList] = useState<Aircraft[]>(aircraft);
  const [snags, setSnags] = useState<Snag[]>([]);
  const [adsbRecords, setAdsbRecords] = useState<ADSB[]>([]);
  const [addRecords, setAddRecords] = useState<ADD[]>([]);
  const [isSnagModalOpen, setIsSnagModalOpen] = useState(false);
  const [isAdsbModalOpen, setIsAdsbModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSnag, setEditingSnag] = useState<Snag | null>(null);
  const [editingAdsb, setEditingAdsb] = useState<ADSB | null>(null);
  const [editingAdd, setEditingAdd] = useState<ADD | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [snagForm, setSnagForm] = useState({
    snagId: "",
    dateReported: new Date().toISOString().split('T')[0],
    aircraftId: "",
    description: "",
    status: "Open" as SnagStatus,
    severity: "Minor" as SnagSeverity,
    partsOrdered: false,
    action: "",
    notes: "",
    reportedBy: "",
    assignedTo: "",
    estimatedResolutionDate: ""
  });
  const [adsbForm, setAdsbForm] = useState({
    documentNumber: "",
    type: "AD" as ADSBType,
    title: "",
    description: "",
    aircraftType: "",
    aircraftId: "",
    applicableToAll: false,
    status: "Active" as ADSBStatus,
    priority: "Medium" as ADSBPriority,
    issueDate: new Date().toISOString().split('T')[0],
    effectiveDate: new Date().toISOString().split('T')[0],
    complianceDate: "",
    dueDate: "",
    completedDate: "",
    reference: "",
    revision: "",
    supersededBy: "",
    supersedes: "",
    complianceAction: "",
    complianceNotes: "",
    assignedTo: "",
    estimatedCost: 0,
    actualCost: 0,
    partsRequired: false,
    partsOrdered: false,
    partsReceived: false,
    workOrderNumber: "",
    complianceCertificate: ""
  });
  const [addForm, setAddForm] = useState({
    addNumber: "",
    aircraftId: "",
    title: "",
    description: "",
    category: "A" as ADDCategory,
    status: "Active" as ADDStatus,
    reportedDate: new Date().toISOString().split('T')[0],
    reportedBy: "",
    deferralPeriod: 1,
    deferralExpiryDate: "",
    resolvedDate: "",
    resolvedBy: "",
    notes: ""
  });

  const handleAircraftUpdate = (updatedAircraft: Aircraft) => {
    setAircraftList(prev => 
      prev.map(ac => ac.id === updatedAircraft.id ? updatedAircraft : ac)
    );
  };

  // Load snags and AD/SB records on component mount
  useEffect(() => {
    const loadSnags = async () => {
      try {
        const response = await fetch('/api/snags');
        if (response.ok) {
          const snagsData = await response.json();
          setSnags(snagsData);
        }
      } catch (error) {
        console.error('Error loading snags:', error);
      }
    };

    const loadAdsbRecords = async () => {
      try {
        const response = await fetch('/api/adsb');
        if (response.ok) {
          const adsbData = await response.json();
          setAdsbRecords(adsbData);
        }
      } catch (error) {
        console.error('Error loading AD/SB records:', error);
      }
    };

    const loadAddRecords = async () => {
      try {
        const response = await fetch('/api/add');
        if (response.ok) {
          const addData = await response.json();
          setAddRecords(addData);
        }
      } catch (error) {
        console.error('Error loading ADD records:', error);
      }
    };

    loadSnags();
    loadAdsbRecords();
    loadAddRecords();
  }, []);

  const tabs = [
    { id: "fleet" as Tab, label: "Fleet Management" },
    { id: "snags" as Tab, label: "Snags Tracking" },
    { id: "ad-sb" as Tab, label: "AD/SB Compliance" },
    { id: "active-add" as Tab, label: "Active ADD" },
    { id: "flying-hours" as Tab, label: "Month Flying Hours" },
    { id: "training" as Tab, label: "Maintenance Training" },
  ];

  const handleTabClick = (tabId: Tab) => {
    setActiveTab(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: Tab) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTabClick(tabId);
    }
  };

  const generateSnagId = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SNG${year}${month}${day}${random}`;
  };

  const handleOpenSnagModal = (snag?: Snag) => {
    if (snag) {
      setEditingSnag(snag);
      setSnagForm({
        snagId: snag.snagId,
        dateReported: snag.dateReported,
        aircraftId: snag.aircraftId,
        description: snag.description,
        status: snag.status,
        severity: snag.severity,
        partsOrdered: snag.partsOrdered,
        action: snag.action,
        notes: snag.notes || "",
        reportedBy: snag.reportedBy || "",
        assignedTo: snag.assignedTo || "",
        estimatedResolutionDate: snag.estimatedResolutionDate || ""
      });
    } else {
      setEditingSnag(null);
      setSnagForm({
        snagId: generateSnagId(),
        dateReported: new Date().toISOString().split('T')[0],
        aircraftId: "",
        description: "",
        status: "Open",
        severity: "Minor",
        partsOrdered: false,
        action: "",
        notes: "",
        reportedBy: "",
        assignedTo: "",
        estimatedResolutionDate: ""
      });
    }
    setIsSnagModalOpen(true);
  };

  const handleCloseSnagModal = () => {
    setIsSnagModalOpen(false);
    setEditingSnag(null);
    setSnagForm({
      snagId: "",
      dateReported: new Date().toISOString().split('T')[0],
      aircraftId: "",
      description: "",
      status: "Open",
      severity: "Minor",
      partsOrdered: false,
      action: "",
      notes: "",
      reportedBy: "",
      assignedTo: "",
      estimatedResolutionDate: ""
    });
  };

  const handleSaveSnag = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingSnag ? `/api/snags/${editingSnag.id}` : '/api/snags';
      const method = editingSnag ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(snagForm),
      });

      if (!response.ok) {
        throw new Error('Failed to save snag');
      }

      const savedSnag = await response.json();
      
      if (editingSnag) {
        setSnags(prev => prev.map(s => s.id === editingSnag.id ? savedSnag : s));
      } else {
        setSnags(prev => [...prev, savedSnag]);
      }

      handleCloseSnagModal();
    } catch (error) {
      console.error('Error saving snag:', error);
      alert('Failed to save snag. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSnag = async (snagId: string) => {
    if (!confirm('Are you sure you want to delete this snag?')) return;

    try {
      const response = await fetch(`/api/snags/${snagId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete snag');
      }

      setSnags(prev => prev.filter(s => s.id !== snagId));
    } catch (error) {
      console.error('Error deleting snag:', error);
      alert('Failed to delete snag. Please try again.');
    }
  };

  // AD/SB handlers
  const handleOpenAdsbModal = (adsb?: ADSB) => {
    if (adsb) {
      setEditingAdsb(adsb);
      setAdsbForm({
        documentNumber: adsb.documentNumber,
        type: adsb.type,
        title: adsb.title,
        description: adsb.description,
        aircraftType: adsb.aircraftType || "",
        aircraftId: adsb.aircraftId || "",
        applicableToAll: adsb.applicableToAll || false,
        status: adsb.status,
        priority: adsb.priority,
        issueDate: adsb.issueDate,
        effectiveDate: adsb.effectiveDate,
        complianceDate: adsb.complianceDate || "",
        dueDate: adsb.dueDate || "",
        completedDate: adsb.completedDate || "",
        reference: adsb.reference || "",
        revision: adsb.revision || "",
        supersededBy: adsb.supersededBy || "",
        supersedes: adsb.supersedes || "",
        complianceAction: adsb.complianceAction || "",
        complianceNotes: adsb.complianceNotes || "",
        assignedTo: adsb.assignedTo || "",
        estimatedCost: adsb.estimatedCost || 0,
        actualCost: adsb.actualCost || 0,
        partsRequired: adsb.partsRequired || false,
        partsOrdered: adsb.partsOrdered || false,
        partsReceived: adsb.partsReceived || false,
        workOrderNumber: adsb.workOrderNumber || "",
        complianceCertificate: adsb.complianceCertificate || ""
      });
    } else {
      setEditingAdsb(null);
      setAdsbForm({
        documentNumber: "",
        type: "AD",
        title: "",
        description: "",
        aircraftType: "",
        aircraftId: "",
        applicableToAll: false,
        status: "Active",
        priority: "Medium",
        issueDate: new Date().toISOString().split('T')[0],
        effectiveDate: new Date().toISOString().split('T')[0],
        complianceDate: "",
        dueDate: "",
        completedDate: "",
        reference: "",
        revision: "",
        supersededBy: "",
        supersedes: "",
        complianceAction: "",
        complianceNotes: "",
        assignedTo: "",
        estimatedCost: 0,
        actualCost: 0,
        partsRequired: false,
        partsOrdered: false,
        partsReceived: false,
        workOrderNumber: "",
        complianceCertificate: ""
      });
    }
    setIsAdsbModalOpen(true);
  };

  const handleCloseAdsbModal = () => {
    setIsAdsbModalOpen(false);
    setEditingAdsb(null);
    setAdsbForm({
      documentNumber: "",
      type: "AD",
      title: "",
      description: "",
      aircraftType: "",
      aircraftId: "",
      applicableToAll: false,
      status: "Active",
      priority: "Medium",
      issueDate: new Date().toISOString().split('T')[0],
      effectiveDate: new Date().toISOString().split('T')[0],
      complianceDate: "",
      dueDate: "",
      completedDate: "",
      reference: "",
      revision: "",
      supersededBy: "",
      supersedes: "",
      complianceAction: "",
      complianceNotes: "",
      assignedTo: "",
      estimatedCost: 0,
      actualCost: 0,
      partsRequired: false,
      partsOrdered: false,
      partsReceived: false,
      workOrderNumber: "",
      complianceCertificate: ""
    });
  };

  const handleSaveAdsb = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingAdsb ? `/api/adsb/${editingAdsb.id}` : '/api/adsb';
      const method = editingAdsb ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adsbForm),
      });

      if (!response.ok) {
        throw new Error('Failed to save AD/SB record');
      }

      const savedAdsb = await response.json();
      
      if (editingAdsb) {
        setAdsbRecords(prev => prev.map(a => a.id === editingAdsb.id ? savedAdsb : a));
      } else {
        setAdsbRecords(prev => [...prev, savedAdsb]);
      }

      handleCloseAdsbModal();
    } catch (error) {
      console.error('Error saving AD/SB record:', error);
      alert('Failed to save AD/SB record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdsb = async (adsbId: string) => {
    if (!confirm('Are you sure you want to delete this AD/SB record?')) return;

    try {
      const response = await fetch(`/api/adsb/${adsbId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete AD/SB record');
      }

      setAdsbRecords(prev => prev.filter(a => a.id !== adsbId));
    } catch (error) {
      console.error('Error deleting AD/SB record:', error);
      alert('Failed to delete AD/SB record. Please try again.');
    }
  };

  // ADD handlers
  const handleOpenAddModal = (add?: ADD) => {
    if (add) {
      setEditingAdd(add);
      setAddForm({
        addNumber: add.addNumber,
        aircraftId: add.aircraftId,
        title: add.title,
        description: add.description,
        category: add.category,
        status: add.status,
        reportedDate: add.reportedDate,
        reportedBy: add.reportedBy,
        deferralPeriod: add.deferralPeriod,
        deferralExpiryDate: add.deferralExpiryDate,
        resolvedDate: add.resolvedDate || "",
        resolvedBy: add.resolvedBy || "",
        notes: add.notes || ""
      });
    } else {
      setEditingAdd(null);
      setAddForm({
        addNumber: "",
        aircraftId: "",
        title: "",
        description: "",
        category: "A",
        status: "Active",
        reportedDate: new Date().toISOString().split('T')[0],
        reportedBy: "",
        deferralPeriod: 1,
        deferralExpiryDate: "",
        resolvedDate: "",
        resolvedBy: "",
        notes: ""
      });
    }
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setEditingAdd(null);
    setAddForm({
      addNumber: "",
      aircraftId: "",
      title: "",
      description: "",
      category: "A",
      status: "Active",
      reportedDate: new Date().toISOString().split('T')[0],
      reportedBy: "",
      deferralPeriod: 1,
      deferralExpiryDate: "",
      resolvedDate: "",
      resolvedBy: "",
      notes: ""
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingAdd ? `/api/add/${editingAdd.id}` : '/api/add';
      const method = editingAdd ? 'PUT' : 'POST';

      // Remove deferralExpiryDate from the form data as it should be calculated by the API
      const { deferralExpiryDate, ...formData } = addForm;

      console.log('Saving ADD with data:', formData);
      console.log('URL:', url, 'Method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to save ADD record: ${response.status} ${response.statusText}`);
      }

      const savedAdd = await response.json();
      
      if (editingAdd) {
        setAddRecords(prev => prev.map(a => a.id === editingAdd.id ? savedAdd : a));
      } else {
        setAddRecords(prev => [...prev, savedAdd]);
      }

      handleCloseAddModal();
    } catch (error) {
      console.error('Error saving ADD record:', error);
      alert('Failed to save ADD record. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAdd = async (addId: string) => {
    if (!confirm('Are you sure you want to delete this ADD record?')) return;

    try {
      const response = await fetch(`/api/add/${addId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete ADD record');
      }

      setAddRecords(prev => prev.filter(a => a.id !== addId));
    } catch (error) {
      console.error('Error deleting ADD record:', error);
      alert('Failed to delete ADD record. Please try again.');
    }
  };

  const getSeverityColor = (severity: SnagSeverity): string => {
    switch (severity) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "Major": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Minor": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cosmetic": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: SnagStatus): string => {
    switch (status) {
      case "Open": return "bg-red-100 text-red-800 border-red-200";
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Awaiting Parts": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Resolved": return "bg-green-100 text-green-800 border-green-200";
      case "Closed": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAdsbStatusColor = (status: ADSBStatus): string => {
    switch (status) {
      case "Overdue": return "bg-red-100 text-red-800 border-red-200";
      case "Due Soon": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Active": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Compliant": return "bg-green-100 text-green-800 border-green-200";
      case "Not Applicable": return "bg-gray-100 text-gray-800 border-gray-200";
      case "Superseded": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAdsbPriorityColor = (priority: ADSBPriority): string => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAddStatusColor = (status: ADDComputedStatus): string => {
    switch (status) {
      case "Active": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved": return "bg-green-100 text-green-800 border-green-200";
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Due Soon": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAddCategoryColor = (category: ADDCategory): string => {
    switch (category) {
      case "A": return "bg-red-100 text-red-800 border-red-200";
      case "B": return "bg-orange-100 text-orange-800 border-orange-200";
      case "C": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "D": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to calculate computed status based on dates
  const calculateComputedStatus = (adsb: ADSB): ADSBComputedStatus => {
    // If already completed or superseded, return as is
    if (adsb.status === "Compliant" || adsb.status === "Superseded" || adsb.status === "Not Applicable") {
      return adsb.status;
    }

    // If no due date, return Active
    if (!adsb.dueDate) {
      return "Active";
    }

    const today = new Date();
    const dueDate = new Date(adsb.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // If overdue (past due date)
    if (daysUntilDue < 0) {
      return "Overdue";
    }

    // If due within 30 days
    if (daysUntilDue <= 30) {
      return "Due Soon";
    }

    // Otherwise, it's active
    return "Active";
  };

  // Function to calculate computed status for ADD based on expiry dates
  const calculateAddComputedStatus = (add: ADD): ADDComputedStatus => {
    // If already resolved, return as is
    if (add.status === "Resolved") {
      return "Resolved";
    }

    const today = new Date();
    const expiryDate = new Date(add.deferralExpiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // If expired (past expiry date)
    if (daysUntilExpiry < 0) {
      return "Expired";
    }

    // If due within 7 days
    if (daysUntilExpiry <= 7) {
      return "Due Soon";
    }

    // Otherwise, it's active
    return "Active";
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "fleet":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Fleet Management</h2>
              <div className="text-sm text-gray-600">
                {aircraftList.length} aircraft in fleet
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aircraftList.map(a => <AircraftCard key={a.id} aircraft={a} onAircraftUpdate={handleAircraftUpdate} />)}
            </div>
          </div>
        );

      case "snags":
        const criticalSnags = snags.filter(s => s.severity === "Critical").length;
        const majorSnags = snags.filter(s => s.severity === "Major").length;
        const minorSnags = snags.filter(s => s.severity === "Minor").length;
        const openSnags = snags.filter(s => s.status === "Open").length;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Snags Tracking</h2>
              <button 
                onClick={() => handleOpenSnagModal()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add New Snag
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded bg-red-50 p-4">
                <div className="text-2xl font-bold text-red-600">{criticalSnags}</div>
                <div className="text-sm text-red-600">Critical Snags</div>
              </div>
              <div className="rounded bg-orange-50 p-4">
                <div className="text-2xl font-bold text-orange-600">{majorSnags}</div>
                <div className="text-sm text-orange-600">Major Snags</div>
              </div>
              <div className="rounded bg-yellow-50 p-4">
                <div className="text-2xl font-bold text-yellow-600">{minorSnags}</div>
                <div className="text-sm text-yellow-600">Minor Snags</div>
              </div>
              <div className="rounded bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-600">{openSnags}</div>
                <div className="text-sm text-blue-600">Open Snags</div>
              </div>
            </div>

            {/* Snags Table */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Snag ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Reported
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aircraft
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parts Ordered
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {snags.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                          No snags found. Click No snags found. Click "Add New Snag" to create one.quot;Add New SnagNo snags found. Click "Add New Snag" to create one.quot; to create one.
                        </td>
                      </tr>
                    ) : (
                      snags.map((snag) => {
                        const aircraft = aircraftList.find(a => a.id === snag.aircraftId);
                        return (
                          <tr key={snag.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {snag.snagId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(snag.dateReported).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {aircraft?.registration || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {snag.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(snag.status)}`}>
                                {snag.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getSeverityColor(snag.severity)}`}>
                                {snag.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {snag.partsOrdered ? (
                                <span className="text-green-600">✓ Yes</span>
                              ) : (
                                <span className="text-gray-400">✗ No</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleOpenSnagModal(snag)}
                                className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSnag(snag.id)}
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
          </div>
        );

      case "ad-sb":
        const overdueAds = adsbRecords.filter(r => calculateComputedStatus(r) === "Overdue").length;
        const dueSoonAds = adsbRecords.filter(r => calculateComputedStatus(r) === "Due Soon").length;
        const activeSbs = adsbRecords.filter(r => calculateComputedStatus(r) === "Active").length;
        const completedAds = adsbRecords.filter(r => calculateComputedStatus(r) === "Compliant").length;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AD/SB Compliance</h2>
              <button 
                onClick={() => handleOpenAdsbModal()}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Add AD/SB
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="rounded bg-red-50 p-4">
                <div className="text-2xl font-bold text-red-600">{overdueAds}</div>
                <div className="text-sm text-red-600">Overdue</div>
                  </div>
                  <div className="rounded bg-orange-50 p-4">
                <div className="text-2xl font-bold text-orange-600">{dueSoonAds}</div>
                    <div className="text-sm text-orange-600">Due Soon</div>
                  </div>
                  <div className="rounded bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-600">{activeSbs}</div>
                <div className="text-sm text-blue-600">Active</div>
                  </div>
                  <div className="rounded bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-600">{completedAds}</div>
                    <div className="text-sm text-green-600">Completed</div>
                  </div>
                </div>

            {/* AD/SB Table */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aircraft Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assigned To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adsbRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                          No AD/SB records found. Click No AD/SB records found. Click "Add AD/SB" to create one.quot;Add AD/SBNo AD/SB records found. Click "Add AD/SB" to create one.quot; to create one.
                        </td>
                      </tr>
                    ) : (
                      adsbRecords.map((adsb) => (
                        <tr key={adsb.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {adsb.documentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                              adsb.type === "AD" 
                                ? "bg-red-100 text-red-800 border-red-200" 
                                : "bg-blue-100 text-blue-800 border-blue-200"
                            }`}>
                              {adsb.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {adsb.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adsb.aircraftType || 'All'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getAdsbStatusColor(calculateComputedStatus(adsb))}`}>
                              {calculateComputedStatus(adsb)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getAdsbPriorityColor(adsb.priority)}`}>
                              {adsb.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adsb.dueDate ? new Date(adsb.dueDate).toLocaleDateString('en-GB') : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {adsb.assignedTo || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleOpenAdsbModal(adsb)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteAdsb(adsb.id)}
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
          </div>
        );

      case "active-add":
        const activeAdds = addRecords.filter(r => calculateAddComputedStatus(r) === "Active").length;
        const expiredAdds = addRecords.filter(r => calculateAddComputedStatus(r) === "Expired").length;
        const dueSoonAdds = addRecords.filter(r => calculateAddComputedStatus(r) === "Due Soon").length;
        const resolvedAdds = addRecords.filter(r => calculateAddComputedStatus(r) === "Resolved").length;

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Active ADD (Acceptable Deferred Defects)</h2>
              <button 
                onClick={() => handleOpenAddModal()}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
              >
                Add ADD
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-600">{activeAdds}</div>
                <div className="text-sm text-blue-600">Active</div>
              </div>
              <div className="rounded bg-red-50 p-4">
                <div className="text-2xl font-bold text-red-600">{expiredAdds}</div>
                <div className="text-sm text-red-600">Expired</div>
              </div>
              <div className="rounded bg-yellow-50 p-4">
                <div className="text-2xl font-bold text-yellow-600">{dueSoonAdds}</div>
                <div className="text-sm text-yellow-600">Due Soon</div>
              </div>
              <div className="rounded bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-600">{resolvedAdds}</div>
                <div className="text-sm text-green-600">Resolved</div>
              </div>
            </div>

            {/* ADD Table */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ADD #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aircraft
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deferral Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {addRecords.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                          No ADD records found. Click No ADD records found. Click "Add ADD" to create one.quot;Add ADDNo ADD records found. Click "Add ADD" to create one.quot; to create one.
                        </td>
                      </tr>
                    ) : (
                      addRecords.map((add) => {
                        const aircraft = aircraftList.find(a => a.id === add.aircraftId);
                        const computedStatus = calculateAddComputedStatus(add);
                        const rowColor = computedStatus === "Expired" ? "bg-red-50" : 
                                        computedStatus === "Due Soon" ? "bg-yellow-50" : 
                                        "hover:bg-gray-50";
                        
                        return (
                          <tr key={add.id} className={`${rowColor} hover:bg-gray-100`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {add.addNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {aircraft?.registration || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {add.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getAddCategoryColor(add.category)}`}>
                                Category {add.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getAddStatusColor(computedStatus)}`}>
                                {computedStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {add.deferralPeriod} days
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(add.deferralExpiryDate).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {add.reportedBy}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleOpenAddModal(add)}
                                className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteAdd(add.id)}
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
          </div>
        );

      case "flying-hours":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Month Flying Hours</h2>
              <div className="flex gap-2">
                <select className="rounded border border-gray-300 px-3 py-2 text-sm">
                  <option>January 2025</option>
                  <option>February 2025</option>
                  <option>March 2025</option>
                </select>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Export Report
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aircraftList.map(ac => (
                <div key={ac.id} className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{ac.registration}</h3>
                    <span className="text-sm text-gray-500">{ac.type}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Hours:</span>
                      <span className="font-medium">{ac.currentHrs.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month:</span>
                      <span className="font-medium">{(ac.avgDailyHrs * 30).toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg Daily:</span>
                      <span className="font-medium">{ac.avgDailyHrs.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cycles:</span>
                      <span className="font-medium">{ac.currentCyc}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "training":
        return <PersonnelTracking />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <div id={`tabpanel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
          {renderTabContent()}
        </div>
      </div>

      {/* Snag Modal */}
      {isSnagModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingSnag ? `Edit Snag ${editingSnag.snagId}` : 'Add New Snag'}
              </h3>
              
              <form onSubmit={handleSaveSnag} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Snag ID
                    </label>
                    <input
                      type="text"
                      value={snagForm.snagId}
                      onChange={(e) => setSnagForm({...snagForm, snagId: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                      disabled={!!editingSnag}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Reported
                    </label>
                    <input
                      type="date"
                      value={snagForm.dateReported}
                      onChange={(e) => setSnagForm({...snagForm, dateReported: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aircraft
                    </label>
                    <select
                      value={snagForm.aircraftId}
                      onChange={(e) => setSnagForm({...snagForm, aircraftId: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Aircraft</option>
                      {aircraftList.map(aircraft => (
                        <option key={aircraft.id} value={aircraft.id}>
                          {aircraft.registration} - {aircraft.type}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={snagForm.severity}
                      onChange={(e) => setSnagForm({...snagForm, severity: e.target.value as SnagSeverity})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Critical">Critical</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                      <option value="Cosmetic">Cosmetic</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={snagForm.description}
                    onChange={(e) => setSnagForm({...snagForm, description: e.target.value})}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detailed description of the snag..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={snagForm.status}
                      onChange={(e) => setSnagForm({...snagForm, status: e.target.value as SnagStatus})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Awaiting Parts">Awaiting Parts</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Resolution Date
                    </label>
                    <input
                      type="date"
                      value={snagForm.estimatedResolutionDate}
                      onChange={(e) => setSnagForm({...snagForm, estimatedResolutionDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Required
                  </label>
                  <textarea
                    value={snagForm.action}
                    onChange={(e) => setSnagForm({...snagForm, action: e.target.value})}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="What action needs to be taken to resolve this snag?"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reported By
                    </label>
                    <input
                      type="text"
                      value={snagForm.reportedBy}
                      onChange={(e) => setSnagForm({...snagForm, reportedBy: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Name of person who reported the snag"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={snagForm.assignedTo}
                      onChange={(e) => setSnagForm({...snagForm, assignedTo: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Name of person assigned to fix the snag"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="partsOrdered"
                    checked={snagForm.partsOrdered}
                    onChange={(e) => setSnagForm({...snagForm, partsOrdered: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="partsOrdered" className="ml-2 block text-sm text-gray-900">
                    Parts have been ordered
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={snagForm.notes}
                    onChange={(e) => setSnagForm({...snagForm, notes: e.target.value})}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional notes or comments..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseSnagModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : (editingSnag ? "Update Snag" : "Create Snag")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AD/SB Modal */}
      {isAdsbModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAdsb ? `Edit ${editingAdsb.type} ${editingAdsb.documentNumber}` : 'Add New AD/SB'}
              </h3>
              
              <form onSubmit={handleSaveAdsb} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Number *
                    </label>
                    <input
                      type="text"
                      value={adsbForm.documentNumber}
                      onChange={(e) => setAdsbForm({...adsbForm, documentNumber: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., AD-2024-001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type *
                    </label>
                    <select
                      value={adsbForm.type}
                      onChange={(e) => setAdsbForm({...adsbForm, type: e.target.value as ADSBType})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="AD">AD (Airworthiness Directive)</option>
                      <option value="SB">SB (Service Bulletin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority *
                    </label>
                    <select
                      value={adsbForm.priority}
                      onChange={(e) => setAdsbForm({...adsbForm, priority: e.target.value as ADSBPriority})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={adsbForm.title}
                    onChange={(e) => setAdsbForm({...adsbForm, title: e.target.value})}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Brief title of the AD/SB"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={adsbForm.description}
                    onChange={(e) => setAdsbForm({...adsbForm, description: e.target.value})}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detailed description of the AD/SB requirement..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aircraft Type
                    </label>
                    <select
                      value={adsbForm.aircraftType}
                      onChange={(e) => setAdsbForm({...adsbForm, aircraftType: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Aircraft Type</option>
                      <option value="DHC-8">DHC-8</option>
                      <option value="PC-12">PC-12</option>
                      <option value="All">All Aircraft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={adsbForm.status}
                      onChange={(e) => setAdsbForm({...adsbForm, status: e.target.value as ADSBStatus})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Compliant">Compliant</option>
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Superseded">Superseded</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      "Due Soon" and "Overdue" are calculated automatically based on due datequot;Due Soon"Due Soon" and "Overdue" are calculated automatically based on due datequot; and "Due Soon" and "Overdue" are calculated automatically based on due datequot;Overdue"Due Soon" and "Overdue" are calculated automatically based on due datequot; are calculated automatically based on due date
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={adsbForm.assignedTo}
                      onChange={(e) => setAdsbForm({...adsbForm, assignedTo: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Person responsible for compliance"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={adsbForm.issueDate}
                      onChange={(e) => setAdsbForm({...adsbForm, issueDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date *
                    </label>
                    <input
                      type="date"
                      value={adsbForm.effectiveDate}
                      onChange={(e) => setAdsbForm({...adsbForm, effectiveDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={adsbForm.dueDate}
                      onChange={(e) => setAdsbForm({...adsbForm, dueDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference
                    </label>
                    <input
                      type="text"
                      value={adsbForm.reference}
                      onChange={(e) => setAdsbForm({...adsbForm, reference: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., FAA AD 2024-01-15"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Work Order Number
                    </label>
                    <input
                      type="text"
                      value={adsbForm.workOrderNumber}
                      onChange={(e) => setAdsbForm({...adsbForm, workOrderNumber: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Work order reference"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compliance Action
                  </label>
                  <textarea
                    value={adsbForm.complianceAction}
                    onChange={(e) => setAdsbForm({...adsbForm, complianceAction: e.target.value})}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="What action needs to be taken for compliance?"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Cost ($)
                    </label>
                    <input
                      type="number"
                      value={adsbForm.estimatedCost}
                      onChange={(e) => setAdsbForm({...adsbForm, estimatedCost: parseFloat(e.target.value) || 0})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Cost ($)
                    </label>
                    <input
                      type="number"
                      value={adsbForm.actualCost}
                      onChange={(e) => setAdsbForm({...adsbForm, actualCost: parseFloat(e.target.value) || 0})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="partsRequired"
                      checked={adsbForm.partsRequired}
                      onChange={(e) => setAdsbForm({...adsbForm, partsRequired: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="partsRequired" className="ml-2 block text-sm text-gray-900">
                      Parts Required
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="partsOrdered"
                      checked={adsbForm.partsOrdered}
                      onChange={(e) => setAdsbForm({...adsbForm, partsOrdered: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="partsOrdered" className="ml-2 block text-sm text-gray-900">
                      Parts Ordered
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="partsReceived"
                      checked={adsbForm.partsReceived}
                      onChange={(e) => setAdsbForm({...adsbForm, partsReceived: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="partsReceived" className="ml-2 block text-sm text-gray-900">
                      Parts Received
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compliance Notes
                  </label>
                  <textarea
                    value={adsbForm.complianceNotes}
                    onChange={(e) => setAdsbForm({...adsbForm, complianceNotes: e.target.value})}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional notes about compliance status..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseAdsbModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : (editingAdsb ? "Update AD/SB" : "Create AD/SB")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ADD Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingAdd ? `Edit ADD ${editingAdd.addNumber}` : 'Add New ADD (Acceptable Deferred Defect)'}
              </h3>
              
              <form onSubmit={handleSaveAdd} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ADD Number *
                    </label>
                    <input
                      type="text"
                      value={addForm.addNumber}
                      onChange={(e) => setAddForm({...addForm, addNumber: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., ADD-2024-001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aircraft *
                    </label>
                    <select
                      value={addForm.aircraftId}
                      onChange={(e) => setAddForm({...addForm, aircraftId: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Aircraft</option>
                      {aircraftList.map(aircraft => (
                        <option key={aircraft.id} value={aircraft.id}>
                          {aircraft.registration} - {aircraft.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={addForm.category}
                      onChange={(e) => setAddForm({...addForm, category: e.target.value as ADDCategory})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="A">Category A (User specified days)</option>
                      <option value="B">Category B (3 days)</option>
                      <option value="C">Category C (10 days)</option>
                      <option value="D">Category D (120 days)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm({...addForm, title: e.target.value})}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Brief title of the defect"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Detailed description of the defect, including measurements, extent of damage, etc."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reported Date *
                    </label>
                    <input
                      type="date"
                      value={addForm.reportedDate}
                      onChange={(e) => setAddForm({...addForm, reportedDate: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reported By *
                    </label>
                    <input
                      type="text"
                      value={addForm.reportedBy}
                      onChange={(e) => setAddForm({...addForm, reportedBy: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Name of person who reported the defect"
                      required
                    />
                  </div>
                </div>


                {addForm.category === "A" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deferral Period (Days) *
                    </label>
                    <input
                      type="number"
                      value={addForm.deferralPeriod}
                      onChange={(e) => setAddForm({...addForm, deferralPeriod: parseInt(e.target.value) || 1})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="1"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Category A allows user to specify the deferral period
                    </p>
                  </div>
                )}

                {addForm.category !== "A" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deferral Period (Days)
                    </label>
                    <input
                      type="text"
                      value={
                        addForm.category === "B" ? "3" :
                        addForm.category === "C" ? "10" :
                        addForm.category === "D" ? "120" : ""
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Category {addForm.category} has a fixed deferral period
                    </p>
                  </div>
                )}

                {editingAdd && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={addForm.status}
                        onChange={(e) => setAddForm({...addForm, status: e.target.value as ADDStatus})}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Active">Active</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                    
                    {addForm.status === "Resolved" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resolved Date
                        </label>
                        <input
                          type="date"
                          value={addForm.resolvedDate}
                          onChange={(e) => setAddForm({...addForm, resolvedDate: e.target.value})}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}

                {addForm.status === "Resolved" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resolved By *
                    </label>
                    <input
                      type="text"
                      value={addForm.resolvedBy}
                      onChange={(e) => setAddForm({...addForm, resolvedBy: e.target.value})}
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Name of person who resolved the defect"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={addForm.notes}
                    onChange={(e) => setAddForm({...addForm, notes: e.target.value})}
                    rows={2}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Additional notes or comments..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseAddModal}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-400"
                  >
                    {isSaving ? "Saving..." : (editingAdd ? "Update ADD" : "Create ADD")}
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
