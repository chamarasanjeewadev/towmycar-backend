import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";
import { BreakdownRequestRepositoryType } from "../repository/breakdownRequest.repository";

export const CreateBreakdownRequest = async (
  input: BreakdownRequestInput,
  repo: BreakdownRequestRepositoryType
) => {
  console.log("Creating breakdown request", input);
  const breakdownRequestId = await repo.saveBreakdownRequest(input);
  return { breakdownRequestId, status: "Breakdown reported successfully." };
};