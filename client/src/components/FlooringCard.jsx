export default function FlooringCard({ item, selected, area, onSelect }) {
  const total = Math.round((area || 0) * (item.pricePerSqFt || 0));
  return (
    <div className={selected ? 'card selected' : 'card'} onClick={onSelect} style={{ cursor: 'pointer' }}>
      <div className="floor-swatch" style={{ background: item.color }} />
      <div className="item-emoji">{item.icon}</div>
      <h3>{item.name}</h3>
      <p className="muted">{item.description}</p>
      <p className="price">₹{item.pricePerSqFt}/sq.ft{area > 0 ? ` • ≈ ₹${total.toLocaleString('en-IN')} for ${area} sq.ft` : ''}</p>
      {selected && <span className="badge">✓ Selected</span>}
    </div>
  );
}
