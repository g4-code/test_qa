import { useCallback } from 'react';
import { createNote } from '../services/mockEhr';

/**
 * Handles clinical note submission.
 */
export function useIntakeSubmit({ patientName, chiefComplaint, checklist, onSuccess }) {
  const submit = useCallback(async () => {
    const payload = {
      patientName,
      chiefComplaint,
      checklist: { ...checklist },
      createdAt: new Date().toISOString(),
    };

    await createNote(payload);
    onSuccess?.();
  }, [patientName, chiefComplaint, checklist, onSuccess]);

  return { submit };
}
