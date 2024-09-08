import { BreakdownRequestRepository } from "../repository/breakdownRequest.repository";
import {
  BreakdownRequestInput,
  BreakdownRequestWithUserDetails,
} from "../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestInput } from "../dto/combinedBreakdownRequest.dto";
import * as userRepository from "../repository/user.repository";
import { snsService } from "../services/sns.service";
import { BreakdownRequestRepositoryType } from "../repository/breakdownRequest.repository";

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
  const snsResult = await snsService.sendNotification(
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

export const createUserAndBreakdownRequest = async (
  combinedInput: CombinedBreakdownRequestInput,
  repo: BreakdownRequestRepositoryType
) => {
  try {
    // Extract user data from the combined input
    const userData = {
      firstName: combinedInput.firstName,
      lastName: combinedInput.lastName,
      email: combinedInput.email,
      postcode: combinedInput.postcode,
      vehicleRegistration: combinedInput.vehicleRegistration,
      mobileNumber: combinedInput.mobileNumber,
    };

    // Create user
    const userId = await userRepository.UserRepository.createUser(userData);

    // Create breakdown request
    const breakdownRequestData: BreakdownRequestInput = {
      userId,
      requestType: combinedInput.requestType,
      locationAddress: combinedInput.locationAddress,
      userLocation: {
        latitude: combinedInput.userLocation.latitude,
        longitude: combinedInput.userLocation.longitude,
      },
      description: combinedInput.description,
    };
    console.log("Creating breakdown request", breakdownRequestData);
    const result = await createAndNotifyBreakdownRequest(
      breakdownRequestData,
      repo
    );

    // Send SNS notification after successful combined request save
    const combinedSnsResult = await snsService.sendNotification(
      process.env.BREAKDOWN_REQUEST_SNS_TOPIC_ARN || "",
      {
        breakdownRequestId: result.breakdownRequestId,
        userId,
        firstName: combinedInput.firstName,
        lastName: combinedInput.lastName,
        email: combinedInput.email,
        location: breakdownRequestData.userLocation,
      }
    );

    return {
      ...result,
      userId,
      combinedSnsNotification: combinedSnsResult,
    };
  } catch (error) {
    console.error("Error in createUserAndBreakdownRequest:", error);
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

const getPaginatedBreakdownRequestsWithUserDetails = async (
  page: number,
  pageSize: number
): Promise<{
  breakdownRequests: BreakdownRequestWithUserDetails[];
  totalCount: number;
}> => {
  const { requests, totalCount } =
    await BreakdownRequestRepository.getPaginatedBreakdownRequestsWithUserDetails(
      page,
      pageSize
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

export const BreakdownRequestService = {
  createAndNotifyBreakdownRequest,
  createUserAndBreakdownRequest,
  getAllBreakdownRequestsWithUserDetails,
  getPaginatedBreakdownRequestsWithUserDetails,
};
