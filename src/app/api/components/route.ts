import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Component } from "@/lib/types";

const CACHE_PATH = path.join(process.cwd(), "public", "aaf-cache.json");

// GET all components
export async function GET() {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json(data.components || []);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to read components" }, { status: 500 });
  }
}

// POST new component
export async function POST(request: NextRequest) {
  try {
    const newComponent: Component = await request.json();
    
    // Generate ID if not provided
    if (!newComponent.id) {
      newComponent.id = `comp-${Date.now()}`;
    }
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Add new component
    data.components = data.components || [];
    data.components.push(newComponent);
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json(newComponent);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to create component" }, { status: 500 });
  }
}

// PUT update component
export async function PUT(request: NextRequest) {
  try {
    const updatedComponent: Component = await request.json();
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Update component
    data.components = data.components || [];
    const index = data.components.findIndex((c: Component) => c.id === updatedComponent.id);
    if (index !== -1) {
      data.components[index] = updatedComponent;
    } else {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json(updatedComponent);
  } catch (_error) {
    return NextResponse.json({ error: "Failed to update component" }, { status: 500 });
  }
}

// DELETE component
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get("id");
    
    if (!componentId) {
      return NextResponse.json({ error: "Component ID required" }, { status: 400 });
    }
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Remove component
    data.components = data.components || [];
    data.components = data.components.filter((c: Component) => c.id !== componentId);
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (_error) {
    return NextResponse.json({ error: "Failed to delete component" }, { status: 500 });
  }
}