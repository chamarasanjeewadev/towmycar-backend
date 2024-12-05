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
  sendToId: number;
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
  subType: NotificationType;
  payload: DriverNotificationPayload[] | any;
};


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
export interface UserNotificationNotificationpayload {
  sendTo: number;
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

// Base notification payload interface
export interface BaseNotificationPayload {
  sendToId: number;
  breakdownRequestId: number;
  viewRequestLink: string;
  createdAt?: Date;
}

// Driver Registration
export interface DriverRegisteredPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  verificationLink?: string;
}

// User Request
export interface UserRequestPayload extends BaseNotificationPayload {
  user: UserWithCustomer;
  location: Location;
  toLocation: Location;
  googleMapsLink: string;
}

// User Created
export interface UserCreatedPayload extends BaseNotificationPayload {
  user: UserWithCustomer;
  verificationLink?: string;
}

// User Accept
export interface UserAcceptPayload extends BaseNotificationPayload {
  user: UserWithCustomer;
  driver: UserWithDriver;
  price: number;
  estimation: number;
}

// Driver Reject
export interface DriverRejectPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  reason?: string;
}

// Driver Closed
export interface DriverClosedPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  finalPrice: number;
  completionTime: Date;
}

// Driver Quotation Updated
export interface DriverQuotationUpdatedPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  previousPrice: number;
  estimation: number;
}

// Driver Assigned
export interface DriverAssignedPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  location: Location;
  googleMapsLink: string;
}

// Driver Quoted
export interface DriverQuotedPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  price: number;
  estimation: number;
  description?: string;
}

// Driver Accept
export interface DriverAcceptPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  price: number;
  estimation: number;
}

// Driver Notification
export interface DriverNotificationPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  location: Location;
  googleMapsLink: string;
}

// User Notification
export interface UserNotificationPayload extends BaseNotificationPayload {
  user: UserWithCustomer;
  driver: UserWithDriver;
  location: Location;
  googleMapsLink: string;
}

// User Reject
export interface UserRejectPayload extends BaseNotificationPayload {
  user: UserWithCustomer;
  driver: UserWithDriver;
  reason?: string;
}

// Rating Review
export interface RatingReviewPayload extends BaseNotificationPayload {
  reviewer: UserWithCustomer | UserWithDriver;
  reviewee: UserWithCustomer | UserWithDriver;
  rating: number;
  review?: string;
}

// Type mapping for all notification types
export type NotificationPayloadMap = {
  [NotificationType.DRIVER_REGISTERED]: DriverRegisteredPayload;
  [NotificationType.USER_REQUEST]: UserRequestPayload;
  [NotificationType.USER_CREATED]: UserCreatedPayload;
  [NotificationType.USER_ACCEPT]: UserAcceptPayload;
  [NotificationType.DRIVER_REJECT]: DriverRejectPayload;
  [NotificationType.DRIVER_CLOSED]: DriverClosedPayload;
  [NotificationType.DRIVER_QUOTATION_UPDATED]: DriverQuotationUpdatedPayload;
  [NotificationType.DRIVER_ASSIGNED]: DriverAssignedPayload;
  [NotificationType.DRIVER_QUOTED]: DriverQuotedPayload;
  [NotificationType.DRIVER_ACCEPT]: DriverAcceptPayload;
  [NotificationType.DRIVER_NOTIFICATION]: DriverNotificationPayload;
  [NotificationType.USER_NOTIFICATION]: UserNotificationPayload;
  [NotificationType.USER_REJECT]: UserRejectPayload;
  [NotificationType.RATING_REVIEW]: RatingReviewPayload;
};

// Helper type to get payload type for specific notification
export type NotificationPayloadType<T extends NotificationType> =
  NotificationPayloadMap[T];
