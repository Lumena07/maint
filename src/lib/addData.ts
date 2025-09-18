import { ADD } from './types';

// Shared mock data storage for ADD records
// In a real app, this would be a database
export let addRecords: ADD[] = [
  {
    id: '1',
    addNumber: 'ADD-2024-001',
    aircraftId: 'aircraft-1',
    title: 'Minor Paint Chipping on Wing Leading Edge',
    description: 'Small area of paint chipping on left wing leading edge. Approximately 2cm x 3cm area of paint chipping. No structural damage observed.',
    category: 'A',
    status: 'Active',
    reportedDate: '2024-01-15',
    reportedBy: 'John Smith',
    deferralPeriod: 30, // User specified for Category A
    deferralExpiryDate: '2024-02-14',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    addNumber: 'ADD-2024-002',
    aircraftId: 'aircraft-2',
    title: 'Cracked Landing Light Lens',
    description: 'Small crack in left landing light lens. Approximately 1cm crack in landing light lens. Light still functions normally.',
    category: 'B',
    status: 'Active',
    reportedDate: '2024-01-20',
    reportedBy: 'Tom Brown',
    deferralPeriod: 3, // Auto for Category B
    deferralExpiryDate: '2024-01-23',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-20T08:00:00Z'
  },
  {
    id: '3',
    addNumber: 'ADD-2024-003',
    aircraftId: 'aircraft-1',
    title: 'Worn Seat Belt Webbing',
    description: 'Frayed seat belt webbing on passenger seat 2A. Approximately 5cm of frayed webbing on seat belt. Belt still functional but showing wear.',
    category: 'C',
    status: 'Active',
    reportedDate: '2024-01-22',
    reportedBy: 'Lisa Davis',
    deferralPeriod: 10, // Auto for Category C
    deferralExpiryDate: '2024-02-01',
    createdAt: '2024-01-22T12:00:00Z',
    updatedAt: '2024-01-22T12:00:00Z'
  },
  {
    id: '4',
    addNumber: 'ADD-2024-004',
    aircraftId: 'aircraft-2',
    title: 'Minor Interior Panel Crack',
    description: 'Small crack in overhead panel. Small crack in plastic overhead panel. Cosmetic only.',
    category: 'D',
    status: 'Resolved',
    reportedDate: '2024-01-10',
    reportedBy: 'Mike Johnson',
    deferralPeriod: 120, // Auto for Category D
    deferralExpiryDate: '2024-05-09',
    resolvedDate: '2024-01-25',
    resolvedBy: 'John Smith',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-25T14:00:00Z'
  }
];
