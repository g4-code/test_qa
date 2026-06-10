import { useState, useEffect } from 'react';
import PatientIntakeForm from './components/PatientIntakeForm';
import SubmittedNotesList from './components/SubmittedNotesList';
import { subscribeNotes } from './services/mockEhr';

export default function App() {
  const [activeTab, setActiveTab] = useState('intake');
  const [notesVersion, setNotesVersion] = useState(0);

  useEffect(() => {
    return subscribeNotes(() => {
      setNotesVersion((v) => v + 1);
    });
  }, []);

  return (
    <div>
      <h1>ClinicFlow Intake</h1>
      <p className="subtitle">
        Dental patient intake and clinical note preparation
      </p>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'intake'}
          className={`tab ${activeTab === 'intake' ? 'active' : ''}`}
          onClick={() => setActiveTab('intake')}
        >
          Intake
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'notes'}
          className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Submitted Notes
        </button>
      </div>

      {activeTab === 'intake' && (
        <PatientIntakeForm onNoteCreated={() => setActiveTab('notes')} />
      )}
      {activeTab === 'notes' && <SubmittedNotesList key={notesVersion} />}
    </div>
  );
}
