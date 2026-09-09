import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import SelectRoom from './pages/SelectRoom.jsx';
import RoomDetails from './pages/RoomDetails.jsx';
import WallColor from './pages/WallColor.jsx';
import Furniture from './pages/Furniture.jsx';
import Lighting from './pages/Lighting.jsx';
import Flooring from './pages/Flooring.jsx';
import Summary from './pages/Summary.jsx';
import MyDesigns from './pages/MyDesigns.jsx';
import About from './pages/About.jsx';

const steps = [
  { to: '/design', label: '1 Room' },
  { to: '/design/details', label: '2 Size' },
  { to: '/design/walls', label: '3 Color' },
  { to: '/design/furniture', label: '4 Furniture' },
  { to: '/design/lighting', label: '5 Lighting' },
  { to: '/design/flooring', label: '6 Flooring' },
  { to: '/design/summary', label: '7 Summary' }
];

function Stepper() {
  const { pathname } = useLocation();
  if (!pathname.startsWith('/design')) return null;
  return (
    <div className="stepper">
      {steps.map((s) => (
        <Link key={s.to} to={s.to} className={pathname === s.to ? 'step active' : 'step'}>{s.label}</Link>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Stepper />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/design" element={<SelectRoom />} />
          <Route path="/design/details" element={<RoomDetails />} />
          <Route path="/design/walls" element={<WallColor />} />
          <Route path="/design/furniture" element={<Furniture />} />
          <Route path="/design/lighting" element={<Lighting />} />
          <Route path="/design/flooring" element={<Flooring />} />
          <Route path="/design/summary" element={<Summary />} />
          <Route path="/my-designs" element={<MyDesigns />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
