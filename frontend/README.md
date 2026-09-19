# StockPulse Frontend

The modern, operational B2B SaaS frontend for **StockPulse** — a visual inventory health and smart replenishment platform.

Built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, **Recharts**, and **Lucide React**.

---

## 🚀 Quick Start

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open your browser at: `http://localhost:5173`

---

## ⚙️ Environment Configuration

Configuration is managed via `.env`:

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API Gateway | `http://localhost:8000/api` |
| `VITE_USE_MOCK_API` | Toggles isolated development mock adapter | `true` |
| `VITE_ENABLE_DEMO_TOOLS` | Toggles interactive Demo Event Simulator | `true` |

### Mock Mode (`VITE_USE_MOCK_API=true`)
When enabled, the frontend utilizes an isolated in-memory development adapter (`src/api/mock-adapter.ts`). It simulates realistic network latency and models authoritative backend replenishment logic across 4 fulfillment hubs (Mumbai, Delhi, Bengaluru, Hyderabad).

### Production Mode (`VITE_USE_MOCK_API=false`)
When set to `false`, the mock adapter is bypassed and all requests go directly to `VITE_API_URL` conforming to the backend contract:
- `GET /inventory`
- `GET /inventory/{productId}`
- `GET /inventory/location/{locationId}`
- `GET /inventory/health`
- `GET /inventory/search`
- `GET /reorders`
- `POST /inventory/events`

---

## 🎮 Demo Event Simulator (`VITE_ENABLE_DEMO_TOOLS=true`)

An interactive operations console available in the topbar (`Simulate Event` button) to simulate real-time edge telemetry:
1. Choose SKU, Location, Quantity, and Event Type (`SALE`, `RESTOCK`, `RETURN`, `TRANSFER_IN`, `TRANSFER_OUT`, `ADJUSTMENT`).
2. Dispatches `POST /inventory/events`.
3. Simulates the serverless pipeline:
   `Frontend → API Gateway → Ingest Lambda → AWS SQS → Processor Lambda → DynamoDB + OpenSearch`
4. Receives asynchronous acceptance and automatically refetches updated inventory balances and health metrics.

---

## 📂 Project Architecture

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts             # Typed Fetch client
│   │   ├── inventory-api.ts      # Inventory endpoints
│   │   ├── search-api.ts         # OpenSearch event query endpoints
│   │   ├── reorder-api.ts        # Smart replenishment endpoints
│   │   ├── events-api.ts         # Event ingestion endpoint
│   │   ├── mock-adapter.ts       # Isolated in-memory dev mock adapter
│   │   └── mock-data.ts          # Seed dataset
│   │
│   ├── components/
│   │   ├── layout/               # AppShell, Sidebar, Topbar, LocationSelector
│   │   ├── common/               # Button, DataTable, Card, MetricCard, StatusBadge, Drawer
│   │   ├── dashboard/            # Health Donut, Velocity Line Chart, NeedsAttentionTable
│   │   ├── inventory/            # InventoryTable, ProductDetailsDrawer, InventoryFilters
│   │   ├── reorders/             # ReorderTable, WhyReorderDrawer, ReorderSummaryCards
│   │   ├── activity/             # ActivityTimelineTable, ActivityFilters
│   │   ├── search/               # EventSearchFilters, EventSearchResults
│   │   └── demo/                 # DemoEventSimulatorModal
│   │
│   ├── hooks/
│   │   ├── useInventory.ts       # Inventory query state
│   │   ├── useInventoryHealth.ts # Aggregates & KPIs
│   │   ├── useReorders.ts        # Smart replenishment recommendations
│   │   └── useSearch.ts          # Debounced event searching
│   │
│   ├── types/
│   │   ├── api.ts                # Response wrappers & errors
│   │   ├── inventory.ts          # Product & location schemas
│   │   ├── reorder.ts            # Reorder & mathematical explanations
│   │   └── events.ts             # Event telemetry schemas
│   │
│   ├── utils/
│   │   ├── formatters.ts         # Currency, numbers, relative dates
│   │   └── colors.ts             # Semantic health & event colors
│   │
│   ├── App.tsx                   # Routing & global providers
│   ├── main.tsx                  # React DOM entry
│   └── index.css                 # Tailwind directives & styles
│
├── public/
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🧪 Quality Verification

```bash
# Type check TypeScript definitions
npm run typecheck

# Verify ESLint rules
npm run lint

# Build production bundle
npm run build
```
