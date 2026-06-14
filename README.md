# 🌾 Okave – Farm-to-Market Platform (Prototype)

Okave connects Nigerian farmers (via agents/co-ops) directly to buyers — households, restaurants, and retailers — with smart price intelligence, SMS notifications, and subscription deliveries.

## Monorepo Structure

```
okave-prototype/
├── backend/          # Node.js + Express + SQLite (via Prisma)
└── frontend/         # React + Vite + TailwindCSS
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm run seed        # seeds market price snapshots
npm run dev         # starts on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

## Demo Credentials
| Role   | Email                  | Password   |
|--------|------------------------|------------|
| Agent  | agent@okave.ng         | okave123   |
| Buyer  | buyer@okave.ng         | okave123   |
| Admin  | admin@okave.ng         | okave123   |

## Key Features (Demo)
- ✅ Auth (Agent + Buyer + Admin)
- ✅ Farmer registration by agent
- ✅ Produce listing creation with **price intelligence** (Your price vs. Suggested range)
- ✅ Buyer marketplace: browse, filter, place order
- ✅ Simulated payment success + SMS log (console)
- ✅ Co-op aggregation (seeded)
- ✅ Subscription basket UI
- ✅ Admin market price CRUD

## Tech Stack
- **Backend**: Node.js, Express, Prisma ORM, SQLite, JWT, bcrypt, Zod
- **Frontend**: React 18, Vite, TailwindCSS, React Router v6, Axios, React Query
