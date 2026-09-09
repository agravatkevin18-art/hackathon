export default function ColorPicker({ colors, selected, onSelect }) {
  return (
    <div className="color-grid">
      {colors.map((c) => (
        <div
          key={c.id || c.name}
          className={selected?.name === c.name ? 'color-swatch selected' : 'color-swatch'}
          onClick={() => onSelect(c)}
          title={c.name}
        >
          <span className="swatch" style={{ background: c.hex, border: c.hex === '#FFFFFF' ? '1px solid #ccc' : 'none' }} />
          <span className="color-name">{c.name}</span>
          {selected?.name === c.name && <span className="badge">✓</span>}
        </div>
      ))}
    </div>
  );
}
