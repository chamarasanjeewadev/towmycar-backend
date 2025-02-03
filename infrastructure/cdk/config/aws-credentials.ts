interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

function getEnvPrefix(): string {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'PROD';
    case 'staging':
      return 'STAGING';
    case 'development':
    default:
      return 'DEV';
  }
}

export function getAWSCredentials(env: string): AWSCredentials {
  const prefix = getEnvPrefix();
  
  const credentials: AWSCredentials = {
    accessKeyId: process.env[`${prefix}_AWS_ACCESS_KEY_ID`] || '',
    secretAccessKey: process.env[`${prefix}_AWS_SECRET_ACCESS_KEY`] || '',
    region: process.env.AWS_REGION || 'eu-west-2'
  };

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error(`AWS credentials not properly configured for environment: ${env}`);
  }

  return credentials;
} 