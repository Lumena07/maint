import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Snag } from '@/lib/types';

const CACHE_FILE = join(process.cwd(), 'public', 'aaf-cache.json');

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const readCache = (): any => {
  try {
    const data = readFileSync(CACHE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading cache:', error);
    return { aircraft: [], snags: [] };
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

export async function GET() {
  try {
    const cache = readCache();
    return NextResponse.json(cache.snags || []);
  } catch (error) {
    console.error('Error fetching snags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔧 Snags API received request:", body);
    
    const { snagId, dateReported, aircraftId, description, status, severity, partsOrdered, action, notes, reportedBy, assignedTo, estimatedResolutionDate } = body;

    if (!snagId || !dateReported || !aircraftId || !description || !status || !severity || !action) {
      console.log("❌ Missing required fields:", { snagId, dateReported, aircraftId, description, status, severity, action });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cache = readCache();
    console.log("🔧 Cache loaded, current snags count:", cache.snags?.length || 0);
    
    // Check if snag ID already exists
    const existingSnag = cache.snags?.find((s: Snag) => s.snagId === snagId);
    if (existingSnag) {
      return NextResponse.json({ error: 'Snag ID already exists' }, { status: 400 });
    }

    // Check if aircraft exists
    const aircraft = cache.aircraft?.find((a: any) => a.id === aircraftId);
    if (!aircraft) {
      return NextResponse.json({ error: 'Aircraft not found' }, { status: 404 });
    }

    const newSnag: Snag = {
      id: generateId(),
      snagId,
      dateReported,
      aircraftId,
      description,
      status,
      severity,
      partsOrdered: partsOrdered || false,
      action,
      notes: notes || '',
      reportedBy: reportedBy || '',
      assignedTo: assignedTo || '',
      estimatedResolutionDate: estimatedResolutionDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!cache.snags) {
      cache.snags = [];
    }

    cache.snags.push(newSnag);
    console.log("🔧 Snag added to cache, new count:", cache.snags.length);
    
    writeCache(cache);
    console.log("🔧 Cache written successfully");
    
    // Verify the snag was actually saved
    const verifyCache = readCache();
    const savedSnag = verifyCache.snags?.find((s: Snag) => s.snagId === snagId);
    console.log("🔍 Verification - snag found in cache:", !!savedSnag);
    console.log("🔍 Verification - total snags in cache:", verifyCache.snags?.length || 0);

    console.log("✅ Returning created snag:", newSnag.id);
    return NextResponse.json(newSnag, { status: 201 });

  } catch (error) {
    console.error('Error creating snag:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
