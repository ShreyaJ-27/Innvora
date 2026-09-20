import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Load environment configuration
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length > 0 && !process.env[k.trim()]) {
        process.env[k.trim()] = v.join('=').trim();
      }
    }
  }
}

const API_BASE_URL = (
  process.env.STOCKPULSE_API_BASE_URL ||
  'https://1d1j9fcft5.execute-api.ap-south-1.amazonaws.com/prod'
).replace(/\/+$/, '');

const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.INVENTORY_TABLE_NAME || 'StockPulseInventory';

interface Product {
  productId: string;
  sku: string;
  name: string;
  category: string;
  supplierId: string;
  supplierName: string;
  unitCost: number;
  sellingPrice: number;
  reorderPoint: number;
  safetyStock: number;
  minimumOrderQuantity: number;
  packSize: number;
}

interface InventoryLocation {
  locationId: string;
  locationName: string;
  region: string;
  address: string;
}

interface Supplier {
  supplierId: string;
  name: string;
  leadTimeDays: number;
  reliabilityScore: number;
}

interface InventorySeedRecord {
  productId: string;
  sku: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderPoint: number;
  safetyStock: number;
  lastUpdated: string;
}

interface InventoryEventPayload {
  eventId: string;
  productId: string;
  sku: string;
  locationId: string;
  eventType: 'SALE' | 'RESTOCK' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'RETURN';
  quantityChange: number;
  timestamp: string;
  source: string;
}

// Read sample-data files
function loadSampleData() {
  const products: Product[] = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'sample-data', 'products.json'), 'utf8')
  );
  const locations: InventoryLocation[] = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'sample-data', 'locations.json'), 'utf8')
  );
  const suppliers: Supplier[] = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'sample-data', 'suppliers.json'), 'utf8')
  );
  const inventorySeed: InventorySeedRecord[] = JSON.parse(
    fs.readFileSync(path.join(rootDir, 'sample-data', 'inventory-seed.json'), 'utf8')
  );
  return { products, locations, suppliers, inventorySeed };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// POST /inventory/events
async function postInventoryEvent(payload: InventoryEventPayload): Promise<{
  success: boolean;
  statusCode: number;
  eventId?: string;
  message?: string;
  error?: string;
}> {
  const url = `${API_BASE_URL}/inventory/events`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok || response.status === 202) {
      return {
        success: true,
        statusCode: response.status,
        eventId: data.eventId || payload.eventId,
        message: data.message
      };
    }
    return {
      success: false,
      statusCode: response.status,
      error: data.message || JSON.stringify(data)
    };
  } catch (err) {
    return {
      success: false,
      statusCode: 0,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

// Try direct DynamoDB baseline initialization if AWS credentials exist
async function tryDirectDynamoDbBootstrap(inventorySeed: InventorySeedRecord[]): Promise<boolean> {
  try {
    const { createRequire } = await import('node:module');
    const req = createRequire(path.join(rootDir, 'backend', 'package.json'));
    const { DynamoDBClient } = req('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, PutCommand, GetCommand } = req('@aws-sdk/lib-dynamodb');

    const client = new DynamoDBClient({ region: AWS_REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    // Test connectivity
    const first = inventorySeed[0];
    const testResult = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `LOCATION#${first.locationId}`,
          SK: `PRODUCT#${first.productId}`
        }
      })
    );

    console.log('   [AWS CLI / SDK] DynamoDB access verified.');
    let inserted = 0;
    for (const item of inventorySeed) {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `LOCATION#${item.locationId}`,
            SK: `PRODUCT#${item.productId}`,
            productId: item.productId,
            sku: item.sku,
            locationId: item.locationId,
            quantity: item.quantity,
            reservedQuantity: item.reservedQuantity,
            availableQuantity: item.availableQuantity,
            reorderPoint: item.reorderPoint,
            safetyStock: item.safetyStock,
            lastUpdated: item.lastUpdated
          }
        })
      );
      inserted++;
    }
    console.log(`   [AWS CLI / SDK] Bootstrapped ${inserted} base inventory records into DynamoDB.`);
    return true;
  } catch (err) {
    // Expected when running without direct AWS CLI credentials
    return false;
  }
}

