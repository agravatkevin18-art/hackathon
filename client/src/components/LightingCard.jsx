import { formatINR } from '../utils/api';

export default function LightingCard({ item, added, onToggle }) {
  return (
    <div className="card">
      <div className="item-emoji">{item.icon}</div>
      <h3>{item.name}</h3>
      <p className="muted">{item.description}</p>
      <p className="price">{formatINR(item.price)}</p>
      <button className={added ? 'btn btn-danger' : 'btn btn-primary'} onClick={onToggle}>
        {added ? 'Remove' : 'Add'}
      </button>
    </div>
  );
}
