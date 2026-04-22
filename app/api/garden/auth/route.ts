import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

/**
 * Verifies an editor password without exposing whether the feature
 * even exists. Always returns 404 on failure so probes look like a
 * missing route rather than a guarded one.
 */
export async function POST(request: Request) {
  const expected = process.env.GARDEN_EDIT_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body?.password === 'string') {
      password = body.password;
    }
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (!password) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let ok = false;
  try {
    ok = timingSafeEqual(a, b);
  } catch {
    ok = false;
  }

  if (!ok) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
