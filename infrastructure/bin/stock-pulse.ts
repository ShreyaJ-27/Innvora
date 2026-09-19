import * as cdk from 'aws-cdk-lib';
import { StockPulseStack } from '../lib/stock-pulse-stack.js';

const app = new cdk.App();

new StockPulseStack(app, 'StockPulseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-south-1'
  }
});