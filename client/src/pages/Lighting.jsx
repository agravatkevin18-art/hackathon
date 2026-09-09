import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useDesign } from '../context/DesignContext';
import LightingCard from '../components/LightingCard';
import RoomPreview from '../components/RoomPreview';
import BudgetSummary from '../components/BudgetSummary';

export default function Lighting() {
  const [items, setItems] = useState([]);
  const { design, toggleItem } = useDesign();
  const nav = useNavigate();
  useEffect(() => { api.getLighting().then(setItems); }, []);
  const isAdded = (id) => (design.lighting || []).some((x) => x.id === id);

  return (
    <div>
      <h2>Step 5 — Lighting</h2>
      <div className="two-col">
        <div className="grid">
          {items.map((it) => (
            <LightingCard key={it.id} item={it} added={isAdded(it.id)} onToggle={() => toggleItem('lighting', it)} />
          ))}
        </div>
        <div>
          <RoomPreview design={design} />
          <BudgetSummary design={design} />
        </div>
      </div>
      <div className="btn-row">
        <button className="btn btn-outline" onClick={() => nav('/design/furniture')}>← Back</button>
        <button className="btn btn-primary" onClick={() => nav('/design/flooring')}>Next →</button>
      </div>
    </div>
  );
}
