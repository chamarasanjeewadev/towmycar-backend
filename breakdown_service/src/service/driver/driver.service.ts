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
import { EmailNotificationType, UserGroup } from "../../enums";
import { sendNotification } from "../utils/sns.service";
import { UserRepository } from "../../repository/user.repository"; // Update the import path
import { VIEW_REQUEST_BASE_URL } from "../../config"; // Add this import at the top of the file
import { DriverStatus } from "../../enums";
interface UpdateAssignmentData {
  status: string;
  estimation?: string;
  description?: string;
}

export class DriverService {
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
    const breakdownRequestUpdated =
      await DriverRepository.updatebreakdownAssignment(
        driverId,
        requestId,
        data
      );
    console.log("acceptance data...", data);

    // Fetch driver details using the new method
    const driverDetails = await DriverRepository.getDriverById(driverId);

    if (!driverDetails) {
      throw new Error(`Driver with id ${driverId} not found`);
    }

    // Fetch user details using the new method
    const userDetails = await DriverRepository.getUserByRequestId(requestId);

    if (!userDetails) {
      throw new Error(`User not found for request ${requestId}`);
    }

    // Determine the notification type and payload based on the status
    let notificationType: EmailNotificationType;
    let payload: any;

    if (data.status === DriverStatus.QUOTED) {
      notificationType = EmailNotificationType.DRIVER_QUOTATION_UPDATED_EMAIL;
      payload = {
        requestId,
        driverId,
        user: userDetails,
        newPrice: data.estimation,
        estimation: data.estimation,
        description: data?.description ?? "",
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${requestId}`,
      };
    } else if (data.status === DriverStatus.ACCEPTED && parseFloat(data.estimation || '0') > 0 ) {
      notificationType = EmailNotificationType.DRIVER_ACCEPT_EMAIL;
      payload = {
        requestId,
        driverId,
        user: userDetails,
        status: data.status,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${requestId}`,
        driverName: `${driverDetails.fullName}`,
        driverPhone: driverDetails.phoneNumber,
        driverEmail: driverDetails.email,
        vehicleModel: driverDetails.vehicleType,
        vehiclePlateNumber: driverDetails.vehicleRegistration,
        estimation: data.estimation
      };
    } else {
      throw new Error('Invalid status or estimation amount');
    }

    const emailSnsResult = await sendNotification(
      process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN || "",
      {
        type: notificationType,
        payload,
      }
    );
    return breakdownRequestUpdated;
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
  await createTempUserInCognito({ email });
  await adminSetUserPassword(email, password);
  await addUserToGroup(email, UserGroup.DRIVER);
  const newDriver = await repository.create(basicDriverData);
  const emailSnsResult = await sendNotification(
    process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN || "",
    {
      type: EmailNotificationType.DRIVER_REGISTERED_EMAIL,
      payload: {
        username,
        email,
        viewRequestLink: `http://localhost:5173/driver/profile`,
      },
    }
  );

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
