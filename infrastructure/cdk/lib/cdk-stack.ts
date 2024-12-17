import * as cdk from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as iam from "aws-cdk-lib/aws-iam";
import {
  HttpApi,
  CorsHttpMethod,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dotenv from "dotenv";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as s3 from "aws-cdk-lib/aws-s3";

function loadServiceEnvFile(servicePath: string, environment: string): void {
  const envFile = environment === "prod" ? ".env.prod" : ".env.dev";
  const envPath = path.join(
    __dirname,
    `../../../apps/${servicePath}/${envFile}`
  );
  dotenv.config({ path: envPath });
}

function loadEnvironmentVariables(environment: string): void {
  // Load environment variables for each service
  loadServiceEnvFile("towmycar_api", environment);
  loadServiceEnvFile("finder_service", environment);
  loadServiceEnvFile("notification_service", environment);
}

interface CdkStackProps extends cdk.StackProps {
  description: string;
  environment: string;
}

export class CdkStack extends cdk.Stack {
  // Queue references
  private breakdownRequestQueue: sqs.Queue;
  private sendNotificationQueue: sqs.Queue;

  // Topic references
  private breakdownRequestTopic: sns.Topic;
  private sendNotificationTopic: sns.Topic;

  // Lambda references
  private apiFunction: NodejsFunction;
  private finderFunction: NodejsFunction;
  private notificationFunction: NodejsFunction;

  private documentsBucket: s3.Bucket;

  constructor(scope: cdk.App, id: string, props: CdkStackProps) {
    super(scope, id, props);

    // Use environment from props instead of trying to access app
    const environment = props.environment;

    // Load the appropriate environment variables
    loadEnvironmentVariables(environment);

    this.createQueuesAndTopics();
    this.setupSNStoSQSSubscriptions();
    this.createLambdaFunctions();
    this.setupPermissions();
    this.createApiGateway();
    this.createS3Bucket(environment);
  }

  private createQueuesAndTopics(): void {
    // Create SQS Queues
    this.breakdownRequestQueue = new sqs.Queue(this, "BreakdownRequestQueue", {
      queueName: "breakdown-request-queue",
      visibilityTimeout: cdk.Duration.seconds(30),
      retentionPeriod: cdk.Duration.days(1),
      // DLQ configuration removed temporarily
    });

    this.sendNotificationQueue = new sqs.Queue(this, "SendNotificationQueue", {
      queueName: "send-notification-queue",
      visibilityTimeout: cdk.Duration.seconds(30),
      retentionPeriod: cdk.Duration.days(1),
      // DLQ configuration removed temporarily
    });

    // Create SNS Topics
    this.breakdownRequestTopic = new sns.Topic(this, "BreakdownRequestTopic", {
      topicName: "breakdown-request-topic",
      displayName: "Breakdown Request Topic",
    });

    this.sendNotificationTopic = new sns.Topic(this, "SendNotificationTopic", {
      topicName: "send-notification-topic",
      displayName: "Send Notification Topic",
    });
  }

  private setupSNStoSQSSubscriptions(): void {
    this.breakdownRequestTopic.addSubscription(
      new subscriptions.SqsSubscription(this.breakdownRequestQueue)
    );

    this.sendNotificationTopic.addSubscription(
      new subscriptions.SqsSubscription(this.sendNotificationQueue)
    );
  }

  private createLambdaFunctions(): void {
    const commonLambdaConfig = {
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ["@aws-sdk/*"],
        loader: { ".html": "text" },
        define: {
          "process.env.NODE_ENV": JSON.stringify("production"),
        },
      },
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      logRetention: logs.RetentionDays.ONE_DAY,
    };

    // API Lambda
    this.apiFunction = new NodejsFunction(this, "tow-api", {
      ...commonLambdaConfig,
      functionName: "towmycar-api",
      entry: path.join(__dirname, "../../../apps/towmycar_api/src/server.ts"),
      handler: "handler",
      environment: {
        NODE_ENV: "production",
        BREAKDOWN_REQUEST_TOPIC_ARN: this.breakdownRequestTopic.topicArn,
        CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || "",
        CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || "",
        DB_URL: process.env.DB_URL || "",
        NOTIFICATION_REQUEST_SNS_TOPIC_ARN: this.sendNotificationTopic.topicArn,
        BREAKDOWN_REQUEST_SNS_TOPIC_ARN: this.breakdownRequestTopic.topicArn,
        VIEW_REQUEST_BASE_URL: process.env.VIEW_REQUEST_BASE_URL || "",
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
        VEHICLE_REGISTRATION_API_KEY:
          process.env.VEHICLE_REGISTRATION_API_KEY || "",
        VEHICLE_REGISTRATION_API_URL:
          process.env.VEHICLE_REGISTRATION_API_URL || "",
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "",
        REGION: process.env.REGION || "eu-west-2",
        PUSHER_APP_ID: process.env.PUSHER_APP_ID || "",
        PUSHER_APP_KEY: process.env.PUSHER_APP_KEY || "",
        PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET || "",
        PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER || "",
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
        RATING_SECRET_KEY: process.env.RATING_SECRET_KEY || "",
      },
    });

    // Finder Lambda
    this.finderFunction = new NodejsFunction(this, "tow-finder", {
      ...commonLambdaConfig,
      functionName: "towmycar-finder",
      entry: path.join(__dirname, "../../../apps/finder_service/src/server.ts"),
      handler: "handler",
      environment: {
        NODE_ENV: "production",
        BREAKDOWN_REQUEST_QUEUE_URL: this.breakdownRequestQueue.queueUrl,
        SEND_NOTIFICATION_TOPIC_ARN: this.sendNotificationTopic.topicArn,
        DB_URL: process.env.DB_URL || "",
        WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || "",
        REGION: process.env.REGION || "eu-west-2",
        VIEW_REQUEST_BASE_URL: process.env.VIEW_REQUEST_BASE_URL || "",
        NOTIFICATION_REQUEST_SNS_TOPIC_ARN: this.sendNotificationTopic.topicArn,
        SQS_QUEUE_URL: this.breakdownRequestQueue.queueUrl,
        SMS_PROVIDER: process.env.SMS_PROVIDER || "twilio",
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",
        ENABLE_SMS: process.env.ENABLE_SMS || "false",
        PUSHER_APP_ID: process.env.PUSHER_APP_ID || "",
        PUSHER_APP_KEY: process.env.PUSHER_APP_KEY || "",
        PUSHER_APP_SECRET: process.env.PUSHER_APP_SECRET || "",
        PUSHER_APP_CLUSTER: process.env.PUSHER_APP_CLUSTER || "",
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || "",
        RATING_SECRET_KEY: process.env.RATING_SECRET_KEY || "",
      },
    });

    // Notification Lambda
    this.notificationFunction = new NodejsFunction(this, "tow-notifications", {
      ...commonLambdaConfig,
      functionName: "towmycar-notifications",
      entry: path.join(
        __dirname,
        "../../../apps/notification_service/src/server.ts"
      ),
      handler: "handler",
      environment: {
        NODE_ENV: "production",
        SEND_NOTIFICATION_QUEUE_URL: this.sendNotificationQueue.queueUrl,
        DB_URL: process.env.DB_URL || "",
        REGION: process.env.REGION || "eu-west-2",
        SOURCE_EMAIL: process.env.SOURCE_EMAIL || "towmycar.uk@gmail.com",
        RATING_SECRET_KEY: process.env.RATING_SECRET_KEY || "",
        SERVICE_ACCOUNT: process.env.SERVICE_ACCOUNT || "",
        TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || "",
        TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
        TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "",
        ENABLE_SMS: process.env.ENABLE_SMS || "false",
        NODE_TLS_REJECT_UNAUTHORIZED:
          process.env.NODE_TLS_REJECT_UNAUTHORIZED || "0",
      },
    });
  }

  private setupPermissions(): void {
    // API Function permissions
    this.breakdownRequestTopic.grantPublish(this.apiFunction);
    this.sendNotificationTopic.grantPublish(this.apiFunction);

    // Finder Function permissions
    this.breakdownRequestQueue.grantConsumeMessages(this.finderFunction);
    this.sendNotificationTopic.grantPublish(this.finderFunction);

    // Add SQS event source to finder function
    this.finderFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(this.breakdownRequestQueue, {
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );

    // Notification Function permissions
    this.sendNotificationQueue.grantConsumeMessages(this.notificationFunction);

    // Grant SES permissions to notification function
    this.notificationFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendTemplatedEmail",
        ],
        resources: ["*"], // You can restrict this to specific SES ARNs if needed
      })
    );

    // Add SQS event source to notification function
    this.notificationFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(this.sendNotificationQueue, {
        batchSize: 10,
        maxBatchingWindow: cdk.Duration.seconds(5),
      })
    );
  }

  private createApiGateway(): void {
    // Create CloudWatch log group for API Gateway
    const apiLogGroup = new logs.LogGroup(this, "ApiGatewayLogGroup", {
      logGroupName: "/aws/apigateway/tow-api",
      retention: logs.RetentionDays.ONE_DAY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create the HTTP API
    const httpApi = new HttpApi(this, "tow-http-api", {
      apiName: "tow-api",
      description: "HTTP API for TowMyCar application",
      corsPreflight: {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "X-Amz-Security-Token",
          "X-Amz-User-Agent",
          "Access-Control-Allow-Origin",
        ],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
          CorsHttpMethod.PATCH,
        ],
        allowOrigins: ["*"],
        maxAge: cdk.Duration.days(1),
      },
    });

    // Create Lambda integration
    const integration = new HttpLambdaIntegration(
      "DefaultIntegration",
      this.apiFunction
    );

    // Add the default route (proxy)
    httpApi.addRoutes({
      path: "/{proxy+}",
      methods: [HttpMethod.ANY],
      integration,
    });

   // Add the additional route for /location/{proxy+}
    httpApi.addRoutes({
      path: "/location/{proxy+}",
      methods: [HttpMethod.ANY],
      integration,
    });

    // Add CloudFormation outputs
    new cdk.CfnOutput(this, "towApiId", {
      value: httpApi.apiId,
      description: "HTTP API Gateway ID",
      exportName: "TowMyCarHttpApiId",
    });

    new cdk.CfnOutput(this, "towApiUrl", {
      value: httpApi.url!,
      description: "HTTP API Gateway URL",
      exportName: "TowMyCarHttpApiEndpoint",
    });
  }

  private createS3Bucket(environment: string): void {
    // Create S3 Bucket
    this.documentsBucket = new s3.Bucket(this, "TowMyCarBucket", {
      bucketName: `tow-my-car-${environment}-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Change as needed for production
      autoDeleteObjects: true, // Change as needed for production
      cors: [
        {
          allowedOrigins: ["*"], // Allow all origins
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ], // Allow all methods
          allowedHeaders: ["*"], // Allow all headers
        },
      ],
    });

    // Grant all functions permissions to access the bucket
    this.documentsBucket.grantReadWrite(this.apiFunction);
    this.documentsBucket.grantReadWrite(this.finderFunction);
    this.documentsBucket.grantReadWrite(this.notificationFunction);
  }
}
