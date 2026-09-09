const API_BASE = '';

async function get(path, fallback) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error('bad status');
    return await res.json();
  } catch (e) {
    return fallback;
  }
}

export const FALLBACK = {
  rooms: [
    { id: 'bedroom', name: 'Bedroom', description: 'Cozy and calm personal retreat with bed, wardrobe and soft lighting.', icon: '🛏️', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', suggestedColors: ['Beige', 'Light Pink', 'Lavender', 'Cream'] },
    { id: 'living', name: 'Living Room', description: 'Spacious family gathering area with sofa, TV unit and warm lights.', icon: '🛋️', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80', suggestedColors: ['Cream', 'Beige', 'Light Grey', 'Sage Green'] },
    { id: 'kitchen', name: 'Kitchen', description: 'Modern modular kitchen with dining table and bright lighting.', icon: '🍳', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80', suggestedColors: ['White', 'Cream', 'Peach', 'Light Blue'] },
    { id: 'office', name: 'Office', description: 'Productive home office with table, chair and bookshelf.', icon: '💼', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80', suggestedColors: ['White', 'Light Grey', 'Light Blue', 'Sage Green'] },
    { id: 'bathroom', name: 'Bathroom', description: 'Clean and fresh bathroom with modern fittings and tiles.', icon: '🛁', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80', suggestedColors: ['White', 'Light Blue', 'Light Grey', 'Cream'] }
  ],
  furniture: [
    { id: 'bed', name: 'Bed', price: 25000, icon: '🛏️', description: 'Queen size bed with storage', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=60' },
    { id: 'sofa', name: 'Sofa', price: 30000, icon: '🛋️', description: '3-seater fabric sofa', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60' },
    { id: 'wardrobe', name: 'Wardrobe', price: 22000, icon: '🚪', description: '3-door wooden wardrobe', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=60' },
    { id: 'table', name: 'Table', price: 8000, icon: '🪑', description: 'Study / side table', image: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=600&q=60' },
    { id: 'chair', name: 'Chair', price: 4500, icon: '💺', description: 'Ergonomic chair', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=60' },
    { id: 'tvunit', name: 'TV Unit', price: 15000, icon: '📺', description: 'Modern TV console', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=60' },
    { id: 'dining', name: 'Dining Table', price: 28000, icon: '🍽️', description: '6-seater dining set', image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=600&q=60' },
    { id: 'bookshelf', name: 'Bookshelf', price: 12000, icon: '📚', description: '5-shelf wooden bookshelf', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=60' }
  ],
  lighting: [
    { id: 'ceiling', name: 'Ceiling Light', price: 3500, icon: '💡', description: 'Panel light' },
    { id: 'wall', name: 'Wall Light', price: 2200, icon: '🔆', description: 'Wall sconce' },
    { id: 'pendant', name: 'Pendant Light', price: 4800, icon: '🔮', description: 'Pendant' },
    { id: 'led', name: 'LED Strip', price: 1800, icon: '✨', description: 'LED strip 5m' },
    { id: 'floorlamp', name: 'Floor Lamp', price: 5500, icon: '🪔', description: 'Floor lamp' }
  ],
  flooring: [
    { id: 'wooden', name: 'Wooden Flooring', pricePerSqFt: 250, icon: '🪵', description: 'Laminate wood', color: '#b07d4f' },
    { id: 'marble', name: 'Marble', pricePerSqFt: 300, icon: '⬜', description: 'Marble glossy', color: '#e8e8e8' },
    { id: 'ceramic', name: 'Ceramic Tiles', pricePerSqFt: 120, icon: '🟧', description: 'Ceramic tiles', color: '#d9c7a7' },
    { id: 'carpet', name: 'Carpet', pricePerSqFt: 100, icon: '🟫', description: 'Soft carpet', color: '#a0715a' },
    { id: 'vinyl', name: 'Vinyl Flooring', pricePerSqFt: 90, icon: '🟨', description: 'Vinyl', color: '#c9b896' }
  ],
  colors: [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'cream', name: 'Cream', hex: '#FDF3DC' },
    { id: 'beige', name: 'Beige', hex: '#E8DCC4' },
    { id: 'grey', name: 'Light Grey', hex: '#D9DDE2' },
    { id: 'pink', name: 'Light Pink', hex: '#F8CFCF' },
    { id: 'blue', name: 'Light Blue', hex: '#C6E7F5' },
    { id: 'sage', name: 'Sage Green', hex: '#B9C8A9' },
    { id: 'peach', name: 'Peach', hex: '#FFD9B3' },
    { id: 'lavender', name: 'Lavender', hex: '#DDD6F3' }
  ]
};

export const api = {
  getRooms: () => get('/api/rooms', FALLBACK.rooms),
  getFurniture: () => get('/api/furniture', FALLBACK.furniture),
  getLighting: () => get('/api/lighting', FALLBACK.lighting),
  getFlooring: () => get('/api/flooring', FALLBACK.flooring),
  getColors: () => get('/api/colors', FALLBACK.colors)
};

export function formatINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}
