import { UserRequestInput } from "../dto/userRequest.dto";
import { UserRepositoryType } from "../repository/user.repository";

export const CreateUser = async (
  input: UserRequestInput,
  repo: UserRepositoryType
) => {
  console.log("inside create user service", input);

  return await repo.createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    postcode: input.postcode,
    vehicleRegistration: input.vehicleRegistration,
    mobileNumber: input.mobileNumber
  });
};
