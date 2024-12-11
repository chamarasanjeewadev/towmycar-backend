#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";
import { getEnvironmentConfig } from "../config/environments";
import * as AWS from "aws-sdk";
import { getAWSCredentials } from "../config/aws-credentials";


const app = new cdk.App();
const environment = app.node.tryGetContext("env") || "dev";


const getProfileName = (env: string): string => {
  switch (env) {
    case 'prod':
      return 'towmycar-prod';
    case 'staging':
      return 'towmycar-staging';
    case 'dev':
    default:
      return 'towmycar-dev';
  }
};

// Get the environment configuration
const envConfig = getEnvironmentConfig(environment);


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
console.log(environment, envConfig);
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
