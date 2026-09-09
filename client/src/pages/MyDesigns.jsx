import { useNavigate } from 'react-router-dom';
import { useDesign } from '../context/DesignContext';
import DesignCard from '../components/DesignCard';

export default function MyDesigns() {
  const { savedDesigns, deleteSaved, loadSaved } = useDesign();
  const nav = useNavigate();

  if (!savedDesigns.length) {
    return (
      <div>
        <h2>My Designs</h2>
        <p className="muted">No saved designs yet. Start designing! 👇</p>
        <button className="btn btn-primary" onClick={() => nav('/design')}>Start Designing</button>
      </div>
    );
  }

  return (
    <div>
      <h2>My Designs ({savedDesigns.length})</h2>
      <div className="grid">
        {savedDesigns.map((d) => (
          <DesignCard
            key={d.id}
            item={d}
            onDelete={() => { if (confirm('Delete this design?')) deleteSaved(d.id); }}
            onView={() => { loadSaved(d.id); nav('/design/summary'); }}
          />
        ))}
      </div>
    </div>
  );
}
