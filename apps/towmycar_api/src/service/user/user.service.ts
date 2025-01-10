import { UserRegisterInput } from "../../dto/userRequest.dto";
import { UserRepositoryType } from "../../repository/user.repository";
import { UserData } from "../../dto/userRequest.dto"; // Make sure to import UserData

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

// Add this new function
export const getUserProfileByAuthId = async (
  authId: string,
  repo: UserRepositoryType
) => {
  try {
    const userProfile = await repo.getUserProfileByAuthId(authId);
    if (!userProfile) {
      return null;
    }
    // Exclude sensitive information if needed
    const { password, ...safeUserProfile } = userProfile;
    return safeUserProfile;
  } catch (error) {
    console.error("Error fetching user profile by authId:", error);
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

// Add this new function
export const createUserFromWebhook = async (
  userData: UserData,
  repo: UserRepositoryType
) => {
  try {
    const result = await repo.createUserFromWebhook(userData);
    return result;
  } catch (error) {
    console.error("Error creating user from webhook:", error);
    throw error;
  }
};

// Add these new functions
export const getUserNotifications = async (
  userId: number,
  repo: UserRepositoryType
) => {
  try {
    const notifications = await repo.getUserNotifications(userId);
    return notifications;
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    throw error;
  }
};

export const markNotificationAsSeen = async (
  notificationId: number,
  repo: UserRepositoryType
) => {
  try {
    await repo.markNotificationAsSeen(notificationId);
  } catch (error) {
    console.error("Error marking notification as seen:", error);
    throw error;
  }
};

export const markAllNotificationsAsSeen = async (
  userId: number,
  repo: UserRepositoryType
) => {
  await repo.markAllNotificationsAsSeen(userId);
};

export const markAllChatNotificationsAsSeen = async (
  userId: number,
  repo: UserRepositoryType
) => {
  await repo.markAllChatNotificationsAsSeen(userId);
};
