import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { httpLogger, NotificationListener } from "@towmycar/common";
import userRoutes from "./routes/user.routes";
import breakdownRequestRoutes from "./routes/breakdownRequest.routes";
import driverRoutes from "./routes/driver.routes";
import stripeRoutes from "./routes/stripe.routes";
import chatRoutes from "./routes/chat.routes";
import adminRoutes from "./routes/admin.routes";
import { errorMiddleware } from "./middleware/errorHandlingMiddleware";
import analyticsRoutes from "./routes/analytics.routes";
import cookieParser from "cookie-parser";

const app = express();

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 10000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

// Updated CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://towmycar.uk",
    "https://l3uz0btv4l.execute-api.eu-west-2.amazonaws.com",
    "https://dev.towmycar.uk",
  ], // Allow all origins, or specify your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply rate limiter to all requests
// app.use(limiter);
app.use(cookieParser());
app.use(cors(corsOptions));

app.use(express.json());
app.use(httpLogger);
// Routes setup
app.use("/user", userRoutes);
app.use("/driver", driverRoutes);
app.use("/chat", chatRoutes);
app.use("/user", breakdownRequestRoutes);
app.use("/stripe", stripeRoutes);
app.use("/admin", adminRoutes);
app.use("/analytics", analyticsRoutes);
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ message: "I am healthy!" });
});
NotificationListener.getInstance();

// Error handling middleware
app.use(errorMiddleware);

export default app;
