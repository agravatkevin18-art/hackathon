export default function RoomCard({ room, selected, onSelect }) {
  return (
    <div className={selected ? 'card room-card selected' : 'card room-card'} onClick={onSelect}>
      <div className="room-img">
        {room.image
          ? <img src={room.image} alt={room.name} loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
          : null}
        <span className="room-emoji">{room.icon}</span>
      </div>
      <h3>{room.name}</h3>
      <p className="muted">{room.description}</p>
      {selected && <span className="badge">✓ Selected</span>}
    </div>
  );
}
