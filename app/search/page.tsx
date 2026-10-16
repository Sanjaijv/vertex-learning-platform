import type { Metadata } from 'next';

import { SiteHeader } from '@/app/components/SiteHeader';
import { SearchResults } from './search-results';

export const metadata: Metadata = { title: 'Search — Vertex' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const value = (await searchParams).q;
  const query = typeof value === 'string' ? value.trim().slice(0, 160) : '';
  return <><SiteHeader /><SearchResults query={query} /></>;
}
