import { BaseNotificationType, NotificationType } from "../enums";

interface Driver {
  firstName: string;
  lastName: string;
}

interface User {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export type NotificationPayload = {
  breakdownRequestId: number;
  location: Location;
  driver: UserWithDriver;
  user: UserWithCustomer;
  googleMapsLink: string | null;
  viewRequestLink: string;
  createdAt: Date;
};

export interface PushNotificationPayload {
  userId: number;
  requestId?: number;
  title: string;
  message: string;
  url?: string;
}

export interface PushNotificationPayloadForDrivers {
  drivers: NearbyDriver[];
  pushMessage: PushNotificationPayload;
}

export interface EmailPayloadForDrivers {
  drivers: NearbyDriver[];
  pushMessage: NotificationPayload & EmailPayloadType;
}

export type EmailPayloadType = {
  recipientEmail: string;
  subject: string;
  textBody?: string;
  htmlBody?: string;
};

export type BreakdownNotificationType = {
  type: BaseNotificationType;
  subType: NotificationType;
  payload: DriverNotificationEmailType[] | any;
};

export type DriverNotificationEmailType = EmailPayloadType &
  NotificationPayload;

export type NearbyDriver = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  vehicleType: string;
  vehicleWeightCapacity: string | number;
  distance: number;
};
export interface UserWithCustomer {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  customer?: {
    id: string | number;
    phoneNumber?: string;
  };
}
export interface UserWithDriver {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  driver?: {
    id: number;
    phoneNumber?: string;
  };
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

export interface DriverQuotedEventPayload {
  requestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
}

export interface DriverAcceptedEventPayload {
  requestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
}

export interface DriverRejectedEventPayload {
  requestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
}

export interface DriverClosedEventPayload {
  requestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
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
