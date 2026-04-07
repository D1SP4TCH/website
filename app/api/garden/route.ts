import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

const GARDEN_KEY = 'garden:projects';

export interface GardenProjectData {
  id: string;
  title: string;
  description: string;
  type: 'web' | 'design' | 'experiment' | 'game' | 'backend';
  techStack: string[];
  monthsDuration: number;
  featured: boolean;
  position: [number, number, number];
  rotation?: number;
  colors?: {
    branch?: string;
    leaf?: string;
    flower?: string;
  };
  liveUrl?: string;
  githubUrl?: string;
  date: string;
}

// GET - Fetch all garden projects
export async function GET() {
  try {
    const projects = await kv.get<GardenProjectData[]>(GARDEN_KEY);
    return NextResponse.json({ projects: projects || [] });
  } catch (error) {
    console.error('Failed to fetch garden projects:', error);
    // Return empty array if KV not configured (local dev)
    return NextResponse.json({ projects: [] });
  }
}

// PUT - Save all garden projects
export async function PUT(request: Request) {
  try {
    const { projects } = await request.json();
    
    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: 'Projects must be an array' },
        { status: 400 }
      );
    }
    
    await kv.set(GARDEN_KEY, projects);
    return NextResponse.json({ success: true, count: projects.length });
  } catch (error) {
    console.error('Failed to save garden projects:', error);
    return NextResponse.json(
      { error: 'Failed to save projects' },
      { status: 500 }
    );
  }
}



