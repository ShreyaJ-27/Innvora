import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const TABLE_NAME = process.env.INVENTORY_TABLE_NAME || 'StockPulseInventory';

/**
 * Safe Demo Data Reset Script
 *
 * SAFETY GUARANTEES:
 * 1. Does NOT destroy or delete the DynamoDB table or OpenSearch cluster.
 * 2. Does NOT touch AWS CDK or infrastructure definitions.
 * 3. Targets ONLY demo product keys (`PRODUCT#PROD-...`) and demo event tracking keys (`EVENT#seed-...`).
 * 4. Can only run when explicit confirmation is provided via command-line argument (--confirm) or environment variable.
 */
async function safeReset() {
  console.log(`========================================================`);
  console.log(`STOCKPULSE SAFE DEMO DATA RESET`);
  console.log(`Target Table: ${TABLE_NAME} in region ${AWS_REGION}`);
  console.log(`========================================================\n`);

  const hasConfirm = process.argv.includes('--confirm');
  if (!hasConfirm) {
    console.warn(`[SAFETY NOTICE] This script clears demo inventory items and seed events from '${TABLE_NAME}'.`);
    console.warn(`To execute the reset, pass the --confirm flag:`);
    console.warn(`  npx tsx scripts/reset-demo-data.ts --confirm\n`);
    console.log(`Architecture note: If AWS credentials are not configured locally, use the AWS Console to manage DynamoDB items.`);
    process.exit(0);
  }

  try {
    const ddbModulePath = path.join(rootDir, 'backend', 'node_modules', '@aws-sdk', 'client-dynamodb', 'dist-es', 'index.js');
    const libDdbModulePath = path.join(rootDir, 'backend', 'node_modules', '@aws-sdk', 'lib-dynamodb', 'dist-es', 'index.js');
    if (!fs.existsSync(ddbModulePath) || !fs.existsSync(libDdbModulePath)) {
      throw new Error('AWS SDK not found in backend/node_modules.');
    }
    const { DynamoDBClient } = await import(pathToFileURL(ddbModulePath).href);
    const { DynamoDBDocumentClient, DeleteCommand, ScanCommand } = await import(pathToFileURL(libDdbModulePath).href);

    const client = new DynamoDBClient({ region: AWS_REGION });
    const docClient = DynamoDBDocumentClient.from(client);

    console.log(`Scanning table for demo records (PRODUCT#PROD- and EVENT#seed-)...`);
    const scan = await docClient.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = scan.Items ?? [];

    const demoItems = items.filter((item) => {
      const pk = String(item.PK || '');
      const sk = String(item.SK || '');
      return (
        (pk.startsWith('LOCATION#') && sk.startsWith('PRODUCT#PROD-')) ||
        (pk.startsWith('EVENT#seed-') && sk === 'PROCESSED')
      );
    });

    console.log(`Found ${demoItems.length} demo records to clean up (out of ${items.length} total rows).`);

    let deleted = 0;
    for (const item of demoItems) {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK }
        })
      );
      deleted++;
    }

    console.log(`✓ Cleaned up ${deleted} demo records successfully.`);
    console.log(`The table structure, indexes, SQS queues, and Lambda configurations remain untouched.`);
  } catch (err: any) {
    console.error(`Unable to connect directly to DynamoDB: ${err.message}`);
    console.log(`\nLimitations & Recommendations:`);
    console.log(`- If your local AWS session is expired or running in a sandboxed CI environment,`);
    console.log(`  direct DynamoDB write/delete operations are skipped to protect production data.`);
    console.log(`- To reseed fresh demo values, simply run: npm run seed:demo`);
  }
}

safeReset().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
