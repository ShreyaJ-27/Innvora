# StockPulse Demo Data Reference

This document provides a comprehensive catalogue of the demo dataset created for StockPulse.

---

## 1. Overview

- **Business Domain**: D2C & Omnichannel Consumer Electronics & Workspace Accessories
- **Geography**: India (Bengaluru, Mumbai, Delhi NCR)
- **Currency**: INR (₹)
- **SKUs**: 12 unique products
- **Locations**: 3 fulfillment hubs
- **Suppliers**: 4 vetted hardware & accessories suppliers
- **Inventory States**: 36 total location-item pairs
- **Health State Target Mix**:
  - 13 Healthy (36%)
  - 8 Reorder Soon (22%)
  - 9 Critical (25%)
  - 6 Overstocked (17%)

---

## 2. Product Catalogue (`sample-data/products.json`)

| SKU | Product Name | Category | Supplier | Unit Cost | Sell Price | Reorder Point | Safety Stock | MOQ | Pack Size |
|---|---|---|---|---|---|---|---|---|---|
| `SKU-EAR-001` | Wireless Earbuds with ANC | Audio & Hearables | Bharat Electronics | ₹1,499 | ₹3,499 | 35 | 15 | 50 | 10 |
| `SKU-CHG-002` | 65W GaN USB-C Fast Charger | Power & Accessories | Zenith Power | ₹699 | ₹1,799 | 40 | 20 | 100 | 20 |
| `SKU-PWR-003` | 20000mAh Power Bank | Power & Accessories | Zenith Power | ₹1,099 | ₹2,499 | 30 | 15 | 40 | 10 |
| `SKU-SPK-004` | Rugged Bluetooth Speaker | Audio & Hearables | Zenith Power | ₹1,199 | ₹2,999 | 25 | 10 | 30 | 5 |
| `SKU-STN-005` | Ergonomic Laptop Stand | Office & Ergonomics | Delta Cables | ₹649 | ₹1,599 | 20 | 10 | 25 | 5 |
| `SKU-KBD-006` | RGB Mechanical Keyboard | Computer Peripherals | Apex Devices | ₹1,899 | ₹4,299 | 25 | 10 | 20 | 5 |
| `SKU-MOU-007` | Wireless Optical Mouse | Computer Peripherals | Apex Devices | ₹499 | ₹1,299 | 50 | 25 | 60 | 15 |
| `SKU-WTC-008` | AMOLED Smart Watch | Wearables & Health | Bharat Electronics | ₹1,999 | ₹4,999 | 25 | 10 | 30 | 10 |
| `SKU-CAM-009` | 1080p HD Streaming Webcam | Computer Peripherals | Apex Devices | ₹999 | ₹2,299 | 20 | 10 | 25 | 5 |
| `SKU-LMP-010` | Smart ScreenBar Desk Lamp | Office & Ergonomics | Delta Cables | ₹1,199 | ₹2,799 | 20 | 10 | 20 | 5 |
| `SKU-HLD-011` | Desktop Phone Holder | Accessories | Delta Cables | ₹299 | ₹799 | 40 | 20 | 50 | 10 |
| `SKU-CAB-012` | 8K HDMI 2.1 Cable (2m) | Cables & Adapters | Delta Cables | ₹199 | ₹599 | 60 | 30 | 100 | 25 |

---

## 3. Fulfillment Hubs (`sample-data/locations.json`)

1. **`LOC-BLR-01` — Bengaluru Tech Park Warehouse**
   - Region: South (Karnataka)
   - Address: Plot 14, EPIP Zone, Whitefield, Bengaluru 560066
   - Focus: High-velocity hearables, wearables, and laptop peripherals.

2. **`LOC-BOM-01` — Mumbai Central Fulfillment Hub**
   - Region: West (Maharashtra)
   - Address: G Block, Bandra Kurla Complex, Mumbai 400051
   - Focus: Fast chargers, high-capacity power banks, premium desktop gear.

3. **`LOC-DEL-02` — Delhi NCR Logistics Depot**
   - Region: North (Haryana)
   - Address: Sector 18, Udyog Vihar Phase IV, Gurugram 122016
   - Focus: Cables, monitor lamps, bulk peripherals.

---

## 4. Suppliers (`sample-data/suppliers.json`)

1. **`SUP-IND-01` — Bharat Electronics Components Ltd**
   - Lead Time: 5 days | Reliability: 96%
2. **`SUP-IND-02` — Zenith Power & Audio Solutions Mumbai**
   - Lead Time: 7 days | Reliability: 92%
3. **`SUP-IND-03` — Delta Cables & Ergonomics Pune**
   - Lead Time: 4 days | Reliability: 98%
4. **`SUP-IND-04` — Apex Peripherals & Smart Devices Noida**
   - Lead Time: 10 days | Reliability: 88%

---

## 5. Health Status Calibration

Each SKU's health status is evaluated automatically by the StockPulse backend rules:

$$\text{Available Stock} = \text{Total Quantity} - \text{Reserved Quantity}$$

- **`CRITICAL`** ($\text{Available} \le \text{Reorder Point}$):
  Immediate stockout hazard. Triggers urgent reorder recommendation.
- **`REORDER_SOON`** ($\text{Reorder Point} < \text{Available} \le \text{Reorder Point} + \text{Safety Stock}$):
  Replenishment buffer is dipping.
- **`HEALTHY`** ($\text{Reorder Point} + \text{Safety Stock} < \text{Available} \le \text{Reorder Point} + 2 \times \text{Safety Stock}$):
  Optimal operational level.
- **`OVERSTOCKED`** ($\text{Available} > \text{Reorder Point} + 2 \times \text{Safety Stock}$):
  Excess capital locked.
