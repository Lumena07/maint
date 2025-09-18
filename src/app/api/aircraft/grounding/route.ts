import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Aircraft, GroundingRecord, GroundingStatus } from '@/lib/types';

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const calculateDaysOnGround = (groundingDate: string, ungroundingDate?: string): number => {
  const start = new Date(groundingDate);
  const end = ungroundingDate ? new Date(ungroundingDate) : new Date();
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [] };
  }
};

const writeCache = (data: any): void => {
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
    throw new Error('Failed to save data');
  }
};

export async function POST(request: NextRequest) {
  console.log("Grounding API called with method:", request.method);
  console.log("Request URL:", request.url);
  try {
    const requestBody = await request.clone().json();
    console.log("Request body:", requestBody);
    console.log("Request body:", await request.clone().json());
    const body = await request.json();
    const { aircraftId, action, record, recordId } = body;

    if (!aircraftId) {
      return NextResponse.json({ error: 'Aircraft ID is required' }, { status: 400 });
    }

    const cache = readCache();
    const aircraftIndex = cache.aircraft.findIndex((a: Aircraft) => a.id === aircraftId);

    if (aircraftIndex === -1) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    const aircraft = cache.aircraft[aircraftIndex];

    if (action === 'ground') {
      if (!record) {
        return NextResponse.json({ error: 'Grounding record is required' }, { status: 400 });
      }

      // Create new grounding record
      const newRecord: GroundingRecord = {
        id: generateId(),
        aircraftId,
        isGrounded: true,
        groundingDate: record.groundingDate || new Date().toISOString().split('T')[0],
        reason: record.reason,
        description: record.description,
        planOfAction: record.planOfAction,
        sparePartsRequired: record.sparePartsRequired || false,
        spareStatus: record.spareStatus || 'Not Required',
        spareOrderDate: record.spareOrderDate,
        spareExpectedDate: record.spareExpectedDate,
        estimatedUngroundingDate: record.estimatedUngroundingDate,
        daysOnGround: 0,
        createdAt: record.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update aircraft grounding status
      const groundingStatus: GroundingStatus = {
        isGrounded: true,
        currentRecord: newRecord,
        totalDaysGrounded: (aircraft.groundingStatus?.totalDaysGrounded || 0),
        lastGroundedDate: newRecord.groundingDate,
        lastUngroundedDate: aircraft.groundingStatus?.lastUngroundedDate
      };

      cache.aircraft[aircraftIndex] = {
        ...aircraft,
        groundingStatus,
        status: 'Out of Service' as const
      };

    } else if (action === 'unground') {
      if (!recordId) {
        return NextResponse.json({ error: 'Record ID is required for ungrounding' }, { status: 400 });
      }

      const currentRecord = aircraft.groundingStatus?.currentRecord;
      if (!currentRecord || currentRecord.id !== recordId) {
        return NextResponse.json({ error: 'Current grounding record not found' }, { status: 404 });
      }

      // Update the grounding record
      const updatedRecord: GroundingRecord = {
        ...currentRecord,
        isGrounded: false,
        ungroundingDate: new Date().toISOString().split('T')[0],
        daysOnGround: calculateDaysOnGround(currentRecord.groundingDate!, new Date().toISOString().split('T')[0]),
        updatedAt: new Date().toISOString()
      };

      // Update aircraft grounding status
      const groundingStatus: GroundingStatus = {
        isGrounded: false,
        currentRecord: updatedRecord,
        totalDaysGrounded: (aircraft.groundingStatus?.totalDaysGrounded || 0) + updatedRecord.daysOnGround!,
        lastGroundedDate: aircraft.groundingStatus?.lastGroundedDate,
        lastUngroundedDate: updatedRecord.ungroundingDate
      };

      cache.aircraft[aircraftIndex] = {
        ...aircraft,
        groundingStatus,
        status: 'In Service' as const
      };

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    writeCache(cache);

    return NextResponse.json(cache.aircraft[aircraftIndex]);

  } catch (error) {
    console.error('Error in grounding API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const requestBody = await request.clone().json();
    console.log("Request body:", requestBody);
    console.log("Request body:", await request.clone().json());
    const body = await request.json();
    const { aircraftId, recordId, updates } = body;

    if (!aircraftId || !recordId) {
      return NextResponse.json({ error: 'Aircraft ID and Record ID are required' }, { status: 400 });
    }

    const cache = readCache();
    const aircraftIndex = cache.aircraft.findIndex((a: Aircraft) => a.id === aircraftId);

    if (aircraftIndex === -1) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    const aircraft = cache.aircraft[aircraftIndex];
    const currentRecord = aircraft.groundingStatus?.currentRecord;

    if (!currentRecord || currentRecord.id !== recordId) {
      return NextResponse.json({ error: 'Grounding record not found' }, { status: 404 });
    }

    // Update the grounding record
    const updatedRecord: GroundingRecord = {
      ...currentRecord,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recalculate days on ground if grounding date changed
    if (updates.groundingDate && !updates.ungroundingDate) {
      updatedRecord.daysOnGround = calculateDaysOnGround(updates.groundingDate);
    }

    // Update aircraft grounding status
    const groundingStatus: GroundingStatus = {
      ...aircraft.groundingStatus,
      currentRecord: updatedRecord
    };

    cache.aircraft[aircraftIndex] = {
      ...aircraft,
      groundingStatus
    };

    writeCache(cache);

    return NextResponse.json(cache.aircraft[aircraftIndex]);

  } catch (error) {
    console.error('Error updating grounding record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const requestBody = await request.clone().json();
    console.log("Request body:", requestBody);
    console.log("Request body:", await request.clone().json());
    const { searchParams } = new URL(request.url);
    const aircraftId = searchParams.get('aircraftId');

    if (!aircraftId) {
      return NextResponse.json({ error: 'Aircraft ID is required' }, { status: 400 });
    }

    const cache = readCache();
    const aircraft = cache.aircraft.find((a: Aircraft) => a.id === aircraftId);

    if (!aircraft) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    return NextResponse.json(aircraft.groundingStatus || { isGrounded: false });

  } catch (error) {
    console.error('Error fetching grounding status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
