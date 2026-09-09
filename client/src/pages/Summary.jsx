import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import RoomPreview from '../components/RoomPreview';
import BudgetSummary from '../components/BudgetSummary';
import { calcBudget } from '../utils/budget';
import { formatINR } from '../utils/api';

export default function Summary() {
  const { design, saveDesign, reset } = useDesign();
  const nav = useNavigate();
  const [msg, setMsg] = useState('');
  const b = calcBudget(design);

  const handleSave = () => {
    saveDesign();
    setMsg('✅ Design saved! Check My Designs page.');
  };

  return (
    <div>
      <h2>Design Summary</h2>
      {msg && <p className="success">{msg}</p>}
      <div className="two-col">
        <div className="card">
          <p><b>Room Type:</b> {design.roomName || design.roomType || '—'}</p>
          <p><b>Room Size:</b> {design.length || '?'} ft × {design.width || '?'} ft{design.height ? ` × ${design.height} ft` : ''}</p>
          <p><b>Wall Color:</b> {design.wallColor?.name || '—'} {design.wallColor && <span className="dot" style={{ background: design.wallColor.hex, border: '1px solid #aaa' }} />}</p>
          <p><b>Furniture:</b> {(design.furniture || []).map((f) => f.name).join(', ') || 'None'}</p>
          <p><b>Lighting:</b> {(design.lighting || []).map((l) => l.name).join(', ') || 'None'}</p>
          <p><b>Flooring:</b> {design.flooring?.name || '—'}</p>
          <hr />
          <p>Furniture total: <b>{formatINR(b.furnitureTotal)}</b></p>
          <p>Lighting total: <b>{formatINR(b.lightingTotal)}</b></p>
          <p>Flooring price: <b>{formatINR(b.flooringPrice)}</b></p>
          <p className="price">Estimated total budget: {formatINR(b.total)}</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={handleSave}>Save Design</button>
            <button className="btn btn-outline" onClick={() => nav('/design')}>Edit Design</button>
            <button className="btn btn-outline" onClick={() => { reset(); nav('/design'); }}>Start New Design</button>
          </div>
        </div>
        <div>
          <RoomPreview design={design} />
          <BudgetSummary design={design} />
        </div>
      </div>
    </div>
  );
}
