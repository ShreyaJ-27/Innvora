# StockPulse Sample Data

This directory contains the canonical demo dataset for StockPulse, tailored for an Indian D2C and omnichannel consumer tech brand operating across regional fulfillment hubs.

---

## 1. Files & Schemas

### `products.json`
12 consumer tech and workspace essentials conforming to `productSchema`:
- **Identifiers**: `productId` (`PROD-XXX-NN`), unique `sku` (`SKU-XXX-NNN`)
- **Metadata**: `name`, `category` (Audio & Hearables, Power & Accessories, Office & Ergonomics, Computer Peripherals, Wearables & Health, Cables & Adapters)
- **Supplier Linkage**: `supplierId`, `supplierName`
- **Pricing**: `unitCost`, `sellingPrice` in INR (₹)
- **Inventory Thresholds**: `reorderPoint`, `safetyStock`, `minimumOrderQuantity` (MOQ), `packSize`

### `suppliers.json`
4 regional hardware & logistics partners conforming to `supplierSchema`:
- `SUP-IND-01`: Bharat Electronics Components Ltd (Bengaluru / Electronics) — Lead time: 5 days, Reliability: 96%
- `SUP-IND-02`: Zenith Power & Audio Solutions Mumbai (Mumbai / Power & Audio) — Lead time: 7 days, Reliability: 92%
- `SUP-IND-03`: Delta Cables & Ergonomics Pune (Pune / Stands & Cables) — Lead time: 4 days, Reliability: 98%
- `SUP-IND-04`: Apex Peripherals & Smart Devices Noida (Noida / Peripherals) — Lead time: 10 days, Reliability: 88%

### `locations.json`
3 fulfillment hubs conforming to `inventoryLocationSchema` (and matching frontend `LocationSelector` options):
- `LOC-BLR-01`: Bengaluru Tech Park Warehouse (South Region, Whitefield)
- `LOC-BOM-01`: Mumbai Central Fulfillment Hub (West Region, BKC)
- `LOC-DEL-02`: Delhi NCR Logistics Depot (North Region, Gurugram)

### `inventory-seed.json`
36 inventory state records (12 products × 3 locations) conforming to `inventoryStateSchema`.

---

## 2. Health Distribution Matrix

The inventory quantities are mathematically calibrated against each SKU's `reorderPoint` and `safetyStock`:

| Status | Formula Condition | Count | Description |
|---|---|---|---|
| **CRITICAL** | `available <= reorderPoint` | 9 | Below safe reorder threshold; immediate PO needed |
| **REORDER_SOON** | `reorderPoint < available <= reorderPoint + safetyStock` | 8 | Stock buffer dipping; initiate procurement soon |
| **HEALTHY** | `reorderPoint + safetyStock < available <= reorderPoint + 2*safetyStock` | 13 | Optimal working capital and demand buffer |
| **OVERSTOCKED** | `available > reorderPoint + 2*safetyStock` | 6 | Capital tied up; consider promotion or inter-hub transfer |
| **Total Records** | — | **36** | Balanced across all 3 hubs |

---

## 3. Relational Integrity

- Every `supplierId` in `products.json` exists in `suppliers.json`.
- Every `locationId` in `inventory-seed.json` exists in `locations.json`.
- Every `productId` and `sku` in `inventory-seed.json` exists in `products.json`.
- `availableQuantity = quantity - reservedQuantity` holds for every record.
