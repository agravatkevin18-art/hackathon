import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import RoomPreview from '../components/RoomPreview';

export default function RoomDetails() {
  const { design, update } = useDesign();
  const nav = useNavigate();
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    ['length', 'width', 'height'].forEach((k) => {
      const v = Number(design[k]);
      if (!design[k]) e[k] = 'Required';
      else if (isNaN(v) || v <= 0) e[k] = 'Must be a positive number';
      else if (v > 100) e[k] = 'Too large (max 100 ft)';
    });
    if (!design.roomType) e.roomType = 'Go back and select a room first.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="two-col">
      <div>
        <h2>Step 2 — Room Details</h2>
        {errors.roomType && <p className="error">{errors.roomType}</p>}
        <label>Room Length (feet)
          <input type="number" min="1" max="100" value={design.length} onChange={(ev) => update({ length: ev.target.value })} placeholder="e.g. 12" />
        </label>
        {errors.length && <p className="error">{errors.length}</p>}
        <label>Room Width (feet)
          <input type="number" min="1" max="100" value={design.width} onChange={(ev) => update({ width: ev.target.value })} placeholder="e.g. 10" />
        </label>
        {errors.width && <p className="error">{errors.width}</p>}
        <label>Room Height (feet)
          <input type="number" min="1" max="30" value={design.height} onChange={(ev) => update({ height: ev.target.value })} placeholder="e.g. 10" />
        </label>
        {errors.height && <p className="error">{errors.height}</p>}
        <div className="btn-row">
          <button className="btn btn-outline" onClick={() => nav('/design')}>← Back</button>
          <button className="btn btn-primary" onClick={() => { if (validate()) nav('/design/walls'); }}>Next →</button>
        </div>
      </div>
      <RoomPreview design={design} />
    </div>
  );
}
