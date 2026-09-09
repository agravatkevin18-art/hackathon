# Interior Design Planner 🏠

React + Node.js + Express + LocalStorage — **no database**.

## Run

Backend (port 5000):
```
cd server
npm install
npm start
```

Frontend (port 3000):
```
cd client
npm install
npm run dev
```

APIs: `GET /api/rooms`, `/api/furniture`, `/api/lighting`, `/api/flooring`, `/api/colors` — served from `server/data/*.json`.

## Flow
Home → Select Room → Room Details (validation) → Wall Color → Furniture → Lighting → Flooring → Summary (budget) → Save to LocalStorage → My Designs (view/delete).

Budget = Furniture total + Lighting total + Flooring (₹/sq.ft × length × width).
