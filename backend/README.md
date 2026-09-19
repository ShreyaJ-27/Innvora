# StockPulse Backend

This directory contains the backend foundation for the StockPulse hackathon project.

## Included foundation

- Strict TypeScript configuration
- ESM-based Node.js project setup
- ESLint and Vitest configuration
- Zod runtime validation
- AWS SDK v3 dependencies
- Environment loading with AWS credential chain support
- Structured logging utilities
- App-level error handling
- API Gateway HTTP response helpers

## Environment variables

See `.env.example` for the required values.

Do not add AWS access keys to `.env` files. Local development uses the AWS CLI credential chain and Lambda uses IAM roles.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run test:watch`
- `npm run lint`
- `npm run typecheck`
