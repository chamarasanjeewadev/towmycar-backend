import { BreakdownRequestRepository } from "../../repository/breakdownRequest.repository";
import { UserRepository } from "../../repository/user.repository";
import { BreakdownRequestWithUserDetails } from "../../dto/breakdownRequest.dto";
import { sendNotification } from "../utils/sns.service";
import { sendPushNotificationAndEmail } from "../utils/sns.service";
import { CombinedBreakdownRequestInput as BreakdownRequestInput } from "../../dto/combinedBreakdownRequest.dto";
import { EmailNotificationType, UserStatus } from "../../enums";
import {
  BREAKDOWN_REQUEST_SNS_TOPIC_ARN,
  NOTIFICATION_REQUEST_SNS_TOPIC_ARN,
  VIEW_REQUEST_BASE_URL,
} from "../../config";
import { getUserProfileById } from "./user.service";

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
    const breakdownRequestData = {
      customerId: userInfo.customerId,
      requestType: combinedInput.requestType,
      locationAddress: combinedInput.locationAddress,
      userLocation: {
        latitude: combinedInput.userLocation.latitude,
        longitude: combinedInput.userLocation.longitude,
      },
      description: combinedInput.description,
    };

    const breakdownRequestId =
      await BreakdownRequestRepository.saveBreakdownRequest(
        breakdownRequestData
      );

    // Send request to breakdown service to find near by drivers
    const combinedSnsResult = await sendNotification(
      BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
      { breakdownRequestId, ...breakdownRequestData }
    );

    // send request to notification service to send email to the user
    const emailSnsResult = await sendNotification(
      NOTIFICATION_REQUEST_SNS_TOPIC_ARN || "",
      {
        type: EmailNotificationType.USER_REQUEST_EMAIL,
        payload: {
          breakdownRequestId: breakdownRequestId,
          userId: userInfo.userId,
          firstName: combinedInput.firstName,
          lastName: combinedInput.lastName,
          email: combinedInput.email,
          userLocation: breakdownRequestData.userLocation,
          viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${breakdownRequestId}`,
        },
      }
    );
    // console.log("Sending Kafka message");
    // await sendKafkaMessage("breakdown-requests", {
    //   breakdownRequestId,
    //   userId: userId,
    //   location: breakdownRequestData.userLocation,
    // });

    return {
      breakdownRequestId,
      status: "Breakdown reported successfully.",
      userId: userInfo.userId,
    };
  } catch (error) {
    console.error("Error in CreateCombinedBreakdownRequest:", error);
    throw new Error("Failed to process combined breakdown request");
  }
};

const getAllBreakdownRequestsWithUserDetails = async (): Promise<
  BreakdownRequestWithUserDetails[]
> => {
  const requests =
    await BreakdownRequestRepository.getAllBreakdownRequestsWithUserDetails();
  return requests.map(request => ({
    ...request,
    userName:
      `${request.firstName || ""} ${request.lastName || ""}`.trim() ||
      "Unknown",
  }));
};
const getBreakdownAssignmentsByUserIdAndRequestId = async (
  userId: number,
  requestId?: number
) => {
  const assignments =
    await BreakdownRequestRepository.getBreakdownAssignmentsByUserIdAndRequestId(
      userId,
      requestId
    );
  return assignments;
};

const getPaginatedBreakdownRequestsWithUserDetails = async (
  page: number,
  pageSize: number,
  customerId?: number,
  requestId?: number
): Promise<{
  breakdownRequests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  const { requests, totalCount } =
    await BreakdownRequestRepository.getPaginatedBreakdownRequestsWithUserDetails(
      page,
      pageSize,
      customerId,
      requestId
    );

  return {
    breakdownRequests: requests.map(request => ({
      ...request,
      userName:
        `${request.firstName || ""} ${request.lastName || ""}`.trim() ||
        "Unknown",
    })),
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
        viewRequestLink: `${VIEW_REQUEST_BASE_URL}/driver/view-requests/${assignmentId}`,
      },
    });

    return true;
  }

  return false;
};

const createAnonymousCustomerAndBreakdownRequest = async (
  breakdownRequestInput: BreakdownRequestInput
) => {
  try {
    // Create anonymous customer
    const anonymousUser = await UserRepository.createAnonymousCustomer({
      email: breakdownRequestInput.email,
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

export const BreakdownRequestService = {
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
  getBreakdownAssignmentsByUserIdAndRequestId,
  updateUserStatusInBreakdownAssignment: updateUserStatusInBreakdownAssignment,
  createAnonymousCustomerAndBreakdownRequest, // Add this line
  CreateBreakdownRequest,
};

// export const CreateAnonymousBreakdownRequest = async (
//   combinedInput: BreakdownRequestInput
// ) => {
//   try {
//     const result = await createAnonymousCustomerAndBreakdownRequest(combinedInput, UserRepository);

//     return {
//       anonymousCustomerId: result.anonymousCustomerId,
//       breakdownRequestId: result.breakdownRequestResult.breakdownRequestId,
//       status: result.breakdownRequestResult.status,
//     };
//   } catch (error) {
//     console.error("Error in CreateAnonymousBreakdownRequest:", error);
//     throw new Error("Failed to process anonymous breakdown request");
//   }
// };

// export const CreateAnonymousBreakdownRequest = async (
//   combinedInput: BreakdownRequestInput
// ) => {
//   try {
//     const result = await BreakdownRequestService.createAnonymousCustomerAndBreakdownRequest(combinedInput, repo);

//     return {
//       anonymousCustomerId: result.anonymousCustomerId,
//       breakdownRequestId: result.breakdownRequestResult.breakdownRequestId,
//       status: result.breakdownRequestResult.status,
//     };
//   } catch (error) {
//     console.error("Error in CreateAnonymousBreakdownRequest:", error);
//     throw new Error("Failed to process anonymous breakdown request");
//   }
// };
// export const createAndNotifyBreakdownRequest = async (
//   input: BreakdownRequestInput,
//   repo: BreakdownRequestRepositoryType
// ) => {
//   console.log("Creating breakdown request", input);
//   const breakdownRequestId = await repo.saveBreakdownRequest(input);

//   console.log("Sending SNS notification", BREAKDOWN_REQUEST_SNS_TOPIC_ARN);
//   const snsResult = await sendNotification(
//     BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
//     {
//       breakdownRequestId,
//       userId: input.userId,
//       location: input.userLocation,
//     }
//   );

//   // Send Kafka message
//   console.log("Sending Kafka message");
//   await sendKafkaMessage("breakdown-requests", {
//     breakdownRequestId,
//     userId: input.userId,
//     location: input.userLocation,
//   });

//   return {
//     breakdownRequestId,
//     status: "Breakdown reported successfully.",
//     snsNotification: snsResult,
//   };
// };
