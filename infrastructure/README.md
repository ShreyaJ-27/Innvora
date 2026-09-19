# StockPulse Infrastructure

AWS CDK infrastructure for the tested StockPulse backend in `ap-south-1`.

## Commands

```powershell
cd infrastructure
npm install
npm run build
npm run synth
npm run diff
npm run deploy
npm run destroy
```

`npm run deploy` and `npm run destroy` are explicit commands and are never run automatically. `cdk diff` and `cdk deploy` require AWS credentials and an account context, for example `aws configure` or `CDK_DEFAULT_ACCOUNT`.

## Resources

- Pay-per-request DynamoDB table `StockPulseInventory` with `PK` and `SK`, point-in-time recovery, and hackathon-friendly destroy removal policy.
- Encrypted SQS queue `StockPulseInventoryEvents` with `StockPulseInventoryEventsDLQ`, 180-second visibility timeout, and five receive attempts.
- Four Node.js 22 ARM64 Lambdas with explicit CloudWatch log groups and generated least-privilege roles.
- Regional API Gateway with CORS for inventory, search, reorder, and event ingestion routes.
- Single-node encrypted OpenSearch 2.11 domain in private VPC subnets. Lambda access is restricted by security groups and OpenSearch requests use SigV4.

The Lambda adapters compose the existing backend handlers and services; backend business logic is not duplicated or rewritten.
