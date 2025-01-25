import { sendPushNotification as sendPush } from "../utils/pushNotificationSender";
import { FcmRepository } from "../repository/fcm.repository";
import {
  PushNotificationPayload,
  NotificationType,
  ListnerPayload,
  maskText,
  DriverAcceptPayload,
  QUOTATION_NO,
} from "@towmycar/common";
import { BatchResponse } from "firebase-admin/lib/messaging/messaging-api";
import { Null } from "@sinclair/typebox";

interface NotificationMessage {
  title: string;
  body: string;
  data?: {
    url?: string;
  };
}

export interface PushNotificationResult {
  success: boolean;
  notificationId?: number;
  error?: string;
  sentTo: string[];
  failedTokens: string[];
}

async function sendGenericPushNotification(
  payload: PushNotificationPayload,
): Promise<PushNotificationResult> {
  const { userId, title, message, url } = payload;

  if (!userId) {
    return {
      success: false,
      error: "User ID is missing in the payload",
      sentTo: [],
      failedTokens: [],
    };
  }

  try {
    const tokens = await FcmRepository.getFcmTokensByUserId(userId);

    if (tokens.length === 0) {
      return {
        success: false,
        error: `No active FCM tokens found for user ${userId}`,
        sentTo: [],
        failedTokens: [],
      };
    }

    const uniqueTokens = Array.from(new Set(tokens.map(t => t.token)));

    const notificationMessage: NotificationMessage = {
      title,
      body: message,
      data: url ? { url } : undefined,
    };
    const batchResponses:BatchResponse=await sendPush(uniqueTokens, notificationMessage)
    return {
      success: batchResponses?.successCount > 0,
      sentTo:null,
      failedTokens:[]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      sentTo: [],
      failedTokens: [],
    };
  }
}

export function generatePushNotificationPayload(
  type: NotificationType,
  payload: ListnerPayload,
): PushNotificationPayload {
  const requestId = payload.breakdownRequestId
    ? `(Request, ${QUOTATION_NO}: ${payload.breakdownRequestId})`
    : "";

  switch (type) {
    case NotificationType.DRIVER_ASSIGNED:
      return {
        userId: payload.sendToId,
        title: `Driver Assigned ${requestId}`,
        message: "A driver has been assigned to your request",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_REGISTERED:
      return {
        userId: payload?.driver?.userId,
        title: `Registration Complete ${requestId}`,
        message: "Your driver registration has been received",
        url: payload?.viewRequestLink,
      };

    case NotificationType.USER_REQUEST:
      return {
        userId: payload.sendToId,
        title: `New Request ${requestId}`,
        message: "Your breakdown assistance request has been received",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTATION_UPDATED:
      return {
        userId: payload?.driver?.userId,
        title: `Quotation Updated ${requestId}`,
        message: `Driver ${maskText(payload?.driver?.firstName ?? "****")} has updated their quotation for your request`,
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_QUOTED:
      return {
        userId: payload.sendToId,
        title: `New Quote Available ${requestId}`,
        message: `Driver ${maskText(payload?.driver?.firstName ?? "****")} has quoted for your request`,
        url: payload?.viewRequestLink,
      };

    case NotificationType.USER_ACCEPTED:
      return {
        userId: payload?.sendToId,
        title: `Quotation Accepted ${requestId}`,
        message: `User ${maskText(payload?.user?.firstName ?? "****")} has accepted your quotation for request ${requestId}`,
        url: payload?.viewRequestLink,
      };
    case NotificationType.DRIVER_ACCEPTED:
      const driverAcceptedPayload=payload as DriverAcceptPayload
      return {
        userId: driverAcceptedPayload?.sendToId,
        title: `Request Accepted ${requestId}`,
        message: `Driver ${driverAcceptedPayload?.driver?.firstName} has accepted your request. 
        estimated cost ${driverAcceptedPayload?.estimation} vehicle no ${driverAcceptedPayload?.vehicleNo}`,
        url: payload?.viewRequestLink,
      };

    case NotificationType.USER_REJECTED:
    case NotificationType.DRIVER_REJECTED:
      return {
        userId: payload.sendToId,
        title: `Request Rejected ${requestId}`,
        message: "Your request has been rejected",
        url: payload?.viewRequestLink,
      };

    case NotificationType.DRIVER_NOTIFICATION:
      return {
        userId: payload?.driver?.userId,
        title: `New Assistance Request ${requestId}`,
        message: "New assistance request is available in your area",
        url: payload?.viewRequestLink,
      };

    case NotificationType.RATING_REVIEW:
      return {
        userId: payload.sendToId,
        title: `New Rating & Review ${requestId}`,
        message: "You have received a new rating and review",
        url: payload?.viewRequestLink,
      };
    case NotificationType.DRIVER_CHAT_INITIATED:
      return {
        userId: payload.sendToId,
        title: `New Chat for ${requestId}`,
        message: "You have received a new Chat message",
        url: payload?.viewRequestLink,
      };
    case NotificationType.USER_CHAT_INITIATED:
      return {
        userId: payload.sendToId,
        title: `New Chat for ${requestId}`,
        message: "You have received a new Chat message",
        url: payload?.viewRequestLink,
      };

    default:
      return {
        userId: payload.sendToId,
        title: `Notification ${requestId}`,
        message: "You have a new notification",
        url: payload?.viewRequestLink,
      };
  }
}

export const UserNotificationService = {
  sendGenericPushNotification,
  generatePushNotificationPayload,
};
