import { userProfile, fcmTokens } from "db-schema";
import { DB } from "database";
import { UserRequestInput, UserRegisterInput } from "../dto/userRequest.dto";
import { eq, and } from "drizzle-orm";

export type UserRepositoryType = {
  createUser: (user: UserRegisterInput) => Promise<number>;
  getOrCreateUser: (user: UserRegisterInput) => Promise<number>;
  getUserProfileByEmail: (email: string) => Promise<any | null>;
  getUserProfileById: (id: number) => Promise<any | null>; // New method
  updateUserProfile: (
    id: number,
    updateData: Partial<UserRegisterInput>
  ) => Promise<any | null>;
  saveFcmToken: (
    userId: number,
    token: string,
    browserInfo?: string
  ) => Promise<number>;
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

const getUserProfileById = async (id: number): Promise<any | null> => {
  const result = await DB.select()
    .from(userProfile)
    .where(eq(userProfile.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};

const updateUserProfile = async (id: number, updateData: Partial<UserRegisterInput>): Promise<any | null> => {
  const result = await DB.update(userProfile)
    .set(updateData)
    .where(eq(userProfile.id, id))
    .returning();

  return result.length > 0 ? result[0] : null;
};

const saveFcmToken = async (
  userId: number,
  token: string,
  browserInfo?: string
): Promise<number> => {
  const result = await DB.insert(fcmTokens)
    .values({
      userId,
      token,
      browserInfo,
      updatedAt: new Date(),
    })
    // .onConflictDoUpdate({
    //   target: [fcmTokens.userId, fcmTokens.token],
    //   set: {
    //     browserInfo,
    //     updatedAt: new Date(),
    //   },
    // })
    .returning();
  return result[0].id;
};

export const UserRepository: UserRepositoryType = {
  createUser,
  getOrCreateUser,
  getUserProfileByEmail,
  getUserProfileById, // Add the new method to the exported object
  updateUserProfile,
  saveFcmToken,
};
