import { UserRepository } from "../../repository/user.repository";
import { BreakdownRequestInput } from "../../dto/breakdownRequest.dto";
import { BreakdownRequestRepository } from "../../repository/breakdownRequest.repository";
import {
  BREAKDOWN_REQUEST_SNS_TOPIC_ARN,
  VIEW_REQUEST_BASE_URL,
} from "../../config";
import { sendSNS, sendPushNotificationAndEmail } from "./../utils/sns.service";
import { CustomError } from "../../utils/error/errors";
import {
  EmailNotificationType,
  UserStatus,
  
} from "@towmycar/common";

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
    };

    const requestId = await BreakdownRequestRepository.saveBreakdownRequest(
      breakdownRequestData
    );

    // Send request to breakdown service to find near by drivers
    const combinedSnsResult = await sendSNS(
      BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
      { requestId, ...breakdownRequestData }
    );

    return {
      requestId,
      status: "Breakdown reported successfully.",
      userId: userInfo.userId,
    };
  } catch (error) {
    console.error("Error in CreateCombinedBreakdownRequest:", error);
    throw new CustomError(
      "Failed to process combined breakdown request",
      error
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
  userStatus: UserStatus
): Promise<boolean> => {
  const updatedAssignment =
    await BreakdownRequestRepository.updateUserStatusInBreakdownAssignment(
      assignmentId,
      userStatus
    );

  if (updatedAssignment) {
    let emailType: EmailNotificationType;
    if (userStatus === UserStatus.ACCEPTED) {
      emailType = EmailNotificationType.USER_ACCEPT_EMAIL;
    } else if (userStatus === UserStatus.REJECTED) {
      emailType = EmailNotificationType.USER_REJECT_EMAIL;
    } else {
      // If status is PENDING or any other status, we don't send an email
      return true;
    }

    await sendPushNotificationAndEmail({
      type: emailType,
      payload: {
        requestId: updatedAssignment.requestId,
        userStatus,
        userId: 88,
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/driver/view-requests/${assignmentId}`,
      },
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
  const {
    requestId,
    customerRating,
    customerFeedback,
    siteRating,
    siteFeedback,
  } = params;

  await BreakdownRequestRepository.closeBreakdownAndUpdateRating({
    requestId,
    customerRating,
    customerFeedback,
    siteRating,
    siteFeedback,
  });
};

// Add this new function
const getDriverRatingCount = async (driverId: number) => {
  return await BreakdownRequestRepository.getDriverRatingCount(driverId);
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
  getDriverRatingCount, // Add this line
};

interface CloseBreakdownParams {
  requestId: number;
  customerRating: number | null;
  customerFeedback: string | null;
  siteRating: number | null;
  siteFeedback: string | null;
}
