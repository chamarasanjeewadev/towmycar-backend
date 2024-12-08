#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { environments } from '../config/environments';

const app = new cdk.App();

// Get environment from context or default to 'development'
const targetEnv = app.node.tryGetContext('env') || 'development';

if (!environments[targetEnv]) {
  throw new Error(`Invalid environment: ${targetEnv}. Valid environments are: ${Object.keys(environments).join(', ')}`);
}

const envConfig = environments[targetEnv];

new CdkStack(app, `TowMyCar-${targetEnv}`, {
  env: {
    account: envConfig.account,
    region: envConfig.region,
  },
  description: `TowMyCar stack for ${targetEnv} environment`,
});
