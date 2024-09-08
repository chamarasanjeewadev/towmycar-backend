import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { httpLogger, HandleErrorWithLogger } from "./utils";
import userRoutes from "./routes/user.routes";
import breakdownRequestRoutes from "./routes/breakdownRequest.routes";
import driverRoutes from "./routes/driver.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(httpLogger);

app.use("/user", userRoutes);
app.use("/driver", driverRoutes);
app.use("/user", breakdownRequestRoutes);

app.use("/", (req: Request, res: Response, _: NextFunction) => {
  return res.status(200).json({ message: "I am healthy breakdown service!" });
});

app.use(HandleErrorWithLogger);

export default app;
