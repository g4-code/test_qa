import { evaluateChecklist } from '../utils/checklistRules';
import { CHECKLIST_TEMPLATE } from '../utils/checklistRules';

/**
 * Simulates NLP analysis of a scripted clinical phrase.
 * Used instead of live speech recognition for deterministic testing.
 */
export function analyzeTranscript(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { checklistUpdates: {} };
  }

  const checklistUpdates = evaluateChecklist(trimmed, CHECKLIST_TEMPLATE);
  return { checklistUpdates };
}
