interface EnvironmentConfig {
  stage: string;
  region: string;
  account: string;
}

const environments: Record<string, EnvironmentConfig> = {
  production: {
    stage: 'prod',
    region: 'eu-west-2',
    account: '124355635987', // Your AWS account ID
  },
  development: {
    stage: 'dev',
    region: 'eu-west-2',
    account: '124355635987',
  },
  staging: {
    stage: 'staging',
    region: 'eu-west-2',
    account: '841162667869',
  },
};

export function getEnvironmentConfig(env: string): EnvironmentConfig {
  const config = environments[env];
  if (!config) {
    throw new Error(`Environment ${env} not found in config`);
  }
  return config;
}
