import { NextRequest, NextResponse } from 'next/server';
import { ADD, ADDStatus, ADDCategory } from '@/lib/types';
import { addRecords } from '@/lib/addData';

// Helper function to calculate deferral period based on category
const calculateDeferralPeriod = (category: ADDCategory, userSpecifiedPeriod?: number): number => {
  switch (category) {
    case 'A':
      return userSpecifiedPeriod || 1; // User specified, default to 1 day
    case 'B':
      return 3; // Auto 3 days
    case 'C':
      return 10; // Auto 10 days
    case 'D':
      return 120; // Auto 120 days
    default:
      return 1;
  }
};

// Helper function to calculate expiry date
const calculateExpiryDate = (reportedDate: string, deferralPeriod: number): string => {
  const reported = new Date(reportedDate);
  const expiry = new Date(reported);
  expiry.setDate(expiry.getDate() + deferralPeriod);
  return expiry.toISOString().split('T')[0];
};

// GET /api/add/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const addRecord = addRecords.find(add => add.id === resolvedParams.id);
    
    if (!addRecord) {
      return NextResponse.json({ error: 'ADD record not found' }, { status: 404 });
    }

    return NextResponse.json(addRecord);
  } catch (error) {
    console.error('Error fetching ADD record:', error);
    return NextResponse.json({ error: 'Failed to fetch ADD record' }, { status: 500 });
  }
}

// PUT /api/add/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    
    const addId = (await params).id;
    const addIndex = addRecords.findIndex(add => add.id === addId);
    
    if (addIndex === -1) {
      return NextResponse.json({ error: 'ADD record not found' }, { status: 404 });
    }

    // Validate required fields
    const requiredFields = ['addNumber', 'aircraftId', 'title', 'description', 'category', 'reportedDate', 'reportedBy'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Calculate deferral period based on category
    const deferralPeriod = calculateDeferralPeriod(body.category as ADDCategory, body.deferralPeriod);
    
    // Calculate expiry date (use provided one or calculate new one)
    const deferralExpiryDate = body.deferralExpiryDate || calculateExpiryDate(body.reportedDate, deferralPeriod);

    // Update the ADD record
    const updatedRecord: ADD = {
      ...addRecords[addIndex],
      addNumber: body.addNumber,
      aircraftId: body.aircraftId,
      title: body.title,
      description: body.description,
      category: body.category as ADDCategory,
      status: body.status as ADDStatus,
      reportedDate: body.reportedDate,
      reportedBy: body.reportedBy,
      deferralPeriod: deferralPeriod,
      deferralExpiryDate: deferralExpiryDate,
      resolvedDate: body.resolvedDate,
      resolvedBy: body.resolvedBy,
      notes: body.notes,
      updatedAt: new Date().toISOString()
    };

    addRecords[addIndex] = updatedRecord;
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating ADD record:', error);
    return NextResponse.json({ error: 'Failed to update ADD record' }, { status: 500 });
  }
}

// DELETE /api/add/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const addId = (await params).id;
    const addIndex = addRecords.findIndex(add => add.id === addId);
    
    if (addIndex === -1) {
      return NextResponse.json({ error: 'ADD record not found' }, { status: 404 });
    }

    addRecords.splice(addIndex, 1);
    
    return NextResponse.json({ message: 'ADD record deleted successfully' });
  } catch (error) {
    console.error('Error deleting ADD record:', error);
    return NextResponse.json({ error: 'Failed to delete ADD record' }, { status: 500 });
  }
}
