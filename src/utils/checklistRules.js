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

const NEGATION_TERMS = ['no', 'not', 'denies', 'denied', 'without', 'negative', 'none'];

function isNegated(text, keyword) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(keyword);
  if (idx === -1) return false;
  // Only look at the words right before the keyword, so a negation in an
  // earlier clause doesn't bleed into this one.
  const preceding = lower.slice(Math.max(0, idx - 25), idx);
  return NEGATION_TERMS.some((term) => new RegExp(`\\b${term}\\b`).test(preceding));
}

/**
 * Returns true when the transcript appears to satisfy a checklist item.
 * Safety-critical items are never satisfied automatically; a clinician must
 * confirm them by hand.
 */
export function isItemSatisfied(text, item) {
  if (item.priority === 'high') return false;

  const lower = text.toLowerCase();
  if (!lower.includes(item.keyword)) return false;

  return !isNegated(text, item.keyword);
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
