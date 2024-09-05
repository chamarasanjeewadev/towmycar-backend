import { DriverInput } from '../dto/driver.dto';
import { IDriverRepository } from '../repository/driver.repository';

export const registerDriver = async (driverData: DriverInput, repository: IDriverRepository) => {
  // You can add any business logic here before saving to the database
  const newDriver = await repository.create(driverData);
  return newDriver;
};

export const getDriverByEmail = async (email: string, repository: IDriverRepository) => {
  return repository.findByEmail(email);
};

// Add more functions as needed