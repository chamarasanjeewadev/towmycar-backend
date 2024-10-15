import serverless from "serverless-http";
import dotenv from "dotenv";
import app from "./express-app";

// Load environment variables from .env file
dotenv.config();

const PORT = process.env.APP_PORT || 9000;

// Create an Express app instance

// Your existing Express setup code here
// ...

// Export the handler for Lambda
export const handler = serverless(app);

// Only start the server if we're not in a serverless environment
if (
  process.env.NODE_ENV !== "production" &&
  process.env.AWS_LAMBDA_FUNCTION_NAME === undefined
) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} else {
  console.log(
    "Running in production/Lambda environment. app.listen() will not be called."
  );
}

