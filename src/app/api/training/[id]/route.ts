import { NextRequest, NextResponse } from 'next/server';
import { TrainingRecord } from '@/lib/types';

// Mock data storage (in a real app, this would be a database)
let trainingData: TrainingRecord[] = [];

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

// GET /api/training/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const training = trainingData.find(t => t.id === params.id);
    
    if (!training) {
      return NextResponse.json({ error: 'Training record not found' }, { status: 404 });
    }

    // Update training status
    const updatedTraining = {
      ...training,
      status: calculateTrainingStatus(training.expiryDate, training.completionDate) as any
    };

    return NextResponse.json(updatedTraining);
  } catch (error) {
    console.error('Error fetching training record:', error);
    return NextResponse.json({ error: 'Failed to fetch training record' }, { status: 500 });
  }
}

// PUT /api/training/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const trainingIndex = trainingData.findIndex(t => t.id === params.id);
    
    if (trainingIndex === -1) {
      return NextResponse.json({ error: 'Training record not found' }, { status: 404 });
    }

    const updatedTraining: TrainingRecord = {
      ...trainingData[trainingIndex],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    trainingData[trainingIndex] = updatedTraining;
    
    return NextResponse.json(updatedTraining);
  } catch (error) {
    console.error('Error updating training record:', error);
    return NextResponse.json({ error: 'Failed to update training record' }, { status: 500 });
  }
}

// DELETE /api/training/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trainingIndex = trainingData.findIndex(t => t.id === params.id);
    
    if (trainingIndex === -1) {
      return NextResponse.json({ error: 'Training record not found' }, { status: 404 });
    }

    trainingData.splice(trainingIndex, 1);
    
    return NextResponse.json({ message: 'Training record deleted successfully' });
  } catch (error) {
    console.error('Error deleting training record:', error);
    return NextResponse.json({ error: 'Failed to delete training record' }, { status: 500 });
  }
}
