import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminAddUserToGroupCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { v4 as uuidv4 } from "uuid";
import { UserGroup } from "../../enums";
import { COGNITO_USER_POOL_ID } from '../../config';

let client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({
  region: "us-east-1",
});
let userPoolId: string = COGNITO_USER_POOL_ID;

export const createUserInCognito = async (
  username: string,
  email: string,
  temporaryPassword: string
) => {
  const command = new AdminCreateUserCommand({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "email_verified", Value: "true" },
    ],
    TemporaryPassword: temporaryPassword,
  });

  try {
    console.log("Creating user in Cognito:", email);
    await client.send(command);
  } catch (error) {
    console.error("Error creating user in Cognito:", error);
    throw error;
  }
};

export const addUserToGroup = async (email: string, group: UserGroup) => {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: userPoolId,
    Username: email,
    GroupName: group,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error("Error adding user to group in Cognito:", error);
    throw error;
  }
};

export const adminSetUserPassword = async (
  username: string,
  password: string
) => {
  const command = new AdminSetUserPasswordCommand({
    UserPoolId: userPoolId,
    Username: username,
    Password: password,
    Permanent: true,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error(
      "Error setting permanent password for user in Cognito:",
      error
    );
    throw error;
  }
};

export const checkUserExistsInCognito = async (
  email: string
): Promise<boolean> => {
  const command = new AdminGetUserCommand({
    UserPoolId: userPoolId,
    Username: email,
  });

  try {
    await client.send(command);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "UserNotFoundException") {
      return false;
    }
    console.error("Error checking if user exists in Cognito:", error);
    throw error;
  }
};

export const createTempUserInCognito = async (userData: {
  email: string;

  // Add other necessary fields
}) => {
  const temporaryPassword = generateTemporaryPassword();
  const username = generateRandomUsername();
  await createUserInCognito(username, userData.email, temporaryPassword);

  return username;
};

// Helper function to generate a temporary password (implement as needed)
function generateTemporaryPassword(): string {
  // Implement password generation logic
  return "TemporaryPass123!";
}

// Helper function to generate a random username
function generateRandomUsername(): string {
  return `user_${uuidv4().substring(0, 8)}`;
}

export const updateUserInCognito = async (
  email: string,
  newUsername: string,
  newPassword: string
): Promise<boolean> => {
  try {
    const userExists = await checkUserExistsInCognito(email);
    if (!userExists) {
      console.log("User not found in Cognito:", email);
      return false;
    }

    // Update username
    const updateCommand = new AdminUpdateUserAttributesCommand({
      UserPoolId: userPoolId,
      Username: email,
      UserAttributes: [
        { Name: "preferred_username", Value: newUsername },
      ],
    });

    await client.send(updateCommand);

    // Update password separately
    await adminSetUserPassword(email, newPassword);

    console.log("User updated successfully in Cognito:", email);
    return true;
  } catch (error) {
    console.error("Error updating user in Cognito:", error);
    throw error;
  }
};
