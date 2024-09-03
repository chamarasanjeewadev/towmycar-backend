import { BreakdownRequestInput } from "./../dto/breakdownRequest.dto";
import { CombinedBreakdownRequestInput } from "../dto/combinedBreakdownRequest.dto";
import * as repository from "../repository/breakdownRequest.repository";
import * as userRepository from "../repository/user.repository";

export const CreateBreakdownRequest = async (data: BreakdownRequestInput) => {
  // Call to repository function to save the data
  return await repository.BreakdownRequestRepository.saveBreakdownRequest(data);
};

export const CreateCombinedBreakdownRequest = async (
  combinedInput: CombinedBreakdownRequestInput
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
    const breakdownRequestData = {
      userId,
      requestType: combinedInput.requestType,
      location: combinedInput.location,
      description: combinedInput.description,
    };

    const breakdownRequestId =
      await repository.BreakdownRequestRepository.saveBreakdownRequest(
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
