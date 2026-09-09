import { Link } from 'react-router-dom';
import { calcBudget } from '../utils/budget';
import { formatINR } from '../utils/api';

export default function DesignCard({ item, onDelete, onView }) {
  const b = calcBudget(item);
  return (
    <div className="card">
      <h3>{item.roomName || item.roomType} {item.wallColor ? <span className="dot" style={{ background: item.wallColor.hex }} /> : null}</h3>
      <p className="muted">{item.length} ft × {item.width} ft • {item.wallColor?.name} • {item.flooring?.name || 'No flooring'}</p>
      <p className="small">Furniture: {(item.furniture || []).map((f) => f.name).join(', ') || 'None'}</p>
      <p className="price">{formatINR(b.total)}</p>
      <p className="muted small">{item.date}</p>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={onView}>View</button>
        <button className="btn btn-danger" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
