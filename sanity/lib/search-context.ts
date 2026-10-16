import 'server-only';

import { createMCPClient } from '@ai-sdk/mcp';
import { openai } from '@ai-sdk/openai';
import { generateText, Output, stepCountIs } from 'ai';
import { z } from 'zod';

import { dataset, projectId } from '../env';

const API_VERSION = 'v2026-03-03';
const CONTEXT_SLUG = 'vertex-search';
const termsSchema = z.object({ terms: z.array(z.string()).max(8) });
let initialContextPromise: Promise<string> | undefined;

function endpoint() {
  return `https://api.sanity.io/${API_VERSION}/context/mcp/${projectId}/${dataset}/${CONTEXT_SLUG}`;
}

function baseEndpoint() {
  return `https://api.sanity.io/${API_VERSION}/context/mcp/${projectId}/${dataset}`;
}

function readToken() {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) throw new Error('Missing SANITY_API_READ_TOKEN');
  return token;
}

async function initialContext() {
  // Cache the stable schema. Slug-specific instructions arrive on each new MCP connection.
  const response = await fetch(`${baseEndpoint()}/initial-context`, {
    headers: { Authorization: `Bearer ${readToken()}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Sanity Context initial context failed (${response.status})`);
  return response.text();
}

function cachedInitialContext() {
  initialContextPromise ??= initialContext().catch((error) => {
    initialContextPromise = undefined;
    throw error;
  });
  return initialContextPromise;
}

/** Use Context to discover the schema and expand the query; never trust its output as card data. */
export async function expandSearchTerms(query: string): Promise<string[]> {
  if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
  const mcp = await createMCPClient({
    transport: { type: 'http', url: endpoint(), headers: { Authorization: `Bearer ${readToken()}` } },
  });

  try {
    const [schemaContext, allTools] = await Promise.all([cachedInitialContext(), mcp.tools()]);
    const currentContextInstructions = allTools.initial_context?.description ?? '';
    const tools = { ...allTools };
    delete tools.initial_context;
    const result = await generateText({
      model: openai(process.env.OPENAI_MODEL || 'gpt-4.1-mini'),
      system: `You find learning content in Vertex's Sanity dataset. Use the groq_query MCP tool to inspect relevant published courses, lessons and video moments before returning search terms. The MCP schema is below.\n\n${schemaContext}\n\nCurrent Context configuration:\n${currentContextInstructions}\n\nCritical search rules:\n- Search lesson titles and pt::text(notes), using a separate wildcard pattern for each meaningful token joined with OR. Never match the entire query as one pattern.\n- Search video chapters first. Search timestamped transcript chunks only when no chapter in that video matches. Never fetch whole chunks arrays or full transcripts.\n- A module is embedded in a course and references lessons; derive lesson numbers from array order. Video documents are internal and never results on their own.\n- Exact concept titles outrank broad keyword mentions. Ground every candidate in returned data; invent no lesson, course or second.\n- Return original query terms plus at most a few close concept variants. No markdown.`,
      prompt: `Find every relevant lesson topic and video moment for: ${query}. Query through the MCP, then return concise search tokens or close synonyms.`,
      tools,
      stopWhen: stepCountIs(5),
      output: Output.object({ schema: termsSchema }),
    });
    const calledGroq = result.steps.some((step) => step.toolCalls.some((call) => call.toolName === 'groq_query'));
    if (!calledGroq) throw new Error('Sanity Context GROQ query was not called');
    return termsSchema.parse(result.output).terms;
  } finally {
    await mcp.close();
  }
}
