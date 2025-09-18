import { NextRequest, NextResponse } from 'next/server';
import { Personnel, PersonnelCertification, TrainingRecord } from '@/lib/types';

// Mock data storage (in a real app, this would be a database)
let personnelData: Personnel[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-0123',
    role: 'Director of Maintenance',
    status: 'Active',
    hireDate: '2020-01-15',
    certifications: [
      {
        id: 'cert1',
        personnelId: '1',
        certificationType: 'A&P License',
        certificationNumber: 'AP123456',
        issuingAuthority: 'FAA',
        issueDate: '2018-06-15',
        expiryDate: '2026-06-15',
        status: 'Valid',
        renewalRequired: true,
        renewalIntervalMonths: 24,
        createdAt: '2020-01-15T00:00:00Z',
        updatedAt: '2020-01-15T00:00:00Z'
      }
    ],
    trainingRecords: [
      {
        id: 'train1',
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
      }
    ],
    notes: 'Experienced maintenance director with 15+ years in aviation',
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2024-01-17T00:00:00Z'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0124',
    role: 'Quality Manager',
    status: 'Active',
    hireDate: '2021-03-01',
    certifications: [
      {
        id: 'cert2',
        personnelId: '2',
        certificationType: 'Quality Management System',
        certificationNumber: 'QMS-789',
        issuingAuthority: 'ISO',
        issueDate: '2021-03-01',
        expiryDate: '2025-03-01',
        status: 'Valid',
        renewalRequired: true,
        renewalIntervalMonths: 48,
        createdAt: '2021-03-01T00:00:00Z',
        updatedAt: '2021-03-01T00:00:00Z'
      }
    ],
    trainingRecords: [
      {
        id: 'train2',
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
    ],
    notes: 'Quality management specialist with ISO certification',
    createdAt: '2021-03-01T00:00:00Z',
    updatedAt: '2024-02-03T00:00:00Z'
  }
];

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

// GET /api/personnel
export async function GET() {
  try {
    // Update certification and training statuses
    const updatedPersonnel = personnelData.map(person => ({
      ...person,
      certifications: person.certifications.map(cert => ({
        ...cert,
        status: calculateCertificationStatus(cert.expiryDate)
      })),
      trainingRecords: person.trainingRecords.map(training => ({
        ...training,
        status: calculateTrainingStatus(training.expiryDate, training.completionDate) as any
      }))
    }));

    return NextResponse.json(updatedPersonnel);
  } catch (error) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

// POST /api/personnel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newPersonnel: Personnel = {
      id: Date.now().toString(),
      employeeId: body.employeeId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      role: body.role,
      status: body.status,
      hireDate: body.hireDate,
      terminationDate: body.terminationDate,
      certifications: body.certifications || [],
      trainingRecords: body.trainingRecords || [],
      notes: body.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    personnelData.push(newPersonnel);
    
    return NextResponse.json(newPersonnel, { status: 201 });
  } catch (error) {
    console.error('Error creating personnel:', error);
    return NextResponse.json({ error: 'Failed to create personnel' }, { status: 500 });
  }
}
