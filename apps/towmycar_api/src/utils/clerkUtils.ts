import { clerkClient, User } from '@clerk/clerk-sdk-node';

/**
 * Retrieves a Clerk user by their user ID.
 * @param clerkUserId The Clerk user ID to look up.
 * @returns A Promise that resolves to the Clerk User object.
 * @throws An error if the user is not found or if there's an issue with the Clerk API.
 */
export async function getClerkUser(clerkUserId: string): Promise<User> {
  try {
    const user = await clerkClient.users.getUser(clerkUserId);
    if (!user) {
      throw new Error(`User not found for Clerk ID: ${clerkUserId}`);
    }
    return user;
  } catch (error) {
    console.error(`Error fetching Clerk user: ${error}`);
    throw error;
  }
}
