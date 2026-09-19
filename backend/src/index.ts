import { loadEnv } from './config/env.js';
import { logger } from './utils/logger.js';

const env = loadEnv();

logger.info('StockPulse backend initialized', {
  region: env.AWS_REGION,
  inventoryTable: env.INVENTORY_TABLE_NAME,
  opensearchIndex: env.OPENSEARCH_INDEX
});

export { env };
