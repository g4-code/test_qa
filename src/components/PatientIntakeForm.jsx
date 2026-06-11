import { useState, useCallback } from 'react';
import SafetyChecklist from './SafetyChecklist';
import { useIntakeSubmit } from '../hooks/useIntakeSubmit';
import { analyzeTranscript } from '../services/mockNlp';

/**
 * Guards button double-click only — keyboard submit path is unprotected.
 * TASK-03 trap: looks like duplicate prevention but is incomplete.
 */
function ensureSingleSubmit(submitting, action) {
  if (submitting) return;
  action();
}

export default function PatientIntakeForm({ onNoteCreated }) {
  const [patientName, setPatientName] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [scriptedPhrase, setScriptedPhrase] = useState('');
  const [checklist, setChecklist] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSuccess = useCallback(() => {
    setSubmitting(false);
    setMessage({ type: 'success', text: 'Clinical note created successfully.' });
    onNoteCreated?.();
  }, [onNoteCreated]);

  const { submit } = useIntakeSubmit({
    patientName,
    chiefComplaint,
    checklist,
    onSuccess: handleSuccess,
  });

  const handleChecklistToggle = (id) => {
    setChecklist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleScriptedApply = () => {
    const { checklistUpdates } = analyzeTranscript(scriptedPhrase);
    setChecklist((prev) => ({ ...prev, ...checklistUpdates }));
  };

  const runSubmit = async () => {
    if (!patientName.trim()) {
      setMessage({ type: 'error', text: 'Patient name is required.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await submit();
    } catch {
      setSubmitting(false);
      setMessage({ type: 'error', text: 'Failed to create note.' });
    }
  };

  const handleButtonSubmit = () => {
    ensureSingleSubmit(submitting, runSubmit);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      runSubmit();
    }
  };

  return (
    <div className="card" onKeyDown={handleKeyDown}>
      {message && (
        <div className={message.type === 'error' ? 'error-banner' : 'success-banner'}>
          {message.text}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="patient-name">Patient name</label>
        <input
          id="patient-name"
          data-testid="patient-name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          placeholder="e.g. Jane Smith"
        />
      </div>

      <div className="form-group">
        <label htmlFor="chief-complaint">Chief complaint</label>
        <textarea
          id="chief-complaint"
          data-testid="chief-complaint"
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Describe the patient's primary concern..."
        />
      </div>

      <div className="scripted-panel">
        <h3>Scripted clinical phrase (simulates voice input)</h3>
        <div className="form-group" style={{ marginBottom: 8 }}>
          <input
            data-testid="scripted-phrase"
            value={scriptedPhrase}
            onChange={(e) => setScriptedPhrase(e.target.value)}
            placeholder='e.g. "patient denies pain, no known allergies"'
          />
          <p className="hint">
            Type a phrase and click Apply to auto-evaluate checklist items.
          </p>
        </div>
        <button type="button" className="btn-primary" data-testid="apply-phrase-btn" onClick={handleScriptedApply}>
          Apply phrase
        </button>
      </div>

      <SafetyChecklist checklist={checklist} onToggle={handleChecklistToggle} />

      <div style={{ marginTop: 20 }}>
        <button
          type="button"
          className="btn-primary"
          data-testid="create-note-btn"
          disabled={submitting}
          onClick={handleButtonSubmit}
        >
          {submitting ? 'Creating...' : 'Create clinical note'}
        </button>
        <p className="hint" style={{ marginTop: 8 }}>
          Tip: Ctrl/Cmd + Enter also submits the form.
        </p>
      </div>
    </div>
  );
}
