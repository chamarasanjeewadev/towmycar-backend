import { BreakdownRequestRepository } from "../repository/breakdownRequest.repository";
import { BreakdownRequestInput, BreakdownRequestWithUserDetails } from "../dto/breakdownRequest.dto";

// Add this type definition
type BreakdownRequestRepositoryType = typeof BreakdownRequestRepository;

export const CreateBreakdownRequest = async (
  input: BreakdownRequestInput,
  repo: BreakdownRequestRepositoryType
) => {
  console.log("Creating breakdown request", input);
  const breakdownRequestId = await repo.saveBreakdownRequest(input);
  return { breakdownRequestId, status: "Breakdown reported successfully." };
};

const getAllBreakdownRequestsWithUserDetails = async (): Promise<BreakdownRequestWithUserDetails[]> => {
  return BreakdownRequestRepository.getAllBreakdownRequestsWithUserDetails();
};

export const BreakdownRequestService = {
  CreateBreakdownRequest, // Corrected function name
  getAllBreakdownRequestsWithUserDetails,
};