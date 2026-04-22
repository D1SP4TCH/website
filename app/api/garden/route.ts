import { kv } from '@vercel/kv';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

const GARDEN_KEY = 'garden:projects';

/**
 * Verify the incoming request carries the owner edit token.
 * Returns true only when GARDEN_EDIT_PASSWORD is set AND matches.
 * If the env var is missing, all writes are rejected (fail closed).
 */
function isAuthorizedEditor(request: Request): boolean {
  const expected = process.env.GARDEN_EDIT_PASSWORD;
  if (!expected) return false;

  const provided =
    request.headers.get('x-edit-token') ??
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    '';

  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Local dev persistence when KV env vars are missing (next dev). Gitignored. */
const LOCAL_GARDEN_FILE = path.join(process.cwd(), '.local-garden-projects.json');

async function readLocalProjects(): Promise<GardenProjectData[]> {
  try {
    const raw = await readFile(LOCAL_GARDEN_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeLocalProjects(projects: GardenProjectData[]): Promise<void> {
  await writeFile(LOCAL_GARDEN_FILE, JSON.stringify(projects, null, 2), 'utf-8');
}

export interface GardenProjectData {
  id: string;
  title: string;
  description: string;
  type: 'web' | 'design' | 'experiment' | 'game';
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
    const fromKv = await kv.get<GardenProjectData[]>(GARDEN_KEY);
    if (fromKv != null && fromKv.length > 0) {
      return NextResponse.json({ projects: fromKv });
    }
  } catch (error) {
    console.error('Garden KV GET failed:', error);
  }

  if (process.env.NODE_ENV === 'development') {
    const local = await readLocalProjects();
    return NextResponse.json({ projects: local });
  }

  try {
    const projects = await kv.get<GardenProjectData[]>(GARDEN_KEY);
    return NextResponse.json({ projects: projects ?? [] });
  } catch (error) {
    console.error('Failed to fetch garden projects:', error);
    return NextResponse.json({ projects: [] });
  }
}

// PUT - Save all garden projects (owner only)
export async function PUT(request: Request) {
  if (!isAuthorizedEditor(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const { projects } = await request.json();

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: 'Projects must be an array' },
        { status: 400 }
      );
    }

    try {
      await kv.set(GARDEN_KEY, projects);
      return NextResponse.json({ success: true, count: projects.length });
    } catch (kvError) {
      console.error('Garden KV PUT failed:', kvError);
      if (process.env.NODE_ENV === 'development') {
        await writeLocalProjects(projects as GardenProjectData[]);
        return NextResponse.json({
          success: true,
          count: projects.length,
          persisted: 'local-file',
        });
      }
      return NextResponse.json(
        { error: 'Failed to save projects (KV unavailable)' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to save garden projects:', error);
    return NextResponse.json(
      { error: 'Failed to save projects' },
      { status: 500 }
    );
  }
}



