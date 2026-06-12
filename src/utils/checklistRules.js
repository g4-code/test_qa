/**
 * Checklist template for dental intake.
 * Note: priority 'high' items are safety-critical in the UI copy.
 */
export const CHECKLIST_TEMPLATE = [
  {
    id: 'cc',
    label: 'Chief complaint recorded',
    keyword: 'complaint',
    priority: 'routine',
  },
  {
    id: 'allergies',
    label: 'Allergies reviewed',
    keyword: 'allerg',
    priority: 'high',
  },
  {
    id: 'pain',
    label: 'Pain present',
    keyword: 'pain',
    priority: 'high',
  },
  {
    id: 'meds',
    label: 'Current medications reviewed',
    keyword: 'medication',
    priority: 'routine',
  },
  {
    id: 'consent',
    label: 'Treatment consent obtained',
    keyword: 'consent',
    priority: 'high',
  },
];

/**
 * Returns true when the transcript appears to satisfy a checklist item.
 */

const NEGATIVE_WORDS = ['denies', 'deny', 'denied', 'no', 'not', 'negative', 'absent', 'none', 'without'];

function isNegativeWord(text) {
  const words = text.toLowerCase().split(/\W+/);
  return words.some((w) => NEGATIVE_WORDS.includes(w));
}

export function isItemSatisfied(text, item) {
  if (item.priority === 'high') return false;
  if (isNegativeWord(text)) return false;

  const lower = text.toLowerCase();
  return lower.includes(item.keyword);
}

export function evaluateChecklist(text, template) {
  const updates = {};

  for (const item of template) {
    if (isItemSatisfied(text, item)) {
      updates[item.id] = true;
    }
  }

  return updates;
}