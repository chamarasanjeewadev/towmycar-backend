import { DB } from "../db/db.connection";
import { breakdownRequest } from "../db/schema/schema";
import { BreakdownRequestInput } from "../dto/breakdownRequest.dto";

// declare repository type
export type BreakdownRequestRepositoryType = {
  saveBreakdownRequest: (data: BreakdownRequestInput) => Promise<number>;
};

const saveBreakdownRequest = async (
  data: BreakdownRequestInput
): Promise<number> => {
  const breakdownResult = await DB.insert(breakdownRequest)
    .values({
      userId: Number(data.userId), // Convert to number
      requestType: data.requestType,
      location: data.location,
      description: data.description || null, // Handle optional field
      status: "pending",
    })
    .returning({ id: breakdownRequest.id });

  return breakdownResult[0].id;
};

export const BreakdownRequestRepository: BreakdownRequestRepositoryType = {
  saveBreakdownRequest,
};
