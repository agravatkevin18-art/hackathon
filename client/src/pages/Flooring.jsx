import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useDesign } from '../context/DesignContext';
import FlooringCard from '../components/FlooringCard';
import RoomPreview from '../components/RoomPreview';
import BudgetSummary from '../components/BudgetSummary';

export default function Flooring() {
  const [items, setItems] = useState([]);
  const { design, update } = useDesign();
  const nav = useNavigate();
  useEffect(() => { api.getFlooring().then(setItems); }, []);
  const area = (Number(design.length) || 0) * (Number(design.width) || 0);

  return (
    <div>
      <h2>Step 6 — Flooring (select one)</h2>
      <p className="muted">Room area: {area} sq.ft — flooring price = ₹/sq.ft × area</p>
      <div className="two-col">
        <div className="grid">
          {items.map((it) => (
            <FlooringCard key={it.id} item={it} area={area} selected={design.flooring?.id === it.id} onSelect={() => update({ flooring: it })} />
          ))}
        </div>
        <div>
          <RoomPreview design={design} />
          <BudgetSummary design={design} />
        </div>
      </div>
      {!design.flooring && <p className="error">Please select a flooring option.</p>}
      <div className="btn-row">
        <button className="btn btn-outline" onClick={() => nav('/design/lighting')}>← Back</button>
        <button className="btn btn-primary" disabled={!design.flooring} onClick={() => nav('/design/summary')}>See Summary →</button>
      </div>
    </div>
  );
}
