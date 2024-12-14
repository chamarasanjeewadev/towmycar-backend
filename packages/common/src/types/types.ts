import { MessageSender, NotificationType } from "../enums";

export type ListnerPayload =
  // | DriverNotificationPayload[]
  | UserNotificationPayload
  | DriverQuotedPayload
  | UserAcceptedPayload
  | DriverRegisteredPayload
  | UserRequestPayload
  | UserCreatedPayload
  | DriverRejectPayload
  | DriverAssignedPayload
  | DriverAcceptPayload
  | UserRejectPayload
  |ChatNotificationPayload
  | RatingReviewPayload;

export type NotificationPayload = {
  sendToId: number;
  breakdownRequestId: number;
  location: Location;
  driver: UserWithDriver;
  user: UserWithCustomer;
  googleMapsLink: string | null;
  viewRequestLink: string;
  createdAt?: Date;
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
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  driver?: {
    id: number;
    phoneNumber?: string;
  };
}

export interface UserNotificationEventPayload {
  sendToId: number;
  user: UserWithCustomer;
  breakdownRequestId: number;
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
  breakdownRequestId: number;
  driver: NearbyDriver;
  location: Location;
  toLocation: Location;
  createdAt: Date;
  viewRequestLink: string;
  googleMapsLink: string;
}

export interface DriverQuotedEventPayload {
  breakdownRequestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
}

export interface UserAcceptedEventPayload {
  breakdownRequestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  viewRequestLink: string;
}

export interface DriverAcceptedEventPayload {
  breakdownRequestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
}

export interface DriverRejectedEventPayload {
  breakdownRequestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  newPrice: number;
  estimation: number;
  description: string;
  viewRequestLink: string;
}

export interface DriverClosedEventPayload {
  breakdownRequestId: number;
  driver: UserWithDriver;
  user: UserWithCustomer;
  viewRequestLink: string;
}





export interface ChatNotificationEventPayload {
  breakdownRequestId: number;
  viewRequestLink: string;
  driver: UserWithDriver;
  user: UserWithCustomer;
  sender:MessageSender;
}

export interface DriverNotifyEventPayload {
  drivers: NearbyDriver[];
  breakdownRequestId: number;
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
  user: UserWithCustomer;
  driver: UserWithDriver;
  createdAt?: Date;
}

// Driver Registration
export interface DriverRegisteredPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  verificationLink?: string;
}

export interface ChatNotificationPayload extends BaseNotificationPayload {
  driverId:number;
  userId:number;
  sender:MessageSender;
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
export interface UserAcceptedPayload extends BaseNotificationPayload {}
export interface UserRejectedPayload extends BaseNotificationPayload {}

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
  user: UserWithCustomer;
  driver: UserWithDriver;
  rating: number;
  review?: string;
}

// Type mapping for all notification types
export interface BreakdownAssignmentDetails {
  id: number;
  requestId: number;
  driverStatus: string;
  userStatus: string;
  estimation: string;
  explanation: string;
  updatedAt: Date;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  userRequest: {
    id: number;
    customerId: number;
    status: string;
    description: string | null;
    regNo: string | null;
    weight: number | null;
    address: string;
    createdAt: string;
    updatedAt: string;
    make: string | null;
    makeModel: string | null;
    mobileNumber: string | null;
    requestType: string;
  };
  driver: {
    id: number;
    userId:number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
    vehicleType: string;
    regNo: string;
    phoneNumber:string;
    vehicleRegistration: string;
    licenseNumber: string;
    serviceRadius: number;
    workingHours: string;
    experienceYears: number;
    insuranceDetails: string;
    primaryLocation: string;
  };
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string | null;
    mobileNumber: string | null;
  };
}