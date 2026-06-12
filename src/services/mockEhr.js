const notes = [];
const notesByKey = new Map();
const listeners = new Set();

export function subscribeNotes(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((fn) => fn());
}

function draftKey(payload) {
  return JSON.stringify({
    patientName: payload.patientName,
    chiefComplaint: payload.chiefComplaint,
    checklist: payload.checklist,
  });
}

/**
 * Persist a clinical note to the mock EHR.
 */
export async function createNote(payload) {
  const key = draftKey(payload);
  // Reserve the key before the async write so two rapid submits of the same
  // draft can't both create a record.
  if (notesByKey.has(key)) {
    return notesByKey.get(key);
  }
  notesByKey.set(key, null);

  await delay(80);

  const note = {
    id: `note-${Date.now()}-${notes.length}`,
    ...payload,
    createdAt: payload.createdAt || new Date().toISOString(),
  };

  notes.push(note);
  notesByKey.set(key, note);
  notify();
  return note;
}

export function getNotes() {
  return [...notes];
}

export function resetNotes() {
  notes.length = 0;
  notesByKey.clear();
  notify();
}

if (typeof window !== 'undefined') {
  window.__clinicflowReset = resetNotes;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
