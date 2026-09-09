const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function readData(file) {
  const p = path.join(__dirname, 'data', file);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

app.get('/', (req, res) => {
  res.json({ message: 'Interior Design Planner API running 🏠', endpoints: ['/api/rooms', '/api/furniture', '/api/lighting', '/api/flooring', '/api/colors'] });
});

app.get('/api/rooms', (req, res) => {
  try { res.json(readData('rooms.json')); }
  catch (e) { res.status(500).json({ error: 'Failed to load rooms' }); }
});

app.get('/api/furniture', (req, res) => {
  try { res.json(readData('furniture.json')); }
  catch (e) { res.status(500).json({ error: 'Failed to load furniture' }); }
});

app.get('/api/lighting', (req, res) => {
  try { res.json(readData('lighting.json')); }
  catch (e) { res.status(500).json({ error: 'Failed to load lighting' }); }
});

app.get('/api/flooring', (req, res) => {
  try { res.json(readData('flooring.json')); }
  catch (e) { res.status(500).json({ error: 'Failed to load flooring' }); }
});

app.get('/api/colors', (req, res) => {
  try { res.json(readData('colors.json')); }
  catch (e) { res.status(500).json({ error: 'Failed to load colors' }); }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
