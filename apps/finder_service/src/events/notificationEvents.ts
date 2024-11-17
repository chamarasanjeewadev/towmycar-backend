import { NearbyDriver } from "../types/types";

export interface Location {
  latitude: number;
  longitude: number;
}

export const NOTIFICATION_EVENTS = {
  NOTIFY_DRIVERS: 'notify-drivers'
} as const;

export interface DriverNotificationEventPayload {
  driver: NearbyDriver;
  requestId: number;
  user: UserWithCustomer; // Updated type
  location: Location;
  toLocation: Location;
  createdAt: Date;
  viewRequestLink: string;
  googleMapsLink: string;
}

// Import this from your shared types or define here
interface UserWithCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  customer?: {
    id: string;
    phoneNumber?: string;
  };
} 