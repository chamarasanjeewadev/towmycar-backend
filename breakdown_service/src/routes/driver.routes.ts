import express, { Request, Response } from 'express';
import { DriverSchema } from '../dto/driver.dto';
import { registerDriver } from '../service/driver.service';
import { DriverRepository } from '../repository/driver.repository';

const router = express.Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const result = DriverSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const newDriver = await registerDriver(result.data, DriverRepository);

    res.status(201).json({ message: 'Driver registered successfully', driver: newDriver });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;