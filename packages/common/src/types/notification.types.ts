import { NearbyDriver, UserWithCustomer } from "./types";

interface FcmNotificationPayloadType {
  userId: number;
  title?: string;
  message?: string;
  url?: string;
  breakdownId?: string;
  quotationId?: string;
  // Add any other relevant fields
}
export interface UserNotificationEventPayload {
  user: UserWithCustomer;
  requestId: number;
  driver: NearbyDriver;
  location: Location;
  toLocation: Location;
  createdAt: Date;
  viewRequestLink: string;
  googleMapsLink: string;
}

export interface DriverNotifyEventPayload {
  drivers: NearbyDriver[];
  requestId: number;
  user: UserWithCustomer; // Updated type
  location: Location;
  toLocation: Location;
  createdAt: Date;
  viewRequestLink: string;
  googleMapsLink: string;
}

export interface NotificationPayload {
  userId: number;
  message: string;
  recipientPhoneNumber?: string; // for SMS
  title?: string; // for Push
  url?: string; // for Push
}

export interface PushNotificationPayloadForDrivers {
  drivers: NearbyDriver[];
  pushMessage: NotificationPayload;
}

export interface SmsNotificationPayloadForDrivers {
  drivers: NearbyDriver[];
  smsMessage: NotificationPayload;
}
