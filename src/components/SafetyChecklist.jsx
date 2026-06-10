import { CHECKLIST_TEMPLATE } from '../utils/checklistRules';

export default function SafetyChecklist({ checklist, onToggle }) {
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h2 style={{ margin: '0 0 12px', fontSize: '1rem' }}>Safety Checklist</h2>
      <ul className="checklist">
        {CHECKLIST_TEMPLATE.map((item) => (
          <li key={item.id} className="checklist-item">
            <input
              type="checkbox"
              id={`check-${item.id}`}
              checked={!!checklist[item.id]}
              onChange={() => onToggle(item.id)}
            />
            <label htmlFor={`check-${item.id}`}>
              {item.id === 'allergies' ? (
                <span data-testid="checklist-allergies">{item.label}</span>
              ) : (
                item.label
              )}
              {item.priority === 'high' && (
                <span className="badge-critical">critical</span>
              )}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
