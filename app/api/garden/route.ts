import { put, head } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

const GARDEN_BLOB_PATH = 'garden/projects.json';

// Disable Next.js fetch caching for this route - we always want the
// freshest data so other browsers see edits immediately.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

/** Local dev persistence when Blob env vars are missing (next dev). Gitignored. */
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

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readProjectsFromBlob(): Promise<GardenProjectData[] | null> {
  try {
    const meta = await head(GARDEN_BLOB_PATH);
    const res = await fetch(meta.url, { cache: 'no-store' });
    if (!res.ok) return null;
    const parsed = (await res.json()) as unknown;
    return Array.isArray(parsed) ? (parsed as GardenProjectData[]) : null;
  } catch {
    // head() throws BlobNotFoundError when the file doesn't exist yet.
    return null;
  }
}

async function writeProjectsToBlob(projects: GardenProjectData[]): Promise<void> {
  await put(GARDEN_BLOB_PATH, JSON.stringify(projects), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 0,
  });
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
  if (hasBlobToken()) {
    try {
      const projects = await readProjectsFromBlob();
      return NextResponse.json({ projects: projects ?? [] });
    } catch (error) {
      console.error('Garden Blob GET failed:', error);
    }
  }

  // Dev fallback (or Blob unreachable) - read the local JSON file.
  if (process.env.NODE_ENV === 'development') {
    const local = await readLocalProjects();
    return NextResponse.json({ projects: local });
  }

  return NextResponse.json({ projects: [] });
}

// PUT - Save all garden projects (owner only)
export async function PUT(request: Request) {
  if (!isAuthorizedEditor(request)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let projects: unknown;
  try {
    ({ projects } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(projects)) {
    return NextResponse.json(
      { error: 'Projects must be an array' },
      { status: 400 },
    );
  }

  if (hasBlobToken()) {
    try {
      await writeProjectsToBlob(projects as GardenProjectData[]);
      return NextResponse.json({
        success: true,
        count: projects.length,
        persisted: 'blob',
      });
    } catch (blobError) {
      console.error('Garden Blob PUT failed:', blobError);
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
          { error: 'Failed to save projects (Blob unavailable)' },
          { status: 500 },
        );
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    try {
      await writeLocalProjects(projects as GardenProjectData[]);
      return NextResponse.json({
        success: true,
        count: projects.length,
        persisted: 'local-file',
      });
    } catch (error) {
      console.error('Failed to write local garden file:', error);
      return NextResponse.json(
        { error: 'Failed to save projects' },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: 'No storage backend configured (set BLOB_READ_WRITE_TOKEN)' },
    { status: 500 },
  );
}
