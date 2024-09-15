import { UserRegisterInput } from "../../dto/userRequest.dto";
import { UserRepositoryType } from "../../repository/user.repository";
import {
  createTempUserInCognito,
  addUserToGroup,
  adminSetUserPassword,
  checkUserExistsInCognito,
  updateUserInCognito,
} from "../utils/cognito.service";
import { UserGroup } from "../../enums";

export const CreateUser = async (
  input: UserRegisterInput,
  repo: UserRepositoryType
) => {
  console.log("inside create user service", input);

  try {
    const userExistsInCognito = await checkUserExistsInCognito(input.email);

    if (userExistsInCognito) {
      // Update existing user in Cognito
      await updateUserInCognito(input.email, input.username!, input.password!);
    } else {
      // Create new user in Cognito
      await createTempUserInCognito({
        email: input.email,
      });
      await adminSetUserPassword(input.email, input.password!);
      await addUserToGroup(input.email, UserGroup.USER);
    }

    // Create or update user in the database
    const userId = await repo.getOrCreateUser({
      email: input.email,
      username: input.username,
    });

    return {
      id: userId,
    };
  } catch (error) {
    console.error("Error creating/updating user:", error);
    throw error;
  }
};

export const getUserProfileByEmail = async (
  email: string,
  repo: UserRepositoryType
) => {
  try {
    const userProfile = await repo.getUserProfileByEmail(email);
    if (!userProfile) {
      return null;
    }
    // Exclude sensitive information if needed
    const { password, ...safeUserProfile } = userProfile;
    return safeUserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Add this new function
export const getUserProfileById = async (
  id: number,
  repo: UserRepositoryType
) => {
  try {
    const userProfile = await repo.getUserProfileById(id);
    if (!userProfile) {
      return null;
    }
    // Exclude sensitive information if needed
    const { password, ...safeUserProfile } = userProfile;
    return safeUserProfile;
  } catch (error) {
    console.error("Error fetching user profile by ID:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  id: number,
  updateData: Partial<UserRegisterInput>,
  repo: UserRepositoryType
) => {
  try {
    const updatedProfile = await repo.updateUserProfile(id, updateData);
    if (!updatedProfile) {
      return null;
    }
    // Exclude sensitive information if needed
    const { password, ...safeUserProfile } = updatedProfile;
    return safeUserProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const saveFcmToken = async (
  userId: number,
  token: string,
  browserInfo: string | undefined,
  repo: UserRepositoryType
) => {
  try {
    const tokenId = await repo.saveFcmToken(userId, token, browserInfo);
    return { id: tokenId };
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};
