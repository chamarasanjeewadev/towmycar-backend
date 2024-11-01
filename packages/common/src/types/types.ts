import {
  BaseNotificationType,
  EmailNotificationType,
  PushNotificationType,
} from "../enums";

interface Driver {
  firstName: string;
  lastName: string;
}

interface User {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export type DriverNotificationEmailPayload = {
  breakdownRequestId: number;
  location: string;
  driver: Driver;
  user: User;
  googleMapsLink: string|null;
  viewRequestLink: string;
  createdAt: Date;
};

export type BreakdownRequestDriverNotificationPayload = {};

export interface PushNotificationPayload {
  userId: number;
  title: string;
  message: string;
  url?: string;
}

export type FcmNotificationPayloadType = {
  userId: number;
  title: string;
  message: string;
  url: string;
};

export type EmailPayloadType = {
  recipientEmail: string;
  subject: string;
  textBody: string;
  htmlBody: string;
};

export type BreakdownNotificationType = {
  type: BaseNotificationType;
  subType: EmailNotificationType | PushNotificationType;
  payload: PushNotificationPayload | DriverNotificationEmailPayload;
};

export type EmailPayloadBaseType = DriverNotificationEmailPayload;
