import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as path from "path";

export class BreakdownServiceCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the Lambda function
    const breakdownServiceLambda = new lambda.Function(
      this,
      "BreakdownServiceLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "dist/server.handler",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../apps/towmycar_api")
        ),
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
      }
    );

    // Create an API Gateway
    const api = new apigateway.LambdaRestApi(this, "BreakdownServiceApi", {
      handler: breakdownServiceLambda,
      proxy: true,
    });

    // Output the API Gateway URL
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway URL",
    });
  }
}
