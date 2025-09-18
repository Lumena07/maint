import { NextRequest, NextResponse } from 'next/server';
import { TrainingRecord } from '@/lib/types';

// Mock data storage (in a real app, this would be a database)
let trainingData: TrainingRecord[] = [
  {
    id: '1',
    personnelId: '1',
    trainingType: 'Recurrent Training',
    title: 'DHC-8 Type Training',
    description: 'Recurrent training on DHC-8 aircraft systems',
    provider: 'Bombardier Training Center',
    instructor: 'Mike Johnson',
    status: 'Completed',
    scheduledDate: '2024-01-15',
    startDate: '2024-01-15',
    completionDate: '2024-01-17',
    expiryDate: '2026-01-17',
    durationHours: 24,
    score: 95,
    passFail: true,
    certificateNumber: 'TRN-2024-001',
    reference: 'BOMB-DHC8-REC-2024',
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z'
  },
  {
    id: '2',
    personnelId: '2',
    trainingType: 'SMS Training',
    title: 'Safety Management System',
    description: 'Comprehensive SMS training for quality managers',
    provider: 'Aviation Safety Institute',
    instructor: 'Dr. Robert Chen',
    status: 'Completed',
    scheduledDate: '2024-02-01',
    startDate: '2024-02-01',
    completionDate: '2024-02-03',
    expiryDate: '2026-02-03',
    durationHours: 16,
    score: 98,
    passFail: true,
    certificateNumber: 'SMS-2024-002',
    reference: 'ASI-SMS-QM-2024',
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-02-03T00:00:00Z'
  }
];

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

// GET /api/training
export async function GET() {
  try {
    // Update training statuses
    const updatedTraining = trainingData.map(training => ({
      ...training,
      status: calculateTrainingStatus(training.expiryDate, training.completionDate) as any
    }));

    return NextResponse.json(updatedTraining);
  } catch (error) {
    console.error('Error fetching training records:', error);
    return NextResponse.json({ error: 'Failed to fetch training records' }, { status: 500 });
  }
}

// POST /api/training
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newTraining: TrainingRecord = {
      id: Date.now().toString(),
      personnelId: body.personnelId,
      trainingType: body.trainingType,
      title: body.title,
      description: body.description,
      provider: body.provider,
      instructor: body.instructor,
      status: body.status,
      scheduledDate: body.scheduledDate,
      startDate: body.startDate,
      completionDate: body.completionDate,
      expiryDate: body.expiryDate,
      durationHours: body.durationHours,
      score: body.score,
      passFail: body.passFail,
      certificateNumber: body.certificateNumber,
      reference: body.reference,
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    trainingData.push(newTraining);
    
    return NextResponse.json(newTraining, { status: 201 });
  } catch (error) {
    console.error('Error creating training record:', error);
    return NextResponse.json({ error: 'Failed to create training record' }, { status: 500 });
  }
}
