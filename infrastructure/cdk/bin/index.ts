#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

const app = new cdk.App();

// Get environment from context or command line arguments
const environment = app.node.tryGetContext('environment') || 'prod';

new CdkStack(app, `towmycar-core-api-stack`, {
description: 'TowMyCar Stack',
  // You can add other stack props here
  tags: {
    Environment: environment,
    Project: 'TowMyCar'
  }
});
