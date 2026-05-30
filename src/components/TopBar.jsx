export function TopBar({ title, onBack, onSave, onPrint }) {
  return (
    <div className="top-bar">
      <button className="top-bar__back" onClick={onBack}>← Back</button>
      <span className="top-bar__title">{title}</span>
      <div className="top-bar__actions">
        <button className="top-bar__save" onClick={onSave}>💾 Save</button>
        <button className="top-bar__print" onClick={onPrint}>🖨 Print</button>
      </div>
    </div>
  )
}
