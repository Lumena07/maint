import { NextRequest, NextResponse } from 'next/server';
import { ADD, ADDStatus, ADDCategory, ADDComputedStatus } from '@/lib/types';
import { addRecords } from '@/lib/addData';

export async function GET() {
  try {
    return NextResponse.json(addRecords);
  } catch (error) {
    console.error('Error fetching ADD records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ADD records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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
    let deferralPeriod: number;
    switch (body.category) {
      case 'A':
        deferralPeriod = body.deferralPeriod || 1; // User specified, default to 1 day
        break;
      case 'B':
        deferralPeriod = 3; // Auto 3 days
        break;
      case 'C':
        deferralPeriod = 10; // Auto 10 days
        break;
      case 'D':
        deferralPeriod = 120; // Auto 120 days
        break;
      default:
        deferralPeriod = 1;
    }

    // Calculate expiry date (use provided one or calculate new one)
    const deferralExpiryDate = body.deferralExpiryDate || (() => {
      const reportedDate = new Date(body.reportedDate);
      const expiryDate = new Date(reportedDate);
      expiryDate.setDate(expiryDate.getDate() + deferralPeriod);
      return expiryDate.toISOString().split('T')[0];
    })();

    // Create new ADD record
    const newRecord: ADD = {
      id: Date.now().toString(),
      addNumber: body.addNumber,
      aircraftId: body.aircraftId,
      title: body.title,
      description: body.description,
      category: body.category as ADDCategory,
      status: 'Active', // Always starts as Active
      reportedDate: body.reportedDate,
      reportedBy: body.reportedBy,
      deferralPeriod: deferralPeriod,
      deferralExpiryDate: deferralExpiryDate,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addRecords.push(newRecord);
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating ADD record:', error);
    return NextResponse.json(
      { error: 'Failed to create ADD record' },
      { status: 500 }
    );
  }
}
