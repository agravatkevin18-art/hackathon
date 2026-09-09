import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div>
          <h1>Design Your Dream Room 🏠</h1>
          <p>Select a room, enter dimensions, pick wall colors, furniture, flooring & lighting — get instant budget estimate. No database, everything saved in your browser.</p>
          <Link to="/design" className="btn btn-primary big">Start Designing →</Link>
          <Link to="/my-designs" className="btn btn-outline big">My Designs</Link>
        </div>
        <div className="hero-art">
          <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80" alt="Interior" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="hero-emoji">🛋️🪴💡</div>
        </div>
      </section>

      <section>
        <h2>Features</h2>
        <div className="grid">
          <div className="card"><h3>🛏️ 5 Room Types</h3><p className="muted">Bedroom, Living Room, Kitchen, Office, Bathroom</p></div>
          <div className="card"><h3>🎨 9 Wall Colors</h3><p className="muted">Live room preview updates instantly</p></div>
          <div className="card"><h3>🪑 Furniture + 💡 Lighting</h3><p className="muted">Add / remove with live budget</p></div>
          <div className="card"><h3>🪵 Flooring</h3><p className="muted">Price auto-calculated by room area</p></div>
          <div className="card"><h3>💰 Budget Summary</h3><p className="muted">Furniture + Lighting + Flooring total</p></div>
          <div className="card"><h3>💾 LocalStorage</h3><p className="muted">Save designs, no database needed</p></div>
        </div>
      </section>

      <section>
        <h2>How it works</h2>
        <ol className="steps">
          <li>Select room → enter size (ft)</li>
          <li>Pick wall color → see preview</li>
          <li>Add furniture, lighting, flooring</li>
          <li>View summary → Save design</li>
        </ol>
        <Link to="/design" className="btn btn-primary">Start Designing</Link>
      </section>
    </div>
  );
}
