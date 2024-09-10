import { DriverInput } from "../dto/driver.dto";
import { IDriverRepository, DriverRepository } from "../repository/driver.repository";
import { createUser, addUserToGroup, adminSetUserPassword } from "./cognito.service";

interface UpdateAssignmentData {
  status: string;
  estimation?: number;
  description?: string;
}

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

  async updateBreakdownAssignment(
    driverId: number,
    requestId: number,
    data: UpdateAssignmentData
  ) {
    return DriverRepository.updatebreakdownAssignment(
      driverId,
      requestId,
      data
    );
  }
}

export const registerDriver = async (
  username: string,
  email: string,
  password: string,
  repository: IDriverRepository
) => {
  // Create a basic driver record without the password
  const basicDriverData = { username, email };

  // Create user in Cognito and then update database
  await createUser(username, email, password);
  await adminSetUserPassword(email, password);
  await addUserToGroup(email, "driver");
  const newDriver = await repository.create(basicDriverData);

  return newDriver;
};

export const updateDriverProfile = async (
  driverId: number,
  profileData: Partial<DriverInput>,
  repository: IDriverRepository
) => {
  // Update the driver's profile with additional information
  const updatedDriver = await repository.update(driverId, profileData);
  return updatedDriver;
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
