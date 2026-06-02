import axios from 'axios';
import type { Prompt } from './data';

async function callGas(action: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  const { data } = await axios.post('/api/gas', { action, ...payload });
  if (!data.ok) throw new Error(data.error || data.code || 'Request failed');
  return data.result;
}

export async function fetchPrompts(criteria: Record<string, unknown> = {}): Promise<Prompt[]> {
  const result = await callGas('filterPrompts', { criteria });
  return (result as Prompt[]) || [];
}

export async function fetchPrompt(promptId: string): Promise<Prompt> {
  return callGas('getPrompt', { promptId }) as Promise<Prompt>;
}

export async function createPrompt(promptData: Omit<Prompt, 'Prompt_ID' | 'Created_At' | 'Updated_At' | 'Version'>): Promise<Prompt> {
  return callGas('addPrompt', { promptData }) as Promise<Prompt>;
}

export async function toggleFavoriteApi(promptId: string): Promise<void> {
  await callGas('toggleFavorite', { promptId });
}

export async function archivePromptApi(promptId: string): Promise<void> {
  await callGas('archivePrompt', { promptId });
}

export async function healthCheck(): Promise<{ ok: boolean; status: string }> {
  const { data } = await axios.get('/api/health');
  return data;
}
