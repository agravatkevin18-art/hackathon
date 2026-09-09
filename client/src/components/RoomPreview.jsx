export default function RoomPreview({ design }) {
  const wall = design.wallColor?.hex || '#f3ede2';
  const floor = design.flooring?.color || '#c9b896';
  return (
    <div className="preview">
      <h3>Room Preview</h3>
      <div className="room-box">
        <div className="wall" style={{ background: wall }}>
          <div className="window">🪟</div>
          <div className="lamp-glow">💡</div>
        </div>
        <div className="floor" style={{ background: floor }}>
          {(design.furniture || []).slice(0, 6).map((f) => (
            <span key={f.id} className="mini-furniture" title={f.name}>{f.icon}</span>
          ))}
          {(!design.furniture || design.furniture.length === 0) && <span className="muted">No furniture yet</span>}
        </div>
      </div>
      <p className="muted small">
        {design.roomName || 'Room'} • {design.length || '?'} ft × {design.width || '?'} ft • {design.wallColor?.name || 'No color'} • {design.flooring?.name || 'No flooring'}
      </p>
    </div>
  );
}
