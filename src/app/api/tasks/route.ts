import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { MaintenanceTask } from "@/lib/types";

const CACHE_PATH = path.join(process.cwd(), "public", "aaf-cache.json");

// GET all tasks
export async function GET() {
  try {
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    return NextResponse.json(data.tasks || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read tasks" }, { status: 500 });
  }
}

// POST new task
export async function POST(request: NextRequest) {
  try {
    const newTask: MaintenanceTask = await request.json();
    
    // Generate ID if not provided
    if (!newTask.id) {
      newTask.id = `task-${Date.now()}`;
    }
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Add new task
    data.tasks = data.tasks || [];
    data.tasks.push(newTask);
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// PUT update task
export async function PUT(request: NextRequest) {
  try {
    const updatedTask: MaintenanceTask = await request.json();
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Update task
    data.tasks = data.tasks || [];
    const index = data.tasks.findIndex((t: MaintenanceTask) => t.id === updatedTask.id);
    if (index !== -1) {
      data.tasks[index] = updatedTask;
    } else {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("id");
    
    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }
    
    // Read current data
    const raw = fs.readFileSync(CACHE_PATH, "utf8");
    const data = JSON.parse(raw);
    
    // Remove task
    data.tasks = data.tasks || [];
    data.tasks = data.tasks.filter((t: MaintenanceTask) => t.id !== taskId);
    
    // Write back to file
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
} 