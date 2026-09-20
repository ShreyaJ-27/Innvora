# StockPulse Demo & Operational Scripts

This directory contains utility scripts for seeding, verifying, and safely resetting StockPulse demo data against the deployed AWS backend.

---

## Available Scripts

### 1. `seed-demo-data.ts`
The primary seeding pipeline that populates the live platform.

**Execution Command:**
```bash
npm run seed:demo
```
or directly with tsx:
```bash
npx tsx scripts/seed-demo-data.ts
```

**What it does:**
1. Loads canonical entities from `sample-data/` (`products.json`, `locations.json`, `suppliers.json`, `inventory-seed.json`).
2. Dispatches initial stock `RESTOCK` events via `POST /inventory/events` using deterministic, idempotent IDs (`seed-init-${locationId}-${productId}`).
3. Dispatches realistic operational stock movement events (`SALE`, `ADJUSTMENT`, `TRANSFER_IN`, `RESTOCK`) simulating live store operations.
4. Asynchronously polls `GET /inventory` and `GET /inventory/health` until events are consumed by the SQS → Lambda processor pipeline.
5. Performs automated live verification against all four deployed endpoints (`/inventory`, `/inventory/health`, `/reorders`, `/inventory/search`).

---

### 2. `reset-demo-data.ts`
Safely resets seeded demo records without modifying AWS infrastructure.

**Execution Command:**
```bash
npx tsx scripts/reset-demo-data.ts --confirm
```

**Safety Features:**
- Never destroys tables, queues, or OpenSearch indexes.
- Scoped strictly to `PRODUCT#PROD-` and `EVENT#seed-` partition keys.
- Requires explicit `--confirm` flag to prevent accidental execution.

---

## Configuration

Default API endpoints point to the live AWS deployment:
`https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod`

To customize, copy `.env.example` to `.env`:
```bash
cp scripts/.env.example scripts/.env
```
And adjust `STOCKPULSE_API_BASE_URL`.
