interface Environment {
  account: string;
  region: string;
}

interface EnvironmentConfig {
  [key: string]: Environment;
}

export const environments: EnvironmentConfig = {
  development: {
    account: "111111111111", // Your default account
    region: "eu-west-2",
  },
  staging: {
    account: "222222222222", // Your staging account
    region: "eu-west-2",
  },
  production: {
    account: "333333333333", // Your production account
    region: "eu-west-2",
  },
};
