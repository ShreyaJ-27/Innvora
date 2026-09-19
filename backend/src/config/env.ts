import { config as loadDotEnv } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  AWS_REGION: z.string().min(1),
  INVENTORY_TABLE_NAME: z.string().min(1),
  INVENTORY_EVENTS_QUEUE_URL: z.string().min(1),
  OPENSEARCH_ENDPOINT: z.string().url(),
  OPENSEARCH_INDEX: z.string().min(1)
});

type EnvInput = Partial<Record<keyof z.infer<typeof envSchema>, string | undefined>>;

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(input: EnvInput = process.env): AppEnv {
  const resolved = {
    AWS_REGION: input.AWS_REGION ?? process.env.AWS_REGION,
    INVENTORY_TABLE_NAME: input.INVENTORY_TABLE_NAME ?? process.env.INVENTORY_TABLE_NAME,
    INVENTORY_EVENTS_QUEUE_URL:
      input.INVENTORY_EVENTS_QUEUE_URL ?? process.env.INVENTORY_EVENTS_QUEUE_URL,
    OPENSEARCH_ENDPOINT: input.OPENSEARCH_ENDPOINT ?? process.env.OPENSEARCH_ENDPOINT,
    OPENSEARCH_INDEX: input.OPENSEARCH_INDEX ?? process.env.OPENSEARCH_INDEX
  };

  const parsed = envSchema.safeParse(resolved);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return parsed.data;
}

export function loadEnv(): AppEnv {
  loadDotEnv();
  return getEnv();
}
