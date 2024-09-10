import express from 'express';
import driverRoutes from './routes/driver.routes';
import { errorMiddleware } from './utils/errorHandlingSetup';
const app = express();

// ... other middleware and route setups ...

app.use('/driver', driverRoutes);

// Global error handling middleware
app.use(errorMiddleware);

export default app;