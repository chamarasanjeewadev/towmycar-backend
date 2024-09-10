import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand, AdminSetUserPasswordCommand, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { v4 as uuidv4 } from 'uuid';

let client: CognitoIdentityProviderClient = new CognitoIdentityProviderClient({ region: "us-east-1" });
let userPoolId: string = "us-east-1_LWZQeja8g";

export const createUser = async (username: string, email: string, temporaryPassword: string) => {
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

export const addUserToGroup = async (email: string, groupName: string) => {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: userPoolId,
    Username: email,
    GroupName: groupName,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error("Error adding user to group in Cognito:", error);
    throw error;
  }
};

export const adminSetUserPassword = async (username: string, password: string) => {
  const command = new AdminSetUserPasswordCommand({
    UserPoolId: userPoolId,
    Username: username,
    Password: password,
    Permanent: true,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.error("Error setting permanent password for user in Cognito:", error);
    throw error;
  }
};

export const checkUserExistsInCognito = async (email: string): Promise<boolean> => {
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

export const createUserInCognito = async (userData: {
  email: string;
  firstName: string;
  lastName: string;
  // Add other necessary fields
}) => {
  const temporaryPassword = generateTemporaryPassword();
  const username = generateRandomUsername();
  await createUser(username, userData.email, temporaryPassword);
  
  // Optionally, set additional user attributes or add user to a group
  // await addUserToGroup(username, "CustomersGroup");
  
  // Optionally, set a permanent password
  // await adminSetUserPassword(username, permanentPassword);

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