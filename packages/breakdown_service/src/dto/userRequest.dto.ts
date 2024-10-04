import { Static, Type } from "@sinclair/typebox";

export const UserRequestSchema = Type.Object({
  name: Type.String(),
  email: Type.String(),
});

export interface UserRequestInput {
  firstName: string;
  lastName: string;
  email: string;
  postcode: string;
  vehicleRegistration: string;
  mobileNumber: string;
}

export interface UserRegisterInput {
  username?: string;
  email: string;
  password?: string;
}

export const UserEditRequestSchema = Type.Object({
  id: Type.Integer(),
  email: Type.String(),
});

export type UserEditRequestInput = Static<typeof UserEditRequestSchema>;

export interface UserEmail {
  email_address: string;
}

export interface UnsafeMetadata {
  role: string;
}

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  email_addresses: UserEmail[];
  unsafe_metadata: UnsafeMetadata;
}
