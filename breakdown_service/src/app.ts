import express from 'express';
import driverRoutes from './routes/driver.routes';

const app = express();

app.use('/api/drivers', driverRoutes);

export default app;