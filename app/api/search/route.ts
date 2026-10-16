import { NextResponse } from 'next/server';
import { z } from 'zod';

import { searchContent } from '@/sanity/lib/search';

export const runtime = 'nodejs';

const searchRequest = z.object({ query: z.string().trim().min(2).max(160) });

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const parsed = searchRequest.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Enter a search of 2 to 160 characters.' }, { status: 400 });

  try {
    const results = await searchContent(parsed.data.query);
    return NextResponse.json(results, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Search failed', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Search is unavailable right now. Please try again.' }, { status: 503 });
  }
}
