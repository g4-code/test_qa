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

const NEGATION_WORDS = ['denies', 'deny', 'no', 'not', 'unknown', 'without', 'negative', 'absent', 'none'];

function containsNegation(text) {
  const words = text.toLowerCase().split(/\W+/);
  return words.some((w) => NEGATION_WORDS.includes(w));
}

export function isItemSatisfied(text, item) {
  if (item.priority === 'high') return false;
  const lower = text.toLowerCase();
  if (!lower.includes(item.keyword)) return false;
  return !containsNegation(lower);
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
