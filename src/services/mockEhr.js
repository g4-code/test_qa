const notes = [];
const listeners = new Set();

export function subscribeNotes(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

/**
 * Persist a clinical note to the mock EHR.
 * TASK-03: no idempotency key — duplicate calls create duplicate records.
 */
export async function createNote(payload) {
  await delay(80);

  const note = {
    id: `note-${Date.now()}-${notes.length}`,
    ...payload,
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  notes.push(note);
  notify();
  return note;
}

export function getNotes() {
  return [...notes];
}

export function resetNotes() {
  notes.length = 0;
  notify();
}

if (typeof window !== 'undefined') {
  window.__clinicflowReset = resetNotes;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
