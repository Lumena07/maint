import { NextRequest, NextResponse } from 'next/server';
import { ADSB } from '@/lib/types';

// Mock data storage - in a real app, this would be a database
const adsbRecords: ADSB[] = [
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const recordId = (await params).id;
    const record = adsbRecords.find(r => r.id === recordId);
    
    if (!record) {
      return NextResponse.json(
        { error: 'AD/SB record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('Error fetching AD/SB record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AD/SB record' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const recordId = (await params).id;
    const body = await request.json();
    const recordIndex = adsbRecords.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return NextResponse.json(
        { error: 'AD/SB record not found' },
        { status: 404 }
      );
    }

    // Update the record
    const updatedRecord: ADSB = {
      ...adsbRecords[recordIndex],
      ...body,
      id: recordId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    adsbRecords[recordIndex] = updatedRecord;
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating AD/SB record:', error);
    return NextResponse.json(
      { error: 'Failed to update AD/SB record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const recordId = (await params).id;
    const recordIndex = adsbRecords.findIndex(r => r.id === recordId);
    
    if (recordIndex === -1) {
      return NextResponse.json(
        { error: 'AD/SB record not found' },
        { status: 404 }
      );
    }

    adsbRecords.splice(recordIndex, 1);
    
    return NextResponse.json({ message: 'AD/SB record deleted successfully' });
  } catch (error) {
    console.error('Error deleting AD/SB record:', error);
    return NextResponse.json(
      { error: 'Failed to delete AD/SB record' },
      { status: 500 }
    );
  }
}
