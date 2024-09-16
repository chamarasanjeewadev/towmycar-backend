import { BreakdownRequestRepository } from "../../repository/breakdownRequest.repository";
import {
  BreakdownRequestInput,
  BreakdownRequestWithUserDetails,
} from "../../dto/breakdownRequest.dto";
import * as userRepository from "../../repository/user.repository";
import { sendNotification } from "../utils/sns.service";
import { BreakdownRequestRepositoryType } from "../../repository/breakdownRequest.repository";
import { UserStatus } from "../../types/common";
import { sendPushNotification } from "../utils/sns.service";
import { CombinedBreakdownRequestInput } from "../../dto/combinedBreakdownRequest.dto";
import * as repository from "../../repository/breakdownRequest.repository";
import * as cognitoService from "../utils/cognito.service";
import { UserGroup, NotificationType } from "../../enums";
export const createAndNotifyBreakdownRequest = async (
  input: BreakdownRequestInput,
  repo: BreakdownRequestRepositoryType
) => {
  console.log("Creating breakdown request", input);
  const breakdownRequestId = await repo.saveBreakdownRequest(input);

  console.log(
    "Sending SNS notification",
    process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN
  );
  const snsResult = await sendNotification(
    process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
    {
      breakdownRequestId,
      userId: input.userId,
      location: input.userLocation,
    }
  );

  return {
    breakdownRequestId,
    status: "Breakdown reported successfully.",
    snsNotification: snsResult,
  };
};
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
        userId = await userRepository.UserRepository.getOrCreateUser(userData);
      } else {
        // If user doesn't exist in Cognito, create user in Cognito and then in your DB
        await cognitoService.createTempUserInCognito({
          email: userData.email,
        });
        await cognitoService.addUserToGroup(userData.email, UserGroup.USER);
        userId = await userRepository.UserRepository.getOrCreateUser(userData);
      }
    }

    // Create breakdown request
    const breakdownRequestData = {
      userId,
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

    // Send SNS notification to the notification service to send email and push notification to the user
    const combinedSnsResult = await sendNotification(
      process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
      { breakdownRequestId, ...breakdownRequestData }
    );

    // send email to the user
    const emailSnsResult = await sendNotification(
      process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN || "",
      {
        type: NotificationType.UserRequestEmail,
        payload: {
          breakdownRequestId: breakdownRequestId,
          userId,
          firstName: combinedInput.firstName,
          lastName: combinedInput.lastName,
          email: combinedInput.email,
          location: breakdownRequestData.userLocation,
          viewRequestLink: `https://www.yourcompany.com/breakdown-requests/${breakdownRequestId}`,
        },
      }
    );

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

const updateDriverStatusInBreakdownAssignment = async (
  assignmentId: number,
  userStatus: UserStatus
): Promise<boolean> => {
  sendPushNotification({
    assignmentId,
    userStatus,
  });
  return BreakdownRequestRepository.updateDriverStatusInBreakdownAssignment(
    assignmentId,
    userStatus
  );
};

export const CreateBreakdownRequest = async (data: BreakdownRequestInput) => {
  // Call to repository function to save the data and send SNS notification
  return await repository.BreakdownRequestRepository.saveBreakdownRequest(data);
};

export const BreakdownRequestService = {
  createAndNotifyBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
  getBreakdownAssignmentsByUserIdAndRequestId,
  updateDriverStatusInBreakdownAssignment,
};
