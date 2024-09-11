import { DriverProfileDtoType } from "../../dto/driver.dto";
import {
  IDriverRepository,
  DriverRepository,
} from "../../repository/driver.repository";
import {
  createTempUserInCognito,
  addUserToGroup,
  adminSetUserPassword,
} from "../utils/cognito.service";
import { UserGroup } from "../../enums";

interface UpdateAssignmentData {
  status: string;
  estimation?: string;
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

  async getDriverProfileByEmail(email: string) {
    return DriverRepository.getDriverProfileByEmail(email);
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
  await createTempUserInCognito({ email});
  await adminSetUserPassword(email, password);
  await addUserToGroup(email, UserGroup.DRIVER);
  const newDriver = await repository.create(basicDriverData);

  return newDriver;
};

export const updateDriverProfile = async (
  driverId: number,
  profileData: Partial<DriverProfileDtoType>,
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

export const getDriverProfileByEmail = async (email: string) => {
  return await DriverRepository.getDriverProfileByEmail(email);
};

// Add more functions as needed
