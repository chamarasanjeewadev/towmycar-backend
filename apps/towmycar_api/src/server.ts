import dotenv from "dotenv";
import app from "./express-app";
import serverlessExpress from '@vendia/serverless-express';

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.APP_PORT || 9000;

// Export the handler for Lambda
export const handler = serverlessExpress({ app });

// Start local server if not in Lambda environment
if (process.env.AWS_LAMBDA_FUNCTION_NAME === undefined) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}
