import { BreakdownRequestInput } from "../../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestInput } from "../../dto/combinedBreakdownRequest.dto";
import * as repository from "../../repository/breakdownRequest.repository";
import * as userRepository from "../../repository/user.repository";
import * as snsService from "../utils/sns.service";
import * as cognitoService from "../utils/cognito.service";
import { UserGroup } from "../../enums";

export const CreateBreakdownRequest = async (data: BreakdownRequestInput) => {
  // Call to repository function to save the data and send SNS notification
  return await repository.BreakdownRequestRepository.saveBreakdownRequest(data);
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
          email: userData.email
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

    // Send SNS notification after saving the breakdown request
    const snsResult = await snsService.sendBreakdownRequestNotification(
      breakdownRequestId.toString(),
      breakdownRequestData
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
