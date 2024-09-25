import {
  UserRequestInput,
  UserRegisterInput,
  UserData,
} from "../dto/userRequest.dto";
import { eq, and } from "drizzle-orm";
import {
  DB,
  user,
  fcmTokens,
  vehicles,
  Vehicle,
  driver,
  customer,
  User,
} from "@breakdownrescue/database";
export type UserRepositoryType = {
  createUser: (user: UserRegisterInput) => Promise<number>;
  createUserFromWebhook: (userData: UserData) => Promise<{
    userId: number;
    role: string;
    customerId?: number;
    driverId?: number;
  }>;
  getOrCreateUser: (
    user: UserRegisterInput
  ) => Promise<{ id: number; isCreated: boolean }>;
  getUserProfileByEmail: (email: string) => Promise<any | null>;
  getUserProfileById: (id: number) => Promise<any | null>;
  getUserProfileByAuthId: (authId: string) => Promise<any | null>; // New method
  updateUserProfile: (
    id: number,
    updateData: Partial<UserRegisterInput>
  ) => Promise<any | null>;
  saveFcmToken: (
    userId: number,
    token: string,
    browserInfo?: string
  ) => Promise<number>;
  getUserById: (userId: number) => Promise<any | null>;
  addVehicle: (
    vehicleData: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
  ) => Promise<number>;
  getVehiclesByCustomerId: (customerId: number) => Promise<Vehicle[]>;
  updateVehicle: (
    id: number,
    updateData: Partial<Vehicle>
  ) => Promise<Vehicle | null>;
  deleteVehicle: (id: number) => Promise<boolean>;
};

const createUser = async (user: UserRegisterInput): Promise<number> => {
  console.log("Creating user:", user);
  return new Promise((resolve, reject) => {
    resolve(1);
  });
  // const result = await DB.insert(user)
  //   .values({firstName:"",
  //     // email: user.email,
  //     // firstName: user.firstName,
  //     // lastName: user.lastName,
  //     // postcode: user.postcode,
  //     // vehicleRegistration: user.vehicleRegistration,
  //     // mobileNumber: user.mobileNumber,
  //   })
  //   .returning();
  // const id = result[0].id;
  // return id;
};

const getOrCreateUser = async (
  userRegisterInput: UserRegisterInput
): Promise<{ id: number; isCreated: boolean }> => {
  // Try to find the user by email
  const existingUser = await DB.select()
    .from(user)
    // .where(eq(user.email, user.email))
    .limit(1);

  if (existingUser.length > 0) {
    // User found, return the existing user's ID and isCreated as false
    console.log("User found:", existingUser[0].id);
    return { id: existingUser[0].id, isCreated: false };
  } else {
    // User not found, create a new user
    console.log("User not found, creating new user");
    const newUserId = await createUser(userRegisterInput);
    return { id: newUserId, isCreated: true };
  }
};

const getUserProfileByEmail = async (email: string): Promise<any | null> => {
  const result = await DB.select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};

const getUserProfileById = async (id: number): Promise<any | null> => {
  const result = await DB.select().from(user).where(eq(user.id, id)).limit(1);

  return result.length > 0 ? result[0] : null;
};

const getUserProfileByAuthId = async (authId: string): Promise<any | null> => {
  const result = await DB.select().from(user).where(eq(user.authId, authId)).limit(1);

  if (result.length === 0) {
    return null;
  }

  const userProfile = result[0];
  if (userProfile.role === "driver") {
    const driverProfile = await DB.select().from(driver).where(eq(driver.userId, userProfile.id)).limit(1);
    console.log("driverProfile", driverProfile);
    return { ...userProfile, driverProfile: driverProfile[0] };
  } 
  else if (userProfile.role === "customer") {
    const customerProfile = await DB.select().from(customer).where(eq(customer.userId, userProfile.id)).limit(1);
    console.log("customerProfile", customerProfile);
    return { ...userProfile, customerProfile: customerProfile[0] };
  }

  return userProfile;
};

const updateUserProfile = async (
  id: number,
  updateData: Partial<UserRegisterInput>
): Promise<any | null> => {
  const result = await DB.update(user)
    .set(updateData)
    .where(eq(user.id, id))
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
      userId: userId,
      token: token,
    })
    .returning();
  return result[0].id;
};

const getUserById = async (userId: number): Promise<any | null> => {
  const result = await DB.select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};

const addVehicle = async (
  vehicleData: Omit<Vehicle, "id" | "createdAt" | "updatedAt">
): Promise<number> => {
  const result = await DB.insert(vehicles).values(vehicleData).returning();
  return result[0].id;
};

const getVehiclesByCustomerId = async (
  customerId: number
): Promise<Vehicle[]> => {
  return DB.select().from(vehicles).where(eq(vehicles.customerId, customerId));
};

const updateVehicle = async (
  id: number,
  updateData: Partial<Vehicle>
): Promise<Vehicle | null> => {
  const result = await DB.update(vehicles)
    .set(updateData)
    .where(eq(vehicles.id, id))
    .returning();
  return result.length > 0 ? result[0] : null;
};

const deleteVehicle = async (id: number): Promise<boolean> => {
  const result = await DB.delete(vehicles).where(eq(vehicles.id, id));
  return result?.rowCount ? result.rowCount > 0 : false;
};

const createUserFromWebhook = async (userData: UserData): Promise<{ userId: number; role: string; customerId?: number; driverId?: number }> => {
  try {
    const { id, first_name, last_name, email_addresses, unsafe_metadata } = userData;
    const email = email_addresses?.[0]?.email_address;
    const role = unsafe_metadata?.role ?? "driver" as string;

    const result = await DB.transaction(async (trx) => {
      //@ts-ignore
      const userResult = await trx.insert(user).values({
        authId: id,
        email: email,
        role: role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      const newUserId = userResult[0].id;

      let customerId, driverId;

      if (role === "driver") {
        const driverResult = await trx.insert(driver).values({
          userId: newUserId,
          createdAt: new Date(),
          // Add other driver-specific fields here
        }).returning();
        driverId = driverResult[0].id;
      } else if (role === "customer") {
        const customerResult = await trx.insert(customer).values({
          userId: newUserId,
          createdAt: new Date(),
          // Add other customer-specific fields here
        }).returning();
        customerId = customerResult[0].id;
      }

      return { userId: newUserId, role, customerId, driverId };
    });

    return result;
  } catch (error) {
    console.log("Error creating user from webhook:", error);
    throw error;
  }
};

export const UserRepository: UserRepositoryType = {
  createUser,
  getOrCreateUser,
  getUserProfileByEmail,
  getUserProfileById,
  getUserProfileByAuthId, // Add the new method to the exported object
  updateUserProfile,
  saveFcmToken,
  getUserById,
  addVehicle,
  getVehiclesByCustomerId,
  updateVehicle,
  deleteVehicle,
  createUserFromWebhook,
};
