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

// Load environment variables
const envPath = path.join(__dirname, "../../../apps/towmycar_api/.env");
dotenv.config({ path: envPath });

interface CdkStackProps extends cdk.StackProps {
  description: string;
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

  constructor(scope: cdk.App, id: string, props: CdkStackProps) {
    super(scope, id, props);

    this.createQueuesAndTopics();
    this.setupSNStoSQSSubscriptions();
    this.createLambdaFunctions();
    this.setupPermissions();
    this.createApiGateway();
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
          'ses:SendEmail',
          'ses:SendRawEmail',
          'ses:SendTemplatedEmail'
        ],
        resources: ['*'] // You can restrict this to specific SES ARNs if needed
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
}
