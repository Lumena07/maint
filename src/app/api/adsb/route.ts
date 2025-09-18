import { NextRequest, NextResponse } from 'next/server';
import { ADSB, ADSBStatus, ADSBPriority, ADSBType } from '@/lib/types';

// Mock data storage - in a real app, this would be a database
let adsbRecords: ADSB[] = [
  {
    id: '1',
    documentNumber: 'AD-2024-001',
    type: 'AD',
    title: 'Engine Fuel Pump Inspection',
    description: 'Inspection of engine fuel pump for potential failure mode',
    aircraftType: 'DHC-8',
    applicableToAll: true,
    status: 'Active',
    priority: 'High',
    issueDate: '2024-01-15',
    effectiveDate: '2024-01-20',
    dueDate: '2024-03-15',
    reference: 'FAA AD 2024-01-15',
    complianceAction: 'Inspect fuel pump and replace if necessary',
    assignedTo: 'John Smith',
    estimatedCost: 5000,
    partsRequired: true,
    partsOrdered: false,
    partsReceived: false,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    documentNumber: 'SB-2024-002',
    type: 'SB',
    title: 'Avionics Software Update',
    description: 'Update avionics software to latest version for improved performance',
    aircraftType: 'PC-12',
    applicableToAll: true,
    status: 'Active',
    priority: 'Medium',
    issueDate: '2024-02-01',
    effectiveDate: '2024-02-01',
    dueDate: '2025-01-15', // Due in about 2 weeks from now
    reference: 'Pilatus SB 2024-02-01',
    complianceAction: 'Install software update and verify functionality',
    assignedTo: 'Mike Johnson',
    estimatedCost: 2000,
    partsRequired: false,
    partsOrdered: false,
    partsReceived: false,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    id: '3',
    documentNumber: 'AD-2024-003',
    type: 'AD',
    title: 'Landing Gear Inspection',
    description: 'Mandatory inspection of landing gear components',
    aircraftType: 'DHC-8',
    applicableToAll: true,
    status: 'Active',
    priority: 'Critical',
    issueDate: '2024-01-01',
    effectiveDate: '2024-01-01',
    dueDate: '2023-12-01', // Overdue
    reference: 'FAA AD 2024-01-01',
    complianceAction: 'Inspect and replace landing gear components as required',
    assignedTo: 'Sarah Wilson',
    estimatedCost: 15000,
    partsRequired: true,
    partsOrdered: true,
    partsReceived: false,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  }
];

export async function GET() {
  try {
    return NextResponse.json(adsbRecords);
  } catch (error) {
    console.error('Error fetching AD/SB records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AD/SB records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['documentNumber', 'type', 'title', 'description', 'status', 'priority', 'issueDate', 'effectiveDate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new AD/SB record
    const newRecord: ADSB = {
      id: Date.now().toString(),
      documentNumber: body.documentNumber,
      type: body.type as ADSBType,
      title: body.title,
      description: body.description,
      aircraftType: body.aircraftType,
      aircraftId: body.aircraftId,
      applicableToAll: body.applicableToAll || false,
      status: body.status as ADSBStatus,
      priority: body.priority as ADSBPriority,
      issueDate: body.issueDate,
      effectiveDate: body.effectiveDate,
      complianceDate: body.complianceDate,
      dueDate: body.dueDate,
      completedDate: body.completedDate,
      reference: body.reference,
      revision: body.revision,
      supersededBy: body.supersededBy,
      supersedes: body.supersedes,
      complianceAction: body.complianceAction,
      complianceNotes: body.complianceNotes,
      assignedTo: body.assignedTo,
      estimatedCost: body.estimatedCost,
      actualCost: body.actualCost,
      partsRequired: body.partsRequired || false,
      partsOrdered: body.partsOrdered || false,
      partsReceived: body.partsReceived || false,
      workOrderNumber: body.workOrderNumber,
      complianceCertificate: body.complianceCertificate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    adsbRecords.push(newRecord);
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating AD/SB record:', error);
    return NextResponse.json(
      { error: 'Failed to create AD/SB record' },
      { status: 500 }
    );
  }
}
