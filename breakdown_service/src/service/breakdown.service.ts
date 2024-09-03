import { BreakdownRequestInput } from "./../dto/breakdownRequest.dto";
import * as repository from "../repository/breakdownRequest.repository";

export const CreateBreakdownRequest = async (
  data: BreakdownRequestInput
) => {
  // Call to repository function to save the data
  return await repository.BreakdownRequestRepository.saveBreakdownRequest(data);
};
