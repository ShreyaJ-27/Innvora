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

    const processorRoleName = 'stockpulse-inventory-event-processor';
    const searchApiRoleName = 'stockpulse-search-api';
    const indexInitializerRoleName = 'stockpulse-opensearch-index-initializer';
    const lambdaManagedPolicies = [
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
    ];
    const processorRole = new iam.Role(this, 'InventoryEventProcessorRole', {
      roleName: processorRoleName,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: lambdaManagedPolicies
    });
    const searchApiRole = new iam.Role(this, 'SearchApiRole', {
      roleName: searchApiRoleName,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: lambdaManagedPolicies
    });
    const indexInitializerRole = new iam.Role(this, 'OpenSearchIndexInitializerRole', {
      roleName: indexInitializerRoleName,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: lambdaManagedPolicies
    });

    const createFunction = (id: string, entry: string, description: string, role?: iam.IRole): NodejsFunction => {
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
        role,
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
    const processor = createFunction('inventory-event-processor', 'inventory-event-processor.ts', 'Processes inventory events from SQS', processorRole);
    const searchApi = createFunction('search-api', 'search-api.ts', 'Searches historical inventory events', searchApiRole);
    const reorderApi = createFunction('reorder-api', 'reorder-api.ts', 'Generates smart reorder recommendations');
    const indexInitializer = new NodejsFunction(this, 'OpenSearchIndexInitializer', {
      functionName: 'stockpulse-opensearch-index-initializer',
      description: 'Creates the inventory-events OpenSearch index with its required mapping',
      entry: path.join(lambdaCodePath, 'opensearch-index-initializer.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      vpc,
      securityGroups: [lambdaSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      role: indexInitializerRole,
      environment: {
        OPENSEARCH_ENDPOINT: `https://${domain.domainEndpoint}`
      },
      bundling: { minify: true, sourceMap: true, target: 'es2022' }
    });

    inventoryTable.grantReadWriteData(inventoryApi);
    inventoryTable.grantReadWriteData(processor);
    inventoryTable.grantReadData(searchApi);
    inventoryTable.grantReadData(reorderApi);
    inventoryEventsQueue.grantSendMessages(inventoryApi);
    processor.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['es:ESHttpPut'],
      resources: [domain.domainArn, `${domain.domainArn}/*`]
    }));
    searchApi.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['es:ESHttpGet', 'es:ESHttpHead', 'es:ESHttpPost'],
      resources: [domain.domainArn, `${domain.domainArn}/*`]
    }));
    indexInitializer.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['es:ESHttpGet', 'es:ESHttpHead', 'es:ESHttpPut'],
      resources: [domain.domainArn, `${domain.domainArn}/*`]
    }));

    const domainResource = domain.node.defaultChild as opensearch.CfnDomain;
    const processorPrincipalArn = this.formatArn({ service: 'iam', region: '', resource: 'role', resourceName: processorRoleName });
    const searchApiPrincipalArn = this.formatArn({ service: 'iam', region: '', resource: 'role', resourceName: searchApiRoleName });
    const indexInitializerPrincipalArn = this.formatArn({ service: 'iam', region: '', resource: 'role', resourceName: indexInitializerRoleName });
    domainResource.accessPolicies = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: processorPrincipalArn },
          Action: ['es:ESHttpPut'],
          Resource: [domain.domainArn, `${domain.domainArn}/*`]
        },
        {
          Effect: 'Allow',
          Principal: { AWS: searchApiPrincipalArn },
          Action: ['es:ESHttpGet', 'es:ESHttpHead', 'es:ESHttpPost'],
          Resource: [domain.domainArn, `${domain.domainArn}/*`]
        },
        {
          Effect: 'Allow',
          Principal: { AWS: indexInitializerPrincipalArn },
          Action: ['es:ESHttpGet', 'es:ESHttpHead', 'es:ESHttpPut'],
          Resource: [domain.domainArn, `${domain.domainArn}/*`]
        }
      ]
    };

    const indexInitialization = new cdk.CustomResource(this, 'OpenSearchIndexInitialization', {
      serviceToken: indexInitializer.functionArn,
      properties: { IndexName: 'inventory-events', MappingVersion: '1' }
    });
    indexInitialization.node.addDependency(domain);

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