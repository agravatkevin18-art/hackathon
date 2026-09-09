import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useDesign } from '../context/DesignContext';
import RoomCard from '../components/RoomCard';

export default function SelectRoom() {
  const [rooms, setRooms] = useState([]);
  const { design, update } = useDesign();
  const nav = useNavigate();

  useEffect(() => { api.getRooms().then(setRooms); }, []);

  return (
    <div>
      <h2>Step 1 — Select Room</h2>
      <div className="grid">
        {rooms.map((r) => (
          <RoomCard
            key={r.id}
            room={r}
            selected={design.roomType === r.id}
            onSelect={() => update({ roomType: r.id, roomName: r.name })}
          />
        ))}
      </div>
      {!design.roomType && <p className="error">Please select a room to continue.</p>}
      <div className="btn-row">
        <button className="btn btn-primary" disabled={!design.roomType} onClick={() => nav('/design/details')}>Next →</button>
      </div>
    </div>
  );
}
