# StockPulse Live Demo Flow & Scenarios

This document guides presenters and evaluators through demonstrating the StockPulse platform end-to-end.

---

## 1. Architecture Demonstration

StockPulse is built on an event-driven serverless architecture:

```
[ Client / Webhook / Seeder ]
              │  POST /inventory/events
              ▼
      [ API Gateway ]
              │
              ▼
   [ inventory-api Lambda ]
              │
              ▼
        [ AWS SQS ]
              │
              ▼
[ inventory-event-processor Lambda ]
              │
      ┌───────┴────────┐
      ▼                ▼
[ DynamoDB ]     [ OpenSearch ]
(Current State)  (Event Search)
```

---

## 2. Step-by-Step Demo Walkthrough

### Scenario A: Empty State to Seeded Platform
1. **Show Initial Zero State**:
   Open the StockPulse frontend dashboard. Notice that all metrics, health charts, and reorder tables show empty/zero state.
2. **Execute Seeding**:
   Run from terminal:
   ```bash
   npm run seed:demo
   ```
3. **Observe the Event Pipeline**:
   The script posts initial `RESTOCK` events through API Gateway to SQS, followed by live store sales and adjustments.
4. **Refresh Dashboard**:
   The dashboard updates with 12 distinct SKUs, 36 inventory state cards, and active health distribution across hubs.

---

### Scenario B: Regional Hub Visibility
1. Open the **Location Selector** in the dashboard header.
2. Select **"Bengaluru Tech Park Warehouse (Bengaluru)"**:
   - Notice metrics filter specifically to South region inventory.
   - Observe critical status on ANC Earbuds and AMOLED Watch.
3. Switch to **"Mumbai Central Fulfillment (Mumbai)"**:
   - Observe overstocked GaN Chargers and Desktop Phone Stands.
   - Review how available quantities and reserved stocks differ by hub.

---

### Scenario C: Smart Reorders Engine
1. Navigate to the **Reorders** tab (`/reorders`).
2. Point out explainable recommendations:
   - Current stock vs. average daily demand.
   - Supplier lead time impact (e.g., Apex Devices takes 10 days vs. Delta Cables taking 4 days).
   - Minimum order quantity (MOQ) and pack-size rounding automatically enforced.

---

### Scenario D: Historical Event Search with OpenSearch
1. Navigate to **Search** (`/search`).
2. Search for:
   - Query: `"Wireless"` or `"Earbuds"`
   - Filter by Event Type: `"SALE"` or `"RESTOCK"`
3. Confirm that matching events are retrieved directly from OpenSearch index with microsecond latency.

---

### Scenario E: Live Event Simulation (Demo Tools)
1. Open the **Event Simulator Modal** in the frontend (or run `npx tsx scripts/seed-demo-data.ts`).
2. Dispatch a `SALE` event of 5 units for `SKU-EAR-001` at `LOC-BLR-01`.
3. Confirm SQS queues the message, DynamoDB decrements available stock, and OpenSearch indexes the event.
