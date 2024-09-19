import { BreakdownRequestRepository } from "../../repository/breakdownRequest.repository";
import {
  BreakdownRequestInput,
  BreakdownRequestWithUserDetails,
} from "../../dto/breakdownRequest.dto";
import * as userRepository from "../../repository/user.repository";
import { sendNotification } from "../utils/sns.service";
import { BreakdownRequestRepositoryType } from "../../repository/breakdownRequest.repository";
import { sendPushNotificationAndEmail } from "../utils/sns.service";
import { CombinedBreakdownRequestInput } from "../../dto/combinedBreakdownRequest.dto";
import * as repository from "../../repository/breakdownRequest.repository";
import * as cognitoService from "../utils/cognito.service";
import { UserGroup, EmailNotificationType, UserStatus } from "../../enums";
import {
  BREAKDOWN_REQUEST_SNS_TOPIC_ARN,
  NOTIFICATION_REQUEST_SNS_TOPIC_ARN,
  VIEW_REQUEST_BASE_URL,
} from "../../config";
import { sendKafkaMessage } from "../utils/kafka.service";

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

export const CreateCombinedBreakdownRequest = async (
  combinedInput: CombinedBreakdownRequestInput,
  userId?: number
) => {
  try {
    if (!userId) {
      // Extract user data from the combined input
      const userData = {
        firstName: combinedInput.firstName,
        lastName: combinedInput.lastName,
        email: combinedInput.email,
        postcode: combinedInput.postcode,
        vehicleRegistration: combinedInput.vehicleRegistration,
        mobileNumber: combinedInput.mobileNumber,
      };

      // Check if user exists in Cognito
      const userExistsInCognito = await cognitoService.checkUserExistsInCognito(
        userData.email
      );

      if (userExistsInCognito) {
        // If user exists in Cognito, get or create user in your DB
        const { id, isCreated } =
          await userRepository.UserRepository.getOrCreateUser(userData);
        userId = id;
      } else {
        // If user doesn't exist in Cognito, create user in Cognito and then in your DB
        await cognitoService.createTempUserInCognito({
          email: userData.email,
        });
        await cognitoService.addUserToGroup(userData.email, UserGroup.USER);
        const { id, isCreated } =
          await userRepository.UserRepository.getOrCreateUser(userData);
        userId = id;
      }
    }

    // Create breakdown request
    const breakdownRequestData = {
      userId: userId,
      requestType: combinedInput.requestType,
      locationAddress: combinedInput.locationAddress,
      userLocation: {
        latitude: combinedInput.userLocation.latitude,
        longitude: combinedInput.userLocation.longitude,
      },
      description: combinedInput.description,
    };

    const breakdownRequestId =
      await repository.BreakdownRequestRepository.saveBreakdownRequest(
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
          userId,
          firstName: combinedInput.firstName,
          lastName: combinedInput.lastName,
          email: combinedInput.email,
          userLocation: breakdownRequestData.userLocation,
          viewRequestLink: `${VIEW_REQUEST_BASE_URL}/user/view-requests/${breakdownRequestId}`,
        },
      }
    );
    console.log("Sending Kafka message");
    // await sendKafkaMessage("breakdown-requests", {
    //   breakdownRequestId,
    //   userId: userId,
    //   location: breakdownRequestData.userLocation,
    // });

    return {
      breakdownRequestId,
      status: "Breakdown reported successfully.",
      userId,
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
  userId?: number,
  requestId?: number
): Promise<{
  breakdownRequests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  const { requests, totalCount } =
    await BreakdownRequestRepository.getPaginatedBreakdownRequestsWithUserDetails(
      page,
      pageSize,
      userId,
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

export const CreateBreakdownRequest = async (data: BreakdownRequestInput) => {
  // Call to repository function to save the data and send SNS notification
  return await repository.BreakdownRequestRepository.saveBreakdownRequest(data);
};

export const BreakdownRequestService = {
  // createAndNotifyBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
  getBreakdownAssignmentsByUserIdAndRequestId,
  updateDriverStatusInBreakdownAssignment:
    updateUserStatusInBreakdownAssignment,
};
