import { DB } from "../db/db.connection";
import { UserRequestInput } from "../dto/userRequest.dto";
import { userProfile } from "../db/schema/schema";
// declare repository type
export type UserRepositoryType = {
  createUser: (user: UserRequestInput) => Promise<number>;
};

const createUser = async (user: UserRequestInput): Promise<number> => {
  const result = await DB.insert(userProfile)
    .values({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      postcode: user.postcode,
      vehicleRegistration: "", // Add a default value or get from user input
      mobileNumber: "", // Add a default value or get from user input
    })
    .returning();
  const id = result[0].id;
  return id;
};

export const UserRepository: UserRepositoryType = {
  createUser,
};
