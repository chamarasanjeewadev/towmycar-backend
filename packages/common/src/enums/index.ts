import { DocumentMetadataEnum } from "@aws-sdk/client-ssm";

export enum UserGroup {
  USER = "user",
  ADMIN = "admin",
  DRIVER = "driver",
}

export enum MailSender{
  SES="SES",
  MAILERSENDER="MAILERSENDER",
  RESEND="RESEND"
}

export const notificationIcons = {
  DRIVER_REGISTERED: "🧰", // Toolbox, representing driver registration or preparation
  USER_REQUEST: "🗣️", // Speaking head, representing a user request or inquiry
  USER_CREATED: "🎉", // Party popper, celebrating new user creation
  USER_ACCEPTED: "🤝", // Handshake, symbolizing user acceptance
  DRIVER_REJECTED: "🚷", // No entry, representing driver rejection
  DRIVER_CLOSED: "🔒", // Lock, representing closure or locked status
  DRIVER_QUOTATION_UPDATED: "📝", // Bar chart, symbolizing an updated quotation or estimate
  DRIVER_ASSIGNED: "🛻", // Tow truck, representing the driver being assigned to the request
  DRIVER_QUOTED: "💰", // Money bag, symbolizing the quote given by the driver
  DRIVER_ACCEPTED: "🚀", // Rocket, representing the driver's acceptance and moving forward
  DRIVER_NOTIFICATION: "📲", // Mobile phone, representing a notification for the driver
  USER_NOTIFICATION: "🔔", // Bell, representing a notification for the user
  USER_REJECTED: "❌", // Cross mark, symbolizing user rejection
  RATING_REVIEW: "⭐", // Trophy, symbolizing rating or review (success)
  DRIVER_CHAT_INITIATED: "💬", // Speech bubble, representing chat initiation by driver
  USER_CHAT_INITIATED: "💬", // Speech bubble, representing chat initiation by user
  ADMIN_APPROVAL_REQUEST: "📝", // Clipboard, representing admin approval request
};
// const notificationIcons = {
//   DRIVER_REGISTERED: "📝", // Notepad, representing the driver registration
//   USER_REQUEST: "📱", // Mobile phone, representing a user request
//   USER_CREATED: "🆕", // New user created
//   USER_ACCEPTED: "🤝", // Handshake, representing user acceptance
//   DRIVER_REJECTED: "❌", // Cross mark for rejection
//   DRIVER_CLOSED: "🔒", // Lock symbol, indicating the driver closed the request
//   DRIVER_QUOTATION_UPDATED: "💸", // Money with wings, indicating a quotation update
//   DRIVER_ASSIGNED: "🚗", // Car, representing the driver being assigned
//   DRIVER_QUOTED: "💵", // Dollar bills, representing the driver quoting a price
//   DRIVER_ACCEPTED: "🎉", // Party popper, celebrating the driver accepting the request
//   DRIVER_NOTIFICATION: "📲", // Mobile phone, representing a notification for the driver
//   USER_NOTIFICATION: "🔔", // Bell, representing a notification for the user
//   USER_REJECTED: "🚫", // Prohibited icon for user rejection
//   RATING_REVIEW: "⭐", // Star, representing rating or review
//   DRIVER_CHAT_INITIATED: "💬", // Speech bubble, representing chat initiation by driver
//   USER_CHAT_INITIATED: "💬", // Speech bubble, representing chat initiation by user
//   ADMIN_APPROVAL_REQUEST: "✅", // Check mark, representing admin approval request
// };

export enum NotificationType {
  DRIVER_REGISTERED = "DRIVER_REGISTERED",
  USER_REQUEST = "USER_REQUEST",
  USER_CREATED = "USER_CREATED",
  USER_ACCEPTED = "USER_ACCEPTED",
  DRIVER_REJECTED = "DRIVER_REJECTED",
  DRIVER_CLOSED = "DRIVER_CLOSED",
  DRIVER_QUOTATION_UPDATED = "DRIVER_QUOTATION_UPDATED",
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  DRIVER_QUOTED = "DRIVER_QUOTED",
  DRIVER_ACCEPTED = "DRIVER_ACCEPTED",
  DRIVER_NOTIFICATION = "DRIVER_NOTIFICATION",
  USER_NOTIFICATION = "USER_NOTIFICATION",
  USER_REJECTED = "USER_REJECTED",
  RATING_REVIEW = "RATING_REVIEW",
  DRIVER_CHAT_INITIATED = "DRIVER_CHAT_INITIATED",
  USER_CHAT_INITIATED = "USER_CHAT_INITIATED",
  ADMIN_APPROVAL_REQUEST = "ADMIN_APPROVAL_REQUEST",
  DRIVER_CREATED_ADMIN_NOTIFICATION="DRIVER_CREATED_ADMIN_NOTIFICATION",
  ADMIN_CONTACTUS_NOTIFICATION="ADMIN_CONTACTUS_NOTIFICATION"
}

export enum DriverStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  QUOTED = "QUOTED",
  PENDING = "PENDING",
  CLOSED = "CLOSED",
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
}

export enum UserStatus {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  CLOSED = "CLOSED",
}

export enum DeliveryNotificationType {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
}

export enum BreakdownRequestStatus {
  INPROGRESS = "INPROGRESS",
  WAITING = "WAITING",
  CLOSED = "CLOSED",
  QUOTED = "QUOTED",
}

export enum BreakdownRequestClosedBy {
  ADMIN = "ADMIN",
  DRIVER = "DRIVER",
  SYSTEM = "SYSTEM",
}

export enum DriverApprovalStatus {
  INITIAL = "INITIAL",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum DriverAvailabilityStatus {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
}

export enum DocumentApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  UPLOADED = "UPLOADED",
}

export enum DeliveryTimeframe {
  ASAP = "ASAP",
  WITHIN_DAY = "WITHIN_DAY",
  WITHIN_WEEK = "WITHIN_WEEK",
  WITHIN_MONTH = "WITHIN_MONTH",
}

export enum UploadDocumentType {
  DRIVER_LICENSE_FRONT = "DRIVER_LICENSE_FRONT",
  DRIVER_LICENSE_BACK = "DRIVER_LICENSE_BACK",
  VEHICLE_REGISTRATION = "VEHICLE_REGISTRATION",
  VEHICLE_INSURANCE = "VEHICLE_INSURANCE",
  VEHICLE_PHOTO = "VEHICLE_PHOTO",
  PUBLIC_LIABILITY_INSURANCE = "PUBLIC_LIABILITY_INSURANCE",
}

export enum SmsNotificationType {
  DRIVER_ASSIGNED = "DRIVER_ASSIGNED",
  REQUEST_STATUS_UPDATE = "REQUEST_STATUS_UPDATE",
  PAYMENT_CONFIRMATION = "PAYMENT_CONFIRMATION",
}

export enum MessageSender {
  Driver = "driver",
  Customer = "customer",
}
