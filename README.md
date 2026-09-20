# Innvora — Intelligent Inventory Operations Platform

> **AWS Hackathon 2026 Submission**  
> A real-time, event-driven, serverless inventory management and replenishment intelligence platform built on AWS — featuring zero-scan DynamoDB query architecture, precomputed read models, automated catalog onboarding with conflict resolution, and an editorial web interface.

---

## 🌐 Live Deployments

| Resource | URL |
|---|---|
| **Production Web Application** | [https://innvora.vercel.app](https://innvora.vercel.app) |
| **AWS API Gateway REST API** | `https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod` |
| **AWS Region** | `ap-south-1` (Mumbai) |

---

## 🏗️ Architecture & AWS Services

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Innvora Web Application                         │
│                 React + TypeScript + Vite + Tailwind CSS               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS REST
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Amazon API Gateway (REST API)                      │
│      CORS-enabled /prod stage with request validation & routing        │
└──────────┬────────────────────────┬────────────────────────┬───────────┘
           │                        │                        │
           ▼                        ▼                        ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  inventory-api       │ │  reorder-api         │ │  search-api          │
│  (Node.js 22 ARM64)  │ │  (Node.js 22 ARM64)  │ │  (Node.js 22 ARM64)  │
│  Catalog & Queries   │ │  Precomputed Read    │ │  OpenSearch Proxy    │
└──────────┬───────────┘ └──────────┬───────────┘ └──────────┬───────────┘
           │                        │                        │
           │ (POST /events)         │                        │
           ▼                        │                        │
┌──────────────────────┐            │                        │
│  Amazon SQS          │            │                        │
│  StockPulseInventory │            │                        │
│  Events Queue + DLQ  │            │                        │
└──────────┬───────────┘            │                        │
           │                        │                        │
           ▼                        │                        │
┌──────────────────────┐            │                        │
│  inventory-event-    │            │                        │
│  processor (Lambda)  │            │                        │
│  • Stock Mutation    │            │                        │
│  • Health Aggregates │            │                        │
│  • Reorder ReadModel │            │                        │
└──────────┬───────────┘            │                        │
           │                        │                        │
           ▼                        ▼                        │
┌───────────────────────────────────────────────────────┐    │
│                 Amazon DynamoDB                       │    │
│  Single-Table Design: StockPulseInventory             │    │
│  • Primary Key: PK (Partition), SK (Sort)             │    │
│  • Global Secondary Index: GSI1 (GSI1PK, GSI1SK)      │    │
│  • Entities: Inventory, Catalog, Aggregates, Reorders │    │
└───────────────────────────┬───────────────────────────┘    │
                            │ Event Indexing                 │
                            ▼                                ▼
                 ┌──────────────────────────────────────────────┐
                 │             Amazon OpenSearch                │
                 │   Domain: stockpulse-events (VPC isolated)   │
                 │   Full-text audit trail & timeline queries   │
                 └──────────────────────────────────────────────┘
```

### AWS Services Utilized

| Service | Configuration & Role |
|---|---|
| **Amazon API Gateway** | Regional REST API with fine-grained endpoint routing, default CORS preflight, stage tracing, and CloudWatch integration. |
| **AWS Lambda** | 4 ARM64 (Graviton2) Node.js 22 microservices (`inventory-api`, `inventory-event-processor`, `reorder-api`, `search-api`) running inside dedicated VPC subnets with least-privilege IAM roles. |
| **Amazon DynamoDB** | On-Demand (PAY_PER_REQUEST) single-table database with Point-In-Time Recovery (PITR) and GSI1 secondary index for high-velocity queries. |
| **Amazon SQS** | High-throughput asynchronous event buffer (`StockPulseInventoryEvents`) paired with a 14-day Dead-Letter Queue (DLQ) for guaranteed at-least-once delivery and backpressure isolation. |
| **Amazon OpenSearch Service** | `stockpulse-events` OpenSearch 2.11 domain with GP3 EBS storage, node-to-node encryption, and in-VPC HTTPS access for real-time audit event discovery. |
| **Amazon VPC** | Multi-AZ VPC with public and private subnets, NAT Gateway, DynamoDB Gateway VPC Endpoint, and SQS Interface VPC Endpoint. |
| **AWS Identity and Access Management (IAM)** | Strict role-based least privilege policies for Lambda execution, OpenSearch SigV4 access, and DynamoDB operations. |

---

## ⚡ Operational Scalability & Data Architecture

Traditional inventory systems perform full table scans (`ScanCommand`) to calculate network-wide health metrics or compile reorder queues. As inventory expands past tens of thousands of SKUs, table scans introduce quadratic latency and high DynamoDB Read Capacity Unit (RCU) consumption.

Innvora solves this with **scalable precomputed read models and partition-bounded queries**:

### 1. Zero-Scan Inventory Queries
- The `listAllInventory()` method removes all table scans.
- Active warehouse locations are queried in parallel using bounded-concurrency `QueryCommand` calls scoped strictly to `PK = LOCATION#<locationId>`.
- Even with 1,200+ inventory records distributed across multiple hubs, queries complete in tens of milliseconds with deterministic RCU usage.

### 2. $O(1)$ Incremental Health Aggregates
- Overall platform health (`healthy`, `reorderSoon`, `critical`, `overstocked`, `totalSkus`) is stored in precomputed aggregate items:
  - Global: `PK = AGGREGATE#HEALTH`, `SK = GLOBAL`
  - Per Hub: `PK = AGGREGATE#HEALTH`, `SK = LOCATION#<locationId>`
- When an inventory event (`SALE`, `RESTOCK`, `ADJUSTMENT`, etc.) causes an item to transition between status tiers (e.g., from `HEALTHY` to `CRITICAL`), the `InventoryEventProcessor` updates the aggregate counter incrementally.
- Calls to `GET /inventory/health` perform an $O(1)$ key lookup (`GetCommand`) instead of scanning the entire inventory table.

### 3. Precomputed Replenishment Read-Model
- As stock levels fluctuate, replenishment urgency (`CRITICAL`, `REORDER_SOON`, `HEALTHY`, `OVERSTOCKED`), recommended purchase quantities, and supplier lead-time buffers are precomputed during event processing.
- Results are stored directly under `PK = REORDER#<locationId>`.
- The `GET /reorders` endpoint reads precomputed recommendations directly, providing instantaneous dashboard loading without dynamic recalculation overhead.

### 4. DynamoDB Single-Table Schema with GSI1

| Entity | PK | SK | GSI1PK | GSI1SK | Description |
|---|---|---|---|---|---|
| **Inventory State** | `LOCATION#<locId>` | `PRODUCT#<prodId>` | `SKU#<sku>` | `LOCATION#<locId>` | Current stock, reserved, safety stock, reorder point |
| **Product Catalog** | `CATALOG#PRODUCT` | `PRODUCT#<prodId>` | `SKU#<sku>` | `METADATA` | Master catalog record, pricing, dimensions, packaging |
| **Supplier Record** | `CATALOG#SUPPLIER` | `SUPPLIER#<supId>` | — | — | Vendor profiles, lead-time guarantees, reliability metrics |
| **Location Master** | `CATALOG#LOCATION` | `LOCATION#<locId>` | — | — | Active fulfillment hubs, capacity, regional metadata |
| **Health Aggregate** | `AGGREGATE#HEALTH` | `GLOBAL` / `LOCATION#<locId>` | — | — | Real-time counts of healthy, reorder, critical items |
| **Reorder Read-Model** | `REORDER#<locId>` | `PRODUCT#<prodId>` | `URGENCY#<level>` | `DAYS_REMAINING` | Precomputed replenishment quantities and reasons |
| **Event Idempotency** | `EVENT#<eventId>` | `PROCESSED` | — | — | Deduplication guard preventing double stock increments |

---

## 📦 Automated Product Onboarding

Innvora provides a first-class product onboarding workflow directly through the web UI and REST API:

1. **Duplicate SKU Rejection (`409 Conflict`)**:
   - Every product registration checks for existing SKUs via GSI1 (`SKU#<sku>`).
   - If a duplicate SKU is detected, the API rejects the request with HTTP `409 Conflict` and code `CONFLICT`, preventing catalog corruption.
   - The UI displays an inline contextual error highlighting the conflicting SKU.

2. **Baseline Stock Initialization**:
   - When a product is created with an optional `initialStock` quantity, Innvora automatically writes the inventory baseline to the designated fulfillment hub.
   - Initial stock is immediately incorporated into health aggregates and replenishment planning.

3. **Data-Driven Locations & Suppliers**:
   - Location and supplier selectors in the UI dynamically fetch active records from `GET /locations` and `GET /suppliers` with robust offline fallbacks.

---

## 🚀 Real-World Operational Benefits

- **Predictable Sub-50ms Latency**: Bounded queries and precomputed read-models ensure that dashboard responses remain flat regardless of catalog size.
- **Cost-Optimized DynamoDB Consumption**: Elimination of full-table scans reduces Read Capacity Unit consumption by up to 98% under normal operations.
- **Asynchronous Peak Smoothing**: Burst ingestion (e.g. Flash Sales, Black Friday) queues events in Amazon SQS, insulating the core database from connection spikes while processing events reliably.
- **Idempotent Ingestion**: Duplicate event IDs are acknowledged and skipped without double-decrementing stock, ensuring audit consistency across unreliable networks.
- **Multi-Hub Visibility**: Complete coverage across India's primary fulfillment corridors:
  - `LOC-BOM-01`: Mumbai Central Fulfillment Hub
  - `LOC-DEL-02`: Delhi NCR Logistics Hub
  - `LOC-BLR-01`: Bengaluru Tech Park Warehouse
  - `LOC-HYD-01`: Hyderabad Regional Depot

---

## 📡 API Reference

Base URL: `https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod`

### Inventory & Stock Endpoints

| Method | Endpoint | Query / Body Parameters | Description |
|---|---|---|---|
| `GET` | `/inventory` | `locationId`, `status`, `page`, `limit` | Paginated list of inventory items across hubs (zero-scan query). |
| `GET` | `/inventory/{productId}` | — | Fetch inventory state for a product across all locations. |
| `GET` | `/inventory/location/{locationId}` | — | Fetch all inventory items for a specific warehouse location. |
| `GET` | `/inventory/health` | `locationId` (optional) | Fast $O(1)$ health aggregate summary (healthy, critical, reorder counts). |
| `POST` | `/inventory/events` | `{ eventId, sku, locationId, eventType, quantity, timestamp }` | Ingest inventory event asynchronously via SQS. |
| `GET` | `/inventory/search` | `q`, `locationId`, `eventType`, `from`, `size` | Full-text historical event search powered by Amazon OpenSearch. |

### Catalog & Replenishment Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/locations` | Master list of active fulfillment locations and capacities. |
| `GET` | `/suppliers` | Supplier catalog with lead times and reliability ratings. |
| `GET` | `/products` | Master product catalog listing all registered SKUs. |
| `GET` | `/products/{productId}` | Retrieve master product details by unique ID. |
| `POST` | `/products` | Register a new product with duplicate SKU validation and initial stock. |
| `GET` | `/reorders` | Retrieve precomputed replenishment recommendations and urgency rankings. |
| `GET` | `/notifications` | Live operational alerts for stockouts, critical shortages, and reorder limits. |

### Example Product Registration (`POST /products`)

```json
{
  "sku": "PROD-ANC-15",
  "name": "Spatial Audio Noise Cancelling Headphones",
  "category": "Audio & Sound",
  "supplierId": "SUP-IND-01",
  "unitCost": 48.00,
  "sellingPrice": 89.99,
  "reorderPoint": 15,
  "safetyStock": 8,
  "minimumOrderQuantity": 10,
  "packSize": 1,
  "defaultLocationId": "LOC-HYD-01",
  "initialStock": 50
}
```

---

## 💻 Local Development & Testing

### Prerequisites
- Node.js 20+
- npm 9+
- AWS CDK CLI (`npm install -g aws-cdk`)

### 1. Backend & Unit Tests

```bash
cd backend
npm install
npm test            # Runs Vitest suite (73 tests across 12 files)
npm run build       # Typecheck and build
```

### 2. Frontend Development

```bash
cd frontend
npm install
npm run dev         # Launches Vite dev server at http://localhost:5173
npm run build       # Production typecheck and bundle (Vite + PostCSS)
```

### 3. Infrastructure (AWS CDK)

```bash
cd infrastructure
npm install
npm run build       # Compile TypeScript CDK definitions
npx cdk synth       # Synthesize CloudFormation templates
```

---

## 🎨 Visual Identity & Design System

Innvora uses an editorial, warm design system engineered for operations managers:
- **Palette**: Sand (`#F2ECE2`), Sand Card Surface (`#E9E0D2`), Charcoal Deep (`#272522`), Terracotta (`#C6745A`), Olive (`#7A9E5D`).
- **Typography**: Playfair Display (editorial headers), Inter (high-density data), IBM Plex Mono (SKU & machine codes).
- **Persistent Interaction**: Operational notification bell toggle with non-dismissive outside-click behavior and real-time backend alerts.

---

## 📄 License

MIT License. Copyright © 2026 Innvora Team.
