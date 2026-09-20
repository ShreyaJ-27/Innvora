# Innvora — Intelligent Inventory Operations Platform

> **AWS Hackathon 2026 Submission**  
> A real-time, serverless inventory management platform built on AWS — featuring event-driven stock tracking, AI-powered replenishment intelligence, and a premium editorial web interface.

---

## 🌐 Live Demo

| | URL |
|---|---|
| **Frontend** | [https://innvora.vercel.app](https://innvora.vercel.app) |
| **Backend API** | `https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod` |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Innvora Frontend                         │
│              React + TypeScript + Vite (Vercel)                 │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTPS  REST
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     AWS API Gateway                             │
│              (REST API — /prod stage)                           │
└────────┬────────────────────────────────────┬───────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                ┌──────────────────────┐
│  Lambda (Event  │                │  Lambda (Inventory   │
│  Receiver)      │                │  Query API)          │
│  Node.js 20     │                │  Node.js 20          │
└────────┬────────┘                └──────────┬───────────┘
         │                                    │
         ▼                                    │
┌─────────────────┐                           │
│  SQS Queue      │                           │
│  (Async Buffer) │                           │
└────────┬────────┘                           │
         │                                    │
         ▼                                    │
┌─────────────────────────────────────────────┴──────────┐
│                       DynamoDB                          │
│     Table: StockPulseInventory (per-SKU per-location)  │
└────────┬────────────────────────────────────────────────┘
         │ DynamoDB Stream
         ▼
┌─────────────────┐
│  Lambda (Index  │◄── Also directly indexed from Processor
│  Propagator)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Amazon OpenSearch  │
│  (Event History     │
│   Full-text Index)  │
└─────────────────────┘
```

### Services Used

| Service | Purpose |
|---|---|
| **API Gateway** | REST API for event ingestion and inventory queries |
| **Lambda (×3)** | Event Receiver, Stock Processor, Inventory Query Handler |
| **SQS** | Async decoupling between event ingestion and processing |
| **DynamoDB** | Primary inventory state store (per-SKU, per-location) |
| **OpenSearch** | Full-text search index for historical event queries |
| **VPC + IAM** | Network isolation and least-privilege service access |
| **Vercel** | Frontend hosting (zero-config, global CDN) |

---

## 💡 Core Features

### Event-Driven Inventory Engine
- Every stock movement (Sale, Restock, Return, Transfer In/Out, Adjustment) is captured as an immutable event
- Events flow through: API Gateway → Lambda Receiver → SQS → Lambda Processor → DynamoDB
- Atomic conditional writes prevent race conditions in concurrent stock updates

### Replenishment Intelligence
- Server-side calculation of replenishment recommendations using:
  - `Lead Time Demand = Daily Velocity × Lead Time Days`
  - `Recommended Qty = Lead Time Demand + Safety Stock − Available Stock`
- Status classification: `HEALTHY`, `REORDER_SOON`, `CRITICAL`, `OVERSTOCKED`
- Urgency-ranked replenishment queue with supplier-aware recommendations

### Multi-Location Network
- 6 fulfillment hubs across India (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Pune)
- Per-hub inventory health scores, SKU counts, and critical stock alerts
- Inter-hub stock transfer event support

### Full-Text Event Search
- OpenSearch-powered event history queryable by SKU, product name, event type, or location
- Deep event ledger with stock-before/after deltas for auditability

### Demo Event Simulator
- Included browser-based event simulator to generate realistic inventory events
- Sends live requests to the deployed AWS backend via API Gateway

---

## 🗂️ Repository Structure

```
stock-pulse/
├── frontend/               # React + TypeScript + Vite (Tailwind CSS)
│   ├── src/
│   │   ├── pages/          # Route-level page components
│   │   ├── components/     # Reusable UI components (common/, layout/, dashboard/, etc.)
│   │   ├── hooks/          # API data fetching hooks
│   │   ├── api/            # API client (axios, typed responses)
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Formatters, color utilities
│   └── tailwind.config.js  # Innvora warm design system tokens
│
├── backend/                # AWS Lambda functions (Node.js 20)
│   ├── src/
│   │   ├── handlers/       # Lambda function entry points
│   │   ├── services/       # Business logic (inventory, reorders, search)
│   │   └── types/          # Shared backend type definitions
│   └── cdk/                # AWS CDK infrastructure as code (StockPulseStack)
│
└── scripts/                # Demo data seeding and reset utilities
    ├── seed-demo-data.ts
    └── reset-demo-data.ts
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js 20+
- npm 9+

### Frontend

```bash
cd frontend
npm install

# Create .env.local
echo "VITE_API_BASE_URL=https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod" > .env.local

npm run dev
# → http://localhost:5173
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | ✅ | AWS API Gateway base URL |

---

## 📡 API Reference

Base URL: `https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/inventory` | List inventory items (filter by location, status, search) |
| `GET` | `/inventory/health` | Summary metrics + per-location breakdown |
| `GET` | `/reorders` | Replenishment recommendations |
| `GET` | `/events` | Event history (paginated, filterable) |
| `GET` | `/search` | Full-text OpenSearch event query |
| `POST` | `/events` | Ingest a new inventory event |

### Event Payload Example

```json
{
  "sku": "PROD-CHG-02",
  "locationId": "LOC-MUM-01",
  "eventType": "SALE",
  "quantity": 5,
  "source": "POS_SYSTEM",
  "referenceId": "POS-TXN-92841"
}
```

---

## 🎨 Design System

Innvora uses a custom warm editorial palette — intentionally distinct from generic SaaS blues:

| Token | Hex | Usage |
|---|---|---|
| `sand-100` | `#F2ECE2` | Primary background |
| `sand-200` | `#E9E0D2` | Card surfaces |
| `charcoal-900` | `#272522` | Primary text |
| `olive-500` | `#7A9E5D` | Healthy/positive states |
| `terracotta-600` | `#C6745A` | Alerts/critical states |

Typography: **Playfair Display** (display) + **Inter** (body) + **IBM Plex Mono** (data)

---

## 👩‍💻 Team

Built with ❤️ for the **AWS Hackathon 2026** by the Innvora team.

---

## 📄 License

MIT