// Polling with bounded exponential backoff
async function pollUntilPopulated(maxAttempts = 30, intervalMs = 2000): Promise<{
  success: boolean;
  totalSkus: number;
  totalItems: number;
  healthData?: any;
}> {
  console.log(`\n⏳ Polling live API for asynchronous SQS → Lambda → DynamoDB processing...`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const [healthRes, invRes] = await Promise.all([
        fetch(`${API_BASE_URL}/inventory/health`).then((r) => r.json()).catch(() => null),
        fetch(`${API_BASE_URL}/inventory?limit=50`).then((r) => r.json()).catch(() => null)
      ]);

      const totalSkus = healthRes?.data?.totalSkus ?? 0;
      const totalItems = invRes?.data?.total ?? invRes?.data?.items?.length ?? 0;

      process.stdout.write(`   [Attempt ${attempt}/${maxAttempts}] totalSkus: ${totalSkus}, totalItems: ${totalItems}\r`);

      if (totalSkus > 0 || totalItems > 0) {
        console.log(`\n   ✓ Asynchronous pipeline confirmed! Received ${totalSkus} SKUs (${totalItems} records).`);
        return { success: true, totalSkus, totalItems, healthData: healthRes?.data };
      }
    } catch {
      // Retry on network jitter
    }

    await sleep(intervalMs);
  }

  console.log(`\n   ⚠️ Polling reached timeout (${(maxAttempts * intervalMs) / 1000}s).`);
  return { success: false, totalSkus: 0, totalItems: 0 };
}

// Automated verification of live API endpoints
async function verifyLiveApi(): Promise<{
  inventory: { status: number; count: number };
  health: { status: number; totalSkus: number; healthy: number; reorderSoon: number; critical: number; overstocked: number };
  reorders: { status: number; recommendationCount: number };
  search: { status: number; resultCount: number };
}> {
  console.log(`\n========================================================`);
  console.log(`PHASE 11 & 12 — LIVE AWS API VERIFICATION`);
  console.log(`========================================================`);

  // 1. GET /inventory
  let invStatus = 0;
  let invCount = 0;
  try {
    const res = await fetch(`${API_BASE_URL}/inventory?limit=50`);
    invStatus = res.status;
    const json = await res.json();
    invCount = json?.data?.total ?? json?.data?.items?.length ?? 0;
    console.log(`1. GET /inventory          → HTTP ${invStatus} | Items: ${invCount}`);
  } catch (e) {
    console.error(`1. GET /inventory          → FAILED: ${e}`);
  }

  // 2. GET /inventory/health
  let healthStatus = 0;
  let health = { totalSkus: 0, healthy: 0, reorderSoon: 0, critical: 0, overstocked: 0 };
  try {
    const res = await fetch(`${API_BASE_URL}/inventory/health`);
    healthStatus = res.status;
    const json = await res.json();
    if (json?.data) {
      health = {
        totalSkus: json.data.totalSkus ?? 0,
        healthy: json.data.healthy ?? 0,
        reorderSoon: json.data.reorderSoon ?? 0,
        critical: json.data.critical ?? 0,
        overstocked: json.data.overstocked ?? 0
      };
    }
    console.log(
      `2. GET /inventory/health   → HTTP ${healthStatus} | SKUs: ${health.totalSkus} ` +
      `(Healthy: ${health.healthy}, ReorderSoon: ${health.reorderSoon}, Critical: ${health.critical}, Overstocked: ${health.overstocked})`
    );
  } catch (e) {
    console.error(`2. GET /inventory/health   → FAILED: ${e}`);
  }

  // 3. GET /reorders
  let reorderStatus = 0;
  let recCount = 0;
  try {
    const res = await fetch(`${API_BASE_URL}/reorders?limit=50`);
    reorderStatus = res.status;
    const json = await res.json();
    recCount = json?.data?.recommendations?.length ?? 0;
    console.log(`3. GET /reorders           → HTTP ${reorderStatus} | Recommendations: ${recCount}`);
  } catch (e) {
    console.error(`3. GET /reorders           → FAILED: ${e}`);
  }

  // 4. GET /inventory/search (OpenSearch)
  let searchStatus = 0;
  let searchResults = 0;
  try {
    const searchUrl = `${API_BASE_URL}/inventory/search?q=Wireless`;
    const res = await fetch(searchUrl);
    searchStatus = res.status;
    const json = await res.json();
    searchResults = json?.data?.results?.length ?? json?.data?.pagination?.total ?? 0;
    console.log(`4. GET /inventory/search   → HTTP ${searchStatus} | Matches for 'Wireless': ${searchResults}`);
  } catch (e) {
    console.error(`4. GET /inventory/search   → FAILED: ${e}`);
  }

  return {
    inventory: { status: invStatus, count: invCount },
    health: { status: healthStatus, ...health },
    reorders: { status: reorderStatus, recommendationCount: recCount },
    search: { status: searchStatus, resultCount: searchResults }
  };
}

