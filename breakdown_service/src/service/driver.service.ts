import { DriverInput } from "../dto/driver.dto";
import {
  IDriverRepository,
  DriverRepository,
} from "../repository/driver.repository";
import { createUser, addUserToGroup } from "./cognito.service";
export class DriverService {
  // async registerDriver(driverData: DriverInput, repository: IDriverRepository) {
  //   // You can add any business logic here before saving to the database
  //   const newDriver = await repository.create(driverData);
  //   await createUser(driverData.email, "temporaryPassword");
  //   await addUserToGroup(driverData.email, "driver");

  //   return newDriver;
  // }

  async getDriverByEmail(email: string, repository: IDriverRepository) {
    return repository.findByEmail(email);
  }

  async getDriverRequestWithInfo(driverId: number, requestId: number) {
    return DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId
    );
  }

  async getDriverRequestsWithInfo(driverId: number) {
    return DriverRepository.getDriverRequestsWithInfo(driverId);
  }

  async getSpecificDriverRequestWithInfo(driverId: number, requestId: number) {
    return DriverRepository.getSpecificDriverRequestWithInfo(
      driverId,
      requestId
    );
  }

  async updateDriverRequestStatus(
    driverId: number,
    requestId: number,
    status: string
  ) {
    return DriverRepository.updateDriverRequestStatus(
      driverId,
      requestId,
      status
    );
  }
}

export const registerDriver = async (
  driverData: DriverInput,
  repository: IDriverRepository
) => {
  // You can add any business logic here before saving to the database
  const newDriver = await repository.create(driverData);
  await createUser(driverData.email, "test1234");
  await addUserToGroup(driverData.email, "driver");
  return newDriver;
};

export const getDriverByEmail = async (
  email: string,
  repository: IDriverRepository
) => {
  return repository.findByEmail(email);
};

export const getDriverRequestsWithInfo = async (driverId: number) => {
  return await DriverRepository.getDriverRequestsWithInfo(driverId);
};

export const getDriverRequestWithInfo = async (
  driverId: number,
  requestId: number
) => {
  return await DriverRepository.getSpecificDriverRequestWithInfo(
    driverId,
    requestId
  );
};

// Add more functions as needed
