#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { getEnvironmentConfig } from '../config/environments';
import { getAWSCredentials } from '../config/aws-credentials';

const app = new cdk.App();
const environment = app.node.tryGetContext('env') || 'development';

// Ensure NODE_ENV is set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = environment;
}

const envConfig = getEnvironmentConfig(environment);
const awsCredentials = getAWSCredentials(environment);

// Configure AWS SDK
process.env.AWS_ACCESS_KEY_ID = awsCredentials.accessKeyId;
process.env.AWS_SECRET_ACCESS_KEY = awsCredentials.secretAccessKey;
process.env.AWS_REGION = awsCredentials.region;

const stackName = `towmycar-${envConfig.stage}`;

new CdkStack(app, stackName, {
  env: {
    account: envConfig.account,
    region: envConfig.region,
  },
  environment,
  description: `TowMyCar ${envConfig.stage} environment stack`,
  tags: {
    Environment: envConfig.stage,
    Project: 'TowMyCar',
  },
});
