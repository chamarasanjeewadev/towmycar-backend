import express from "express";
import cors from "cors";
import { httpLogger } from "./utils";
import userRoutes from "./routes/user.routes";
import breakdownRequestRoutes from "./routes/breakdownRequest.routes";
import driverRoutes from "./routes/driver.routes";
import stripeRoutes from "./routes/stripe.routes";
import chatRoutes from "./routes/chat.routes";
import { errorMiddleware } from "./middleware/errorHandlingMiddleware";

const app = express();

// Configure CORS properly
app.use(
  cors({
    origin: "*", // Allow all origins, or specify your frontend domain like "https://your-frontend.com"
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: "*", // Allow all headers
    credentials: true,
    exposedHeaders: [
      "Access-Control-Allow-Origin",
      "Access-Control-Allow-Methods",
      "Access-Control-Allow-Headers",
    ],
  })
);

app.use(express.json());
app.use(httpLogger);

// Routes setup
app.use("/user", userRoutes);
app.use("/driver", driverRoutes);
app.use("/chat", chatRoutes);
app.use("/user", breakdownRequestRoutes);
app.use("/stripe", stripeRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ message: "I am healthy!" });
});

// Error handling middleware
app.use(errorMiddleware);

export default app;
