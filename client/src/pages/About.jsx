export default function About() {
  return (
    <div>
      <h2>About Interior Design Planner</h2>
      <div className="card">
        <p>A modern interior planning app built with <b>React.js + Node.js + Express.js</b>.</p>
        <ul>
          <li>No MongoDB / MySQL / Firebase — data comes from REST APIs reading static JSON files.</li>
          <li>State + saved designs stored in <b>LocalStorage</b>.</li>
          <li>Budget = Furniture total + Lighting total + (Flooring ₹/sq.ft × area).</li>
          <li>Responsive card UI with live HTML/CSS room preview.</li>
        </ul>
        <p className="muted">Backend: GET /api/rooms, /api/furniture, /api/lighting, /api/flooring, /api/colors</p>
      </div>
    </div>
  );
}
