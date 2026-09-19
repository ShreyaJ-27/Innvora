import * as path from 'node:path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export class StockPulseStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'StockPulseVpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'Public', subnetType: ec2.SubnetType.PUBLIC },
        { name: 'Private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }
      ]
    });
    vpc.addGatewayEndpoint('DynamoDbEndpoint', { service: ec2.GatewayVpcEndpointAwsService.DYNAMODB });
    vpc.addInterfaceEndpoint('SqsEndpoint', { service: ec2.InterfaceVpcEndpointAwsService.SQS });

    const inventoryTable = new dynamodb.Table(this, 'StockPulseInventory', {
      tableName: 'StockPulseInventory',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const deadLetterQueue = new sqs.Queue(this, 'StockPulseInventoryEventsDLQ', {
      queueName: 'StockPulseInventoryEventsDLQ',
      retentionPeriod: cdk.Duration.days(14),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    const inventoryEventsQueue = new sqs.Queue(this, 'StockPulseInventoryEvents', {
      queueName: 'StockPulseInventoryEvents',
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(4),
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      deadLetterQueue: { queue: deadLetterQueue, maxReceiveCount: 5 },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'StockPulseLambdaSecurityGroup', {
      vpc,
      description: 'Egress-only security group for StockPulse Lambdas',
      allowAllOutbound: true
    });
    const openSearchSecurityGroup = new ec2.SecurityGroup(this, 'StockPulseOpenSearchSecurityGroup', {
      vpc,
      description: 'Allows HTTPS only from StockPulse Lambdas',
      allowAllOutbound: true
    });
    openSearchSecurityGroup.addIngressRule(lambdaSecurityGroup, ec2.Port.tcp(443), 'Lambda access to OpenSearch');

    const domain = new opensearch.Domain(this, 'StockPulseOpenSearch', {
      domainName: 'stockpulse-events',
      version: opensearch.EngineVersion.OPENSEARCH_2_11,
      capacity: { dataNodes: 1, dataNodeInstanceType: 't3.small.search' },
      ebs: { volumeSize: 10, volumeType: ec2.EbsDeviceVolumeType.GP3 },
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      securityGroups: [openSearchSecurityGroup],
      zoneAwareness: { enabled: false },
      nodeToNodeEncryption: true,
      encryptionAtRest: { enabled: true },
      enforceHttps: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      logging: {
        appLogEnabled: true,
        slowSearchLogEnabled: true,
        slowIndexLogEnabled: true
      }
    });

    const lambdaCodePath = path.join(__dirname, '..', 'lambda');
    const commonEnvironment = {
      INVENTORY_TABLE_NAME: inventoryTable.tableName,
      INVENTORY_EVENTS_QUEUE_URL: inventoryEventsQueue.queueUrl,
      OPENSEARCH_ENDPOINT: `https://${domain.domainEndpoint}`,
      OPENSEARCH_INDEX: 'inventory-events',
      DEFAULT_AVERAGE_DAILY_DEMAND: '1',
      DEFAULT_FORECAST_BUFFER: '0',
      DEFAULT_LEAD_TIME_DAYS: '7',
      DEFAULT_MINIMUM_ORDER_QUANTITY: '1',
      DEFAULT_PACK_SIZE: '1'
    };

    const createFunction = (id: string, entry: string, description: string): NodejsFunction => {
      const fn = new NodejsFunction(this, id, {
        functionName: id,
        description,
        entry: path.join(lambdaCodePath, entry),
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64,
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        tracing: lambda.Tracing.PASS_THROUGH,
        vpc,
        securityGroups: [lambdaSecurityGroup],
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        environment: commonEnvironment,
        logGroup: new logs.LogGroup(this, `${id}LogGroup`, {
          logGroupName: `/aws/lambda/${id}`,
          retention: logs.RetentionDays.ONE_WEEK,
          removalPolicy: cdk.RemovalPolicy.DESTROY
        }),
        bundling: { minify: true, sourceMap: true, target: 'es2022' }
      });
      return fn;
    };

    const inventoryApi = createFunction('inventory-api', 'inventory-api.ts', 'StockPulse inventory and event ingestion API');
    const processor = createFunction('inventory-event-processor', 'inventory-event-processor.ts', 'Processes inventory events from SQS');
    const searchApi = createFunction('search-api', 'search-api.ts', 'Searches historical inventory events');
    const reorderApi = createFunction('reorder-api', 'reorder-api.ts', 'Generates smart reorder recommendations');

    inventoryTable.grantReadWriteData(inventoryApi);
    inventoryTable.grantReadWriteData(processor);
    inventoryTable.grantReadData(searchApi);
    inventoryTable.grantReadData(reorderApi);
    inventoryEventsQueue.grantSendMessages(inventoryApi);
    domain.grantReadWrite(processor);
    domain.grantRead(searchApi);

    processor.addEventSource(new SqsEventSource(inventoryEventsQueue, {
      batchSize: 10,
      reportBatchItemFailures: false,
      maxConcurrency: 2
    }));

    const api = new apigateway.RestApi(this, 'StockPulseApi', {
      restApiName: 'StockPulse API',
      description: 'StockPulse inventory, search, and reorder API',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: CorsAllowOrigins,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key']
      },
      deployOptions: { stageName: 'prod', tracingEnabled: true, loggingLevel: apigateway.MethodLoggingLevel.ERROR }
    });

    const inventory = api.root.addResource('inventory');
    inventory.addMethod('GET', new apigateway.LambdaIntegration(inventoryApi));
    inventory.addResource('events').addMethod('POST', new apigateway.LambdaIntegration(inventoryApi));
    inventory.addResource('health').addMethod('GET', new apigateway.LambdaIntegration(inventoryApi));
    inventory.addResource('search').addMethod('GET', new apigateway.LambdaIntegration(searchApi));
    inventory.addResource('{productId}').addMethod('GET', new apigateway.LambdaIntegration(inventoryApi));
    inventory.addResource('location').addResource('{locationId}').addMethod('GET', new apigateway.LambdaIntegration(inventoryApi));
    api.root.addResource('reorders').addMethod('GET', new apigateway.LambdaIntegration(reorderApi));

    new cdk.CfnOutput(this, 'ApiGatewayUrl', { value: api.url });
    new cdk.CfnOutput(this, 'DynamoDbTableName', { value: inventoryTable.tableName });
    new cdk.CfnOutput(this, 'InventoryEventsQueueUrl', { value: inventoryEventsQueue.queueUrl });
    new cdk.CfnOutput(this, 'OpenSearchEndpoint', { value: `https://${domain.domainEndpoint}` });
    new cdk.CfnOutput(this, 'InventoryApiLambdaName', { value: inventoryApi.functionName });
    new cdk.CfnOutput(this, 'InventoryEventProcessorLambdaName', { value: processor.functionName });
    new cdk.CfnOutput(this, 'SearchApiLambdaName', { value: searchApi.functionName });
    new cdk.CfnOutput(this, 'ReorderApiLambdaName', { value: reorderApi.functionName });
  }
}

const CorsAllowOrigins = ['*'];