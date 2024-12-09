#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";
import { getEnvironmentConfig } from "../config/environments";
import * as AWS from "aws-sdk";

const app = new cdk.App();
const environment = app.node.tryGetContext("env") || "development";

// Get the environment configuration
const envConfig = getEnvironmentConfig(environment);

// Get profile name based on environment
const getProfileName = (env: string): string => {
  switch (env) {
    case 'production':
      return 'towmycar-prod';
    case 'staging':
      return 'towmycar-staging';
    case 'development':
    default:
      return 'towmycar-dev';
  }
};

// Use AWS credentials from profile
const credentials = new AWS.SharedIniFileCredentials({
  profile: getProfileName(environment)
});

// Update AWS SDK configuration
AWS.config.update({
  credentials: credentials,
  region: envConfig.region
});

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
    Project: "TowMyCar",
  },
});

app.synth();
