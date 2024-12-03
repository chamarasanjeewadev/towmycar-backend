import { UserRepository } from "../../repository/user.repository";
import { BreakdownRequestInput } from "../../dto/breakdownRequest.dto";
import { BreakdownRequestRepository } from "../../repository/breakdownRequest.repository";
import {
  BREAKDOWN_REQUEST_SNS_TOPIC_ARN,
  VIEW_REQUEST_BASE_URL,
} from "../../config";
import {
  registerEmailListener,
  registerPushNotificationListener,
  registerSmsNotificationListener,
  sendSNS,
} from "@towmycar/common";
import { APIError, BaseError, ERROR_CODES } from "../../utils/error/errors";
import { NotificationType, UserStatus } from "@towmycar/common";
import EventEmitter from "events";

const notificationEmitter = new EventEmitter();
registerEmailListener(notificationEmitter);
registerPushNotificationListener(notificationEmitter);
registerSmsNotificationListener(notificationEmitter);

const CreateBreakdownRequest = async (
  combinedInput: BreakdownRequestInput,
  userInfo: {
    userId: number;
    role: string;
    customerId?: number;
    driverId?: number;
  }
) => {
  try {
    const breakdownRequestData: BreakdownRequestInput = {
      ...combinedInput,
      customerId: userInfo.customerId,
      userLocation: {
        latitude: combinedInput.userLocation.latitude,
        longitude: combinedInput.userLocation.longitude,
      },
      userToLocation: {
        latitude: combinedInput.userToLocation.latitude,
        longitude: combinedInput.userToLocation.longitude,
      },
    };

    const createdRequest =
      await BreakdownRequestRepository.saveBreakdownRequest(
        breakdownRequestData
      );
    // Send request to breakdown service to find near by drivers
    const combinedSnsResult = await sendSNS(
      BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
      { requestId: createdRequest?.id }
    );

    return {
      requestId: createdRequest?.id,
      status: "Breakdown reported successfully.",
      userId: userInfo.userId,
    };
  } catch (error) {
    if (error instanceof BaseError) {
      throw error;
    }

    // For unknown errors, wrap with APIError and include original message
    throw new APIError(
      ERROR_CODES.INTERNAL_SERVER_ERROR,
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while creating breakdown request"
    );
  }
};

const getPaginatedBreakdownRequestsByCustomerId = async (
  page: number,
  pageSize: number,
  customerId?: number
) => {
  const { requests, totalCount } =
    await BreakdownRequestRepository.getPaginatedBreakdownRequestsByCustomerId(
      page,
      pageSize,
      customerId
    );

  return {
    requests,
    totalCount,
  };
};

const updateUserStatusInBreakdownAssignment = async (
  assignmentId: number,
  userStatus: UserStatus,
  userId: number
): Promise<boolean> => {
  const updatedAssignment =
    await BreakdownRequestRepository.updateUserStatusInBreakdownAssignment(
      assignmentId,
      userStatus
    );

  if (updatedAssignment) {
    let notificationType: NotificationType;
    if (userStatus === UserStatus.ACCEPTED) {
      notificationType = NotificationType.USER_ACCEPT;
    } else if (userStatus === UserStatus.REJECTED) {
      notificationType = NotificationType.USER_REJECT;
    } else {
      // If status is PENDING or any other status, we don't send an email
      return true;
    }

    notificationEmitter.emit(notificationType, {
      requestId: updatedAssignment.requestId,
      userStatus,
      userId,
      viewRequestLink: `${VIEW_REQUEST_BASE_URL}/driver/requests/${assignmentId}`,
    });

    return true;
  }

  return false;
};

// Add this new method to the BreakdownRequestService object
const getBreakdownAssignmentsByRequestId = async (requestId: number) => {
  return await BreakdownRequestRepository.getBreakdownAssignmentsByRequestId(
    requestId
  );
};

const createAnonymousCustomerAndBreakdownRequest = async (
  breakdownRequestInput: BreakdownRequestInput
) => {
  try {
    // Create anonymous customer
    const anonymousUser = await UserRepository.createAnonymousCustomer({
      email: breakdownRequestInput.email,
      firstName: breakdownRequestInput.firstName,
      lastName: breakdownRequestInput.lastName,
    });
    if (!anonymousUser) {
      throw new Error("Failed to create anonymous customer");
    }

    // Create breakdown request using the existing function
    const breakdownRequestResult = await CreateBreakdownRequest(
      breakdownRequestInput,
      {
        userId: anonymousUser.user.id,
        role: "customer",
        customerId: anonymousUser.customer.id,
      }
    );

    return {
      anonymousCustomerId: anonymousUser.customer.id,
      breakdownRequestResult,
    };
  } catch (error) {
    console.error(
      "Error creating anonymous customer and breakdown request:",
      error
    );
    throw error;
  }
};

const getBreakdownAssignmentsByDriverIdAndRequestId = async (
  driverId: number,
  requestId?: number
) => {
  return await BreakdownRequestRepository.getBreakdownAssignmentsByDriverIdAndRequestId(
    driverId,
    requestId
  );
};

const getBreakdownRequestById = async (requestId: number) => {
  const request = await BreakdownRequestRepository.getBreakdownRequestById(
    requestId
  );
  if (!request) {
    throw new Error("Breakdown request not found");
  }
  return request;
};

const closeBreakdownAndUpdateRating = async (
  params: CloseBreakdownParams
): Promise<void> => {
  await BreakdownRequestRepository.closeBreakdownAndUpdateRating(params);
};

// Add this new function
const getDriverRatingCount = async (driverId: number) => {
  return await BreakdownRequestRepository.getDriverRatingCount(driverId);
};

// Add this new function before the BreakdownRequestService object
const getDriverProfile = async (
  driverId: number,
  requestId: number,
  page: number = 1,
  pageSize: number = 10
) => {
  const profile = await BreakdownRequestRepository.getDriverProfile(
    driverId,
    requestId
  );
  if (!profile) {
    throw new Error("Driver not found");
  }
  return profile;
};

// Update the BreakdownRequestService object
export const BreakdownRequestService = {
  getPaginatedBreakdownRequestsByCustomerId,
  getBreakdownAssignmentsByRequestId,
  updateUserStatusInBreakdownAssignment,
  createAnonymousCustomerAndBreakdownRequest,
  CreateBreakdownRequest,
  getBreakdownAssignmentsByDriverIdAndRequestId,
  closeBreakdownAndUpdateRating,
  getBreakdownRequestById,
  getDriverRatingCount,
  getDriverProfile: (
    driverId: number,
    requestId: number,
    page?: number,
    pageSize?: number
  ) => getDriverProfile(driverId, requestId, page, pageSize),
};
interface CloseBreakdownParams {
  requestId: number;
  driverRating: number | null;
  driverFeedback: string | null;
  siteRating: number | null;
  siteFeedback: string | null;
  driverId?: number;
}