async function main() {
  console.log(`========================================================`);
  console.log(`STOCKPULSE DEMO DATA SEEDER`);
  console.log(`Target API: ${API_BASE_URL}`);
  console.log(`Time:       ${new Date().toISOString()}`);
  console.log(`========================================================\n`);

  const { products, locations, suppliers, inventorySeed } = loadSampleData();

  console.log(`Loaded dataset from sample-data/:`);
  console.log(`  • Products:  ${products.length}`);
  console.log(`  • Locations: ${locations.length}`);
  console.log(`  • Suppliers: ${suppliers.length}`);
  console.log(`  • Records:   ${inventorySeed.length} inventory states across hubs\n`);

  // Optional direct bootstrap if AWS credentials are active in local environment
  console.log(`Checking direct AWS DynamoDB access for table '${TABLE_NAME}'...`);
  const ddbSuccess = await tryDirectDynamoDbBootstrap(inventorySeed);
  if (!ddbSuccess) {
    console.log('   (Direct DynamoDB write skipped — proceeding via API Gateway /inventory/events)\n');
  }

  // ========================================================
  // PHASE 5 — INITIAL STOCK EVENTS (RESTOCK)
  // ========================================================
  console.log(`[Phase 5] Submitting initial stock RESTOCK events via POST /inventory/events...`);
  let initAttempted = 0;
  let initAccepted = 0;
  let initErrors = 0;

  for (const record of inventorySeed) {
    initAttempted++;
    const eventPayload: InventoryEventPayload = {
      eventId: `seed-init-${record.locationId}-${record.productId}`,
      productId: record.productId,
      sku: record.sku,
      locationId: record.locationId,
      eventType: 'RESTOCK',
      quantityChange: record.quantity,
      timestamp: record.lastUpdated,
      source: 'StockPulse Demo Initializer'
    };

    const res = await postInventoryEvent(eventPayload);
    if (res.success) {
      initAccepted++;
    } else {
      initErrors++;
      console.error(`   ✗ Failed to dispatch ${eventPayload.eventId}: HTTP ${res.statusCode} ${res.error}`);
    }

    // Rate-limit slightly so API Gateway / SQS isn't overwhelmed
    await sleep(60);
  }

  console.log(`   Initial stock events dispatched: ${initAccepted}/${initAttempted} accepted (${initErrors} errors).\n`);

  // ========================================================
  // PHASE 7 — REAL STOCK MOVEMENT EVENTS
  // ========================================================
  console.log(`[Phase 7] Submitting realistic stock movement events (Sales, Adjustments, Transfers)...`);

  const movementEvents: InventoryEventPayload[] = [
    {
      eventId: 'seed-mov-sale-01',
      productId: 'PROD-EAR-01',
      sku: 'SKU-EAR-001',
      locationId: 'LOC-BLR-01',
      eventType: 'SALE',
      quantityChange: -3,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      source: 'Shopify POS Webhook'
    },
    {
      eventId: 'seed-mov-sale-02',
      productId: 'PROD-CHG-02',
      sku: 'SKU-CHG-002',
      locationId: 'LOC-DEL-02',
      eventType: 'SALE',
      quantityChange: -5,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      source: 'Amazon India Order Gateway'
    },
    {
      eventId: 'seed-mov-sale-03',
      productId: 'PROD-PWR-03',
      sku: 'SKU-PWR-003',
      locationId: 'LOC-BOM-01',
      eventType: 'SALE',
      quantityChange: -2,
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      source: 'Flipkart Direct Integration'
    },
    {
      eventId: 'seed-mov-sale-04',
      productId: 'PROD-WTC-08',
      sku: 'SKU-WTC-008',
      locationId: 'LOC-DEL-02',
      eventType: 'SALE',
      quantityChange: -4,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      source: 'D2C Website Checkout'
    },
    {
      eventId: 'seed-mov-adj-01',
      productId: 'PROD-CAB-12',
      sku: 'SKU-CAB-012',
      locationId: 'LOC-BOM-01',
      eventType: 'ADJUSTMENT',
      quantityChange: -5,
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      source: 'Warehouse Scanner Audit'
    },
    {
      eventId: 'seed-mov-transfer-01',
      productId: 'PROD-KBD-06',
      sku: 'SKU-KBD-006',
      locationId: 'LOC-BLR-01',
      eventType: 'TRANSFER_IN',
      quantityChange: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      source: 'Inter-Hub Transfer Service'
    },
    {
      eventId: 'seed-mov-restock-01',
      productId: 'PROD-STN-05',
      sku: 'SKU-STN-005',
      locationId: 'LOC-DEL-02',
      eventType: 'RESTOCK',
      quantityChange: 10,
      timestamp: new Date().toISOString(),
      source: 'Supplier Shipment Receipt'
    },
    {
      eventId: 'seed-mov-hyd-sale-01',
      productId: 'PROD-CHG-02',
      sku: 'SKU-CHG-002',
      locationId: 'LOC-HYD-01',
      eventType: 'SALE',
      quantityChange: -3,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      source: 'Hyderabad Quick Commerce Webhook'
    },
    {
      eventId: 'seed-mov-hyd-restock-01',
      productId: 'PROD-STN-05',
      sku: 'SKU-STN-005',
      locationId: 'LOC-HYD-01',
      eventType: 'RESTOCK',
      quantityChange: 15,
      timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      source: 'Supplier Freight Inbound'
    },
    {
      eventId: 'seed-mov-hyd-adj-01',
      productId: 'PROD-SPK-04',
      sku: 'SKU-SPK-004',
      locationId: 'LOC-HYD-01',
      eventType: 'ADJUSTMENT',
      quantityChange: -2,
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      source: 'Hyderabad Depot Cycle Count'
    },
    {
      eventId: 'seed-mov-hyd-tr-in-01',
      productId: 'PROD-PWR-03',
      sku: 'SKU-PWR-003',
      locationId: 'LOC-HYD-01',
      eventType: 'TRANSFER_IN',
      quantityChange: 10,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      source: 'Inter-Hub Receipt from Mumbai'
    },
    {
      eventId: 'seed-mov-hyd-tr-out-01',
      productId: 'PROD-KBD-06',
      sku: 'SKU-KBD-006',
      locationId: 'LOC-HYD-01',
      eventType: 'TRANSFER_OUT',
      quantityChange: -5,
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      source: 'Inter-Hub Dispatch to Bengaluru'
    },
    {
      eventId: 'seed-mov-hyd-ret-01',
      productId: 'PROD-EAR-01',
      sku: 'SKU-EAR-001',
      locationId: 'LOC-HYD-01',
      eventType: 'RETURN',
      quantityChange: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      source: 'Customer RMA Return Desk'
    }
  ];

  let movAccepted = 0;
  for (const mov of movementEvents) {
    const res = await postInventoryEvent(mov);
    if (res.success) movAccepted++;
    await sleep(60);
  }
  console.log(`   Movement events dispatched: ${movAccepted}/${movementEvents.length} accepted.\n`);

  // ========================================================
  // PHASE 10 — WAIT FOR ASYNCHRONOUS PROCESSING
  // ========================================================
  const pollResult = await pollUntilPopulated(30, 2000);

  // ========================================================
  // PHASE 11 & 12 — VERIFY LIVE AWS DATA
  // ========================================================
  const verification = await verifyLiveApi();

  console.log(`\n========================================================`);
  console.log(`SEEDING SUMMARY`);
  console.log(`========================================================`);
  console.log(`• Events Attempted: ${initAttempted + movementEvents.length}`);
  console.log(`• Events Accepted:  ${initAccepted + movAccepted}`);
  console.log(`• Total SKUs:       ${verification.health.totalSkus}`);
  console.log(`• Total Records:    ${verification.inventory.count}`);
  console.log(`• Recommendations:  ${verification.reorders.recommendationCount}`);
  console.log(`• OpenSearch Items: ${verification.search.resultCount}`);
  console.log(`========================================================\n`);

  if (verification.inventory.count > 0 || verification.health.totalSkus > 0) {
    console.log(`🎉 SUCCESS: StockPulse live database is now populated!`);
    process.exit(0);
  } else {
    console.log(`⚠️ Data ingestion submitted. If counts are still 0, check Lambda processor execution.`);
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal error during demo seeding:', err);
  process.exit(1);
});
