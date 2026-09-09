import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useDesign } from '../context/DesignContext';
import ColorPicker from '../components/ColorPicker';
import RoomPreview from '../components/RoomPreview';

export default function WallColor() {
  const [colors, setColors] = useState([]);
  const { design, update } = useDesign();
  const nav = useNavigate();
  useEffect(() => { api.getColors().then(setColors); }, []);

  return (
    <div className="two-col">
      <div>
        <h2>Step 3 — Wall Color</h2>
        <ColorPicker colors={colors} selected={design.wallColor} onSelect={(c) => update({ wallColor: c })} />
        {!design.wallColor && <p className="error">Please select a wall color.</p>}
        <div className="btn-row">
          <button className="btn btn-outline" onClick={() => nav('/design/details')}>← Back</button>
          <button className="btn btn-primary" disabled={!design.wallColor} onClick={() => nav('/design/furniture')}>Next →</button>
        </div>
      </div>
      <RoomPreview design={design} />
    </div>
  );
}
