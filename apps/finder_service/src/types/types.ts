import { NearbyDriver, UserWithCustomer } from "@towmycar/common";



export type SingleDriverNotificationType = {
  driver: NearbyDriver;
  user: UserWithCustomer|null;
  requestId: number;
  customerId: number;
  toLocation: { latitude: number; longitude: number } | null;
  location: { latitude: number; longitude: number } | null;
  createdAt: Date;
};

export type BreakdownRequestWithUserDetails = {
  id: number;
  requestType: string | null;
  location: { latitude: number; longitude: number } | null;
  toLocation: { latitude: number; longitude: number } | null;
  description: string | null;
  make: string | null;
  makeModel: string | null;
  regNo: string | null;
  mobileNumber: string | null;
  weight: number | string | null; // Change this to number | null
  status: string;
  createdAt: Date;
  customerId: number;
};
