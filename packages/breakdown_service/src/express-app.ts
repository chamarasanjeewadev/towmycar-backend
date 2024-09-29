import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { httpLogger, HandleErrorWithLogger } from "./utils";
import userRoutes from "./routes/user.routes";
import breakdownRequestRoutes from "./routes/breakdownRequest.routes";
import driverRoutes from "./routes/driver.routes";
import stripeRoutes from "./routes/stripe.routes";
import chatRoutes from "./routes/chat.routes";
const app = express();
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.use("/user", userRoutes);
app.use("/driver", driverRoutes);
app.use("/chat", chatRoutes);
app.use("/user", breakdownRequestRoutes);
app.use("/stripe", stripeRoutes);

// @ts-ignore
app.use("/", (req: Request, res: Response, _: NextFunction) => {
  return res.status(200).json({ message: "I am healthy!" });
});

// @ts-ignore
app.use(HandleErrorWithLogger);

export default app;
