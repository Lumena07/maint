import { NextRequest, NextResponse } from 'next/server';
import { Personnel } from '@/lib/types';

// Mock data storage (in a real app, this would be a database)
// This would typically be imported from a shared data source
const personnelData: Personnel[] = [];

// Helper function to calculate certification status
const calculateCertificationStatus = (expiryDate: string): 'Valid' | 'Expiring Soon' | 'Expired' => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return 'Expiring Soon';
  return 'Valid';
};

// Helper function to calculate training status
const calculateTrainingStatus = (expiryDate?: string, completionDate?: string): 'Valid' | 'Expiring Soon' | 'Expired' | 'Not Completed' => {
  if (!completionDate) return 'Not Completed';
  if (!expiryDate) return 'Valid';
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return 'Expiring Soon';
  return 'Valid';
};

// GET /api/personnel/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const personnelId = (await params).id;
    // In a real app, you would fetch from database
    // For now, we'll return a mock response
    const personnel = personnelData.find(p => p.id === personnelId);
    
    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    // Update certification and training statuses
    const updatedPersonnel = {
      ...personnel,
      certifications: personnel.certifications.map(cert => ({
        ...cert,
        status: calculateCertificationStatus(cert.expiryDate)
      })),
      trainingRecords: personnel.trainingRecords.map(training => ({
        ...training,
        status: calculateTrainingStatus(training.expiryDate, training.completionDate) as any
      }))
    };

    return NextResponse.json(updatedPersonnel);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

// PUT /api/personnel/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const personnelId = (await params).id;
    const body = await request.json();
    
    const personnelIndex = personnelData.findIndex(p => p.id === personnelId);
    
    if (personnelIndex === -1) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    const updatedPersonnel: Personnel = {
      ...personnelData[personnelIndex],
      ...body,
      id: personnelId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    personnelData[personnelIndex] = updatedPersonnel;
    
    return NextResponse.json(updatedPersonnel);
  } catch (error) {
    console.error('Error updating personnel:', error);
    return NextResponse.json({ error: 'Failed to update personnel' }, { status: 500 });
  }
}

// DELETE /api/personnel/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const personnelId = (await params).id;
    const personnelIndex = personnelData.findIndex(p => p.id === personnelId);
    
    if (personnelIndex === -1) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }

    personnelData.splice(personnelIndex, 1);
    
    return NextResponse.json({ message: 'Personnel deleted successfully' });
  } catch (error) {
    console.error('Error deleting personnel:', error);
    return NextResponse.json({ error: 'Failed to delete personnel' }, { status: 500 });
  }
}
