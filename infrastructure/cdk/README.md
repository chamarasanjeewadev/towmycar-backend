# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## AWS Credentials Setup

1. Create environment-specific credential files:
   - `.env.dev` for development
   - `.env.staging` for staging
   - `.env.prod` for production

2. Add your AWS credentials to each file following the format in `.env.example`

3. Never commit these files to version control

4. To deploy to different environments:
   ```bash
   # Development
   npm run deploy:dev

   # Staging
   npm run deploy:staging

   # Production
   npm run deploy:prod
   ```

Note: Make sure you have appropriate AWS permissions for each environment.
