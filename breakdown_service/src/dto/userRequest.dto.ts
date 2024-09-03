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

export const UserEditRequestSchema = Type.Object({
  id: Type.Integer(),
  email: Type.String(),
});

export type UserEditRequestInput = Static<typeof UserEditRequestSchema>;
