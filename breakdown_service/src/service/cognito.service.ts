import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";

let client: CognitoIdentityProviderClient=new CognitoIdentityProviderClient({ region: "us-east-1" });;
let userPoolId: string="us-east-1_LWZQeja8g";

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