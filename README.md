# TransitOps — Smart Enterprise Transport Operations Platform

TransitOps is a premium enterprise-grade commercial fleet management and analytics platform (inspired by Samsara and Fleetio). It provides dispatcher control dashboards, visual telemetry progress trackers, interactive asset sliding detail drawers, database-linked business rule safety gates, and automated financial auditing ledgers.

## Key Features

1. **Dashboard Command Center**: Real-time KPI widgets, animated circular gauges for operational availability, interactive scheduling feeds, and segment-tabbed Recharts trends.
2. **Interactive Sliding Drawers**: Slide-left panels detail profiles, financial area charts, license verification grids, safety score trends, and GPS dispatches.
3. **Dispatcher Route Safety Gates**: Enforces business constraints checking cargo capacity overload, suspended operators, and license expirations before dispatch.
4. **Maintenance Lockouts**: Locking open repair logs triggers state updates, securing vehicle assets in-shop and blocking dispatches.
5. **Printable Audit Dossier**: Clean PDF styling with stamp boxes, signature lines, compliance badges, and localized currency grids.
6. **Global Search Cmd palette**: Quick `⌘K` / `Ctrl+K` key commands slide open search overlaying all databases.
7. **AI Fleet Copilot**: Interactive assistant bubble responding to queries matching dashboard telemetry indexes.
8. **Performance Optimizations**: React lazy routing, page-row skeletons, and database cascading structures.

## Technology Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios.
- **Backend**: Node.js, Express, Sequelize ORM, JWT Authentication.
- **Database**: SQLite3.
- **Tools**: Vite, PostCSS.

## Architecture Topology

```
[React SPA Client] ◄─── API Queries ───► [Express Node API Server] ◄─── Sequelize ORM ───► [SQLite File]
```

Detailed architecture diagrams are compiled at [docs/architecture.md](docs/architecture.md).

## Folder Structure

```
transitops_core/
├── client/                 # React Single Page Application
│   ├── src/
│   │   ├── components/     # UI components (Drawers, Maps, Chatbots)
│   │   ├── contexts/       # Global contexts (Toast system)
│   │   ├── layouts/        # Layout wrappers (Dashboard wrapper)
│   │   ├── pages/          # Page views (Dashboard, Vehicles, Trips)
│   │   └── services/       # Axios API client requests
├── server/                 # Express backend API service
│   ├── config/             # DB initialization and keys
│   ├── controllers/        # Express route request handlers
│   ├── database/           # SQLite database file
│   ├── middleware/         # Auth protector middlewares
│   └── models/             # Sequelize database models
└── docs/                   # System design specifications
```

## Database Schema Relations

Entity Relationship Models and schema keys details are documented at [docs/database-schema.md](docs/database-schema.md).

## REST API Specification

A list of all endpoints, parameters, and payloads is hosted at [docs/api-documentation.md](docs/api-documentation.md).

## Dispatch Workflow Checklists

Step-by-step dispatch compliance checklists are mapped at [docs/workflow.md](docs/workflow.md).

## Installation & Guide

### Prerequisites
- Node.js (v18+)
- npm

### 1. Backend Service Setup
```bash
cd server
npm install
npm run seed     # seed database
npm start        # run server (port 5000)
```

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev      # start dev client (port 5173)
```

## Environment Configs

### Backend config (`server/.env`)
```env
PORT=5000
JWT_SECRET=transitops_super_secret_key_12345
```

## Demonstration Credentials

- **Fleet Administrator**: `manager` / `password123`
- **Safety Officer**: `safety` / `password123`
- **Financial Analyst**: `financial` / `password123`

---

### License
Distributed under the MIT License. See `LICENSE` file.
