import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useDesign } from '../context/DesignContext';
import FurnitureCard from '../components/FurnitureCard';
import RoomPreview from '../components/RoomPreview';
import BudgetSummary from '../components/BudgetSummary';

export default function Furniture() {
  const [items, setItems] = useState([]);
  const { design, toggleItem } = useDesign();
  const nav = useNavigate();
  useEffect(() => { api.getFurniture().then(setItems); }, []);
  const isAdded = (id) => (design.furniture || []).some((x) => x.id === id);

  return (
    <div>
      <h2>Step 4 — Furniture</h2>
      <div className="two-col">
        <div className="grid">
          {items.map((it) => (
            <FurnitureCard key={it.id} item={it} added={isAdded(it.id)} onToggle={() => toggleItem('furniture', it)} />
          ))}
        </div>
        <div>
          <RoomPreview design={design} />
          <BudgetSummary design={design} />
        </div>
      </div>
      <div className="btn-row">
        <button className="btn btn-outline" onClick={() => nav('/design/walls')}>← Back</button>
        <button className="btn btn-primary" onClick={() => nav('/design/lighting')}>Next →</button>
      </div>
    </div>
  );
}
