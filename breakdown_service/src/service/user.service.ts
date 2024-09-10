import { UserRegisterInput } from "../dto/userRequest.dto";
import { UserRepositoryType } from "../repository/user.repository";
import {
  createUser, 
  addUserToGroup,
  adminSetUserPassword,
} from "./cognito.service";

export const CreateUser = async (
  input: UserRegisterInput,
  repo: UserRepositoryType
) => {
  console.log("inside create user service", input);

  try {
    // Create user in Cognito
    await createUser(input.username!, input.email, input.password!);
    await adminSetUserPassword(input.email, input.password!);
    await addUserToGroup(input.email, "user");

    // Create user in the database
    const userId = await repo.createUser({
      email: input.email,
    });

    return {
      id: userId,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
