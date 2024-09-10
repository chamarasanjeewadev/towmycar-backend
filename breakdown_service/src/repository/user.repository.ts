import { userProfile } from "db-schema";
import { DB } from "database";
import { UserRequestInput, UserRegisterInput } from "../dto/userRequest.dto";
import { eq } from "drizzle-orm";

export type UserRepositoryType = {
  createUser: (user: UserRegisterInput) => Promise<number>;
  getOrCreateUser: (user: UserRegisterInput) => Promise<number>;
  getUserProfileByEmail: (email: string) => Promise<any | null>;
};

const createUser = async (user: UserRegisterInput): Promise<number> => {
  console.log("Creating user:", user);
  const result = await DB.insert(userProfile)
    .values({
      email: user.email,
      // firstName: user.firstName,
      // lastName: user.lastName,
      // postcode: user.postcode,
      // vehicleRegistration: user.vehicleRegistration,
      // mobileNumber: user.mobileNumber,
    })
    .returning();
  const id = result[0].id;
  return id;
};

const getOrCreateUser = async (user: UserRegisterInput): Promise<number> => {
  // Try to find the user by email
  const existingUser = await DB.select()
    .from(userProfile)
    .where(eq(userProfile.email, user.email))
    .limit(1);

  if (existingUser.length > 0) {
    // User found, return the existing user's ID
    console.log("User found:", existingUser[0].id);
    return existingUser[0].id;
  } else {
    // User not found, create a new user
    console.log("User not found, creating new user");
    return await createUser(user);
  }
};

const getUserProfileByEmail = async (email: string): Promise<any | null> => {
  const result = await DB.select()
    .from(userProfile)
    .where(eq(userProfile.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};

export const UserRepository: UserRepositoryType = {
  createUser,
  getOrCreateUser,
  getUserProfileByEmail,
};
