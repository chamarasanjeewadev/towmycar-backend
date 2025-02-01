import {
  DriverApprovalStatus,
  MessageSender,
  NotificationType,
  UserStatus,
} from "../enums";

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
  | DriverQuotationUpdatedPayload
  | DriverAcceptPayload
  | UserRejectPayload
  | ChatNotificationPayload
  | RatingReviewPayload
  | AdminApprovalRequestPayload
  |ContactUsPayload
  | DriverCreatedAdminNotificationPayload;


  export type EventPayload=DriverNotifyEventPayload|
  DriverQuotedEventPayload|
  DriverQuotedPayload|
  UserAcceptedPayload|
  UserAcceptedEventPayload|
  UserRejectedPayload|
  DriverClosedEventPayload|
  ChatNotificationEventPayload|
  DriverQuotationUpdatedPayload|
  AdminApprovalRequestPayload|
  DriverCreatedAdminNotificationEventPayload|
  DriverCreatedAdminNotificationPayload|ContactUsPayload;

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
  deliveryDistance?: string;
  pickupDistance?: string;
  primaryLocation?: { latitude: number; longitude: number };
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
export interface UserWithAdmin {
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
  explanation: string;
  viewRequestLink: string;
}

export interface UserInfo{
  
    userId: number;
    role: string;
    customerId?: number;
    driverId?: number;
    stripeCustomerId?: string;
  
}

export interface AdminApprovalRequestPayload {
  driver: UserWithDriver;
  admins: UserWithAdmin[];
  user: UserWithCustomer;
  viewRequestLink: string;
  breakdownRequestId?: number; // TODO: remove this
  sendToId?: number;
  userId?: number;
}

export interface DriverCreatedAdminNotificationPayload {
  userInfo:UserInfo
   driver?: UserWithDriver;
  admins?: UserWithAdmin[];
   user?: UserWithCustomer;
  viewRequestLink: string;
  sendToId?: number;
  userId?: number;
  breakdownRequestId?:number;
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
  vehicleNo?: string;
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
  sender: MessageSender;
}

export interface DriverCreatedAdminNotificationEventPayload {
  userInfo:UserInfo;
  // driver: UserWithDriver;
  // admins: UserWithAdmin[];
  // user: UserWithCustomer;
  // viewRequestLink: string;
  // breakdownRequestId?: number; // TODO: remove this
  // sendToId?: number;
  // userId?: number;
}

export interface ContactUsPayload {
  firstName?: string;
  lastName?:string;
  email?: string;
  message: string;
  admins?:UserWithAdmin[];
  viewRequestLink?  :string;
  sendToId?: number;
  userId?: number;
  breakdownRequestId?:number;
  user:UserWithCustomer;
  driver:UserWithDriver;
}
export interface ContactUsEventPayload {
  firstName?: string;
  lastName?:string;
  email: string;
  message: string;
}
export interface DriverNotifyEventPayload {
  drivers: NearbyDriver[];
  breakdownRequestId: number;
  user: UserWithCustomer; // Updated type
  location: Location;
  toLocation: Location;
  createdAt: Date;
  viewRequestLink: string;
  make: string;
  model: string;
  googleMapsLink: string;
}

// Base notification payload interface
export interface BaseNotificationPayload {
  sendToId: number;
  breakdownRequestId?: number;
  viewRequestLink?: string;
  user?: UserWithCustomer;
  driver?: UserWithDriver;
  createdAt?: Date;
}

// Driver Registration
export interface DriverRegisteredPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  verificationLink?: string;
}

export interface ChatNotificationPayload extends BaseNotificationPayload {
  driverId: number;
  userId: number;
  sender: MessageSender;
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
export interface UserAcceptedPayload extends BaseNotificationPayload {
  userStatus?:UserStatus,
  userId?:number
}
export interface UserRejectedPayload extends BaseNotificationPayload {
  userStatus:UserStatus
  userId?:number
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
  explanation?: string;
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
  explanation?: string;
}

// Driver Accept
export interface DriverAcceptPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  price: number;
  estimation: number;
  vehicleNo: string;
  description?: string;
}

// Driver Notification
export interface DriverNotificationPayload extends BaseNotificationPayload {
  driver: UserWithDriver;
  user: UserWithCustomer;
  location: Location;
  make: string;
  model: string;
  vehicleWeight: string;
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
  pickupDistance?: string;
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
    deliveryDistance?: string;
  };
  driver: {
    id: number;
    userId: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
    vehicleType: string;
    regNo: string;
    phoneNumber: string;
    approvalStatus: DriverApprovalStatus;
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
