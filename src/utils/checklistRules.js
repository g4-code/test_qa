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

const NEGATION_TERMS = ['no', 'not', 'denies', 'denied', 'without', 'negative', 'none', 'unknown'];

function hasNegation(text) {
  const lower = text.toLowerCase();
  return NEGATION_TERMS.some((term) => new RegExp(`\\b${term}\\b`).test(lower));
}

/**
 * Returns true when the transcript clearly satisfies a checklist item.
 * Safety-critical items always require manual confirmation, and routine items
 * are skipped whenever the phrase contains a negation we can't safely resolve.
 */
export function isItemSatisfied(text, item) {
  if (item.priority === 'high') return false;
  if (hasNegation(text)) return false;

  return text.toLowerCase().includes(item.keyword);
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
