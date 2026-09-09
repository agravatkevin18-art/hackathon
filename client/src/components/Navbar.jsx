import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const link = (to, label) => (
    <Link key={to} to={to} className={pathname === to ? 'nav-link active' : 'nav-link'}>{label}</Link>
  );
  return (
    <nav className="navbar">
      <Link to="/" className="logo">🏠 Interior Design Planner</Link>
      <div className="nav-links">
        {link('/', 'Home')}
        {link('/design', 'Design Room')}
        {link('/my-designs', 'My Designs')}
        {link('/about', 'About')}
      </div>
    </nav>
  );
}
