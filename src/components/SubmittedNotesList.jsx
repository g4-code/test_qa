import { getNotes } from '../services/mockEhr';

export default function SubmittedNotesList() {
  const notes = getNotes();

  if (notes.length === 0) {
    return (
      <div className="card">
        <p className="empty-state">No clinical notes submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ margin: '0 0 16px', fontSize: '1rem' }}>
        Submitted Notes ({notes.length})
      </h2>
      <ul className="notes-list" data-testid="notes-list">
        {notes.map((note) => (
          <li key={note.id} className="note-item" data-testid="note-item">
            <strong>{note.patientName || 'Unknown patient'}</strong>
            <div data-testid="note-complaint">{note.chiefComplaint}</div>
            <div className="note-meta">
              Created: {note.createdAt}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
