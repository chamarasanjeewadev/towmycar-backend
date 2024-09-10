import { userProfile } from "db-schema";
import { DB } from "database";
import { UserRequestInput } from "../dto/userRequest.dto";
// declare repository type
import { UserRegisterInput } from "../dto/userRequest.dto";

export type UserRepositoryType = {
  createUser: (user: UserRegisterInput) => Promise<number>;
};

const createUser = async (user: UserRegisterInput): Promise<number> => {
  console.log("user......", user);
  const result = await DB.insert(userProfile)
    .values({
      email: user.email,
    })
    .returning();
  const id = result[0].id;
  return id;
};

export const UserRepository: UserRepositoryType = {
  createUser,
};
