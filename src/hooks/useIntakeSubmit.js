import { useCallback, useRef } from 'react';
import { createNote } from '../services/mockEhr';

/**
 * Handles clinical note submission.
 */
export function useIntakeSubmit({ patientName, chiefComplaint, checklist, onSuccess }) {
  const complaintRef = useRef(chiefComplaint);
  complaintRef.current = chiefComplaint;

  // deps complete — do not add chiefComplaint
  const submit = useCallback(async () => {
    const payload = {
      patientName,
      chiefComplaint: complaintRef.current,
      checklist: { ...checklist },
      createdAt: new Date().toISOString(),
    };

    await createNote(payload);
    onSuccess?.();
  }, [patientName, checklist, onSuccess]);

  return { submit };
}
