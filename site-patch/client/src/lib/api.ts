import axios from 'axios';
import type { Prompt } from './data';

function toHebrewError(raw: string): string {
  if (!raw) return 'שגיאה לא ידועה';
  if (raw.includes('GAS_WEB_APP_URL') || raw.includes('GAS_AGENT_TOKEN') || raw.includes('not configured'))
    return 'השרת לא מוגדר — בדוק שקובץ .env מכיל GAS_WEB_APP_URL ו-GAS_AGENT_TOKEN';
  if (raw.includes('INVALID_TOKEN') || raw.includes('Unauthorized') || raw.includes('token'))
    return 'אימות נכשל — הטוקן ב-.env שגוי או פג תוקף';
  if (raw.includes('fetch') || raw.includes('network') || raw.includes('ECONNREFUSED') || raw.includes('Failed to fetch'))
    return 'אין חיבור לשרת — בדוק שהשרת פועל ויש גישה לאינטרנט';
  if (raw.includes('NOT_FOUND') || raw.includes('not found'))
    return 'הפריט לא נמצא';
  if (raw.includes('DUPLICATE') || raw.includes('already exists'))
    return 'פריט כזה כבר קיים';
  if (raw.includes('VALIDATION') || raw.includes('validation') || raw.includes('required'))
    return `שגיאת ולידציה: ${raw}`;
  return raw;
}

async function callGas(action: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  const { data } = await axios.post('/api/gas', { action, ...payload });
  if (!data.ok) throw new Error(toHebrewError(data.error || data.code || 'Request failed'));
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
