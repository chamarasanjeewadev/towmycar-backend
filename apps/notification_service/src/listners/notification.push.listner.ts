import { EventEmitter } from "events";
import {
  BaseNotificationType,
  NotificationPayload,
  NotificationType,
  DriverNotificationPayload,
} from "@towmycar/common";
import { UserNotificationService } from "../service/notification.notification.service";
import { NotificationRepository } from "../repository/notification.repository";

export function registerPushNotificationListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
      const processPromises = payload.map(async payloadData => {
        try {
          const isAlreadySent = false;
          await NotificationRepository.checkNotificationSent({
            userId: payloadData.driver.userId,
            notificationType: NotificationType.DRIVER_NOTIFICATION,
            deliveryType: BaseNotificationType.PUSH,
            breakdownRequestId: payloadData.breakdownRequestId.toString(),
          });

          if (isAlreadySent) {
            console.log(
              `Push notification already sent for driver: ${payloadData.driver.userId}`
            );
            return;
          }

          await UserNotificationService.sendPushNotification(
            NotificationType.DRIVER_NOTIFICATION,
            payloadData
          );
        } catch (error) {
          console.error(
            `Failed to process push notification for driver ${payloadData.driver.userId}:`,
            error
          );
        }
      });

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing push notifications:", error);
      }
    }
  );

  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload) => {
      try {
        await UserNotificationService.sendPushNotification(
          NotificationType.USER_NOTIFICATION,
          payload
        );
      } catch (error) {
        console.error("Failed to process user push notification:", error);
      }
    }
  );

  // USER_REQUEST handler
  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.USER_REQUEST}`,
    async (payload: NotificationPayload) => {
      try {
        await UserNotificationService.sendPushNotification(
          NotificationType.USER_REQUEST,
          payload
        );
      } catch (error) {
        console.error("Failed to send USER_REQUEST push notification:", error);
      }
    }
  );

  // DRIVER_REGISTERED handler
  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload: NotificationPayload) => {
      try {
        await UserNotificationService.sendPushNotification(
          NotificationType.DRIVER_REGISTERED,
          payload
        );
      } catch (error) {
        console.error(
          "Failed to send DRIVER_REGISTERED push notification:",
          error
        );
      }
    }
  );

  // USER_CREATED handler
  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.USER_CREATED}`,
    async (payload: NotificationPayload) => {
      try {
        await UserNotificationService.sendPushNotification(
          NotificationType.USER_CREATED,
          payload
        );
      } catch (error) {
        console.error("Failed to send USER_CREATED push notification:", error);
      }
    }
  );

  // USER_ACCEPT handler
  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.USER_ACCEPT}`,
    async (payload: NotificationPayload) => {
      try {
        await UserNotificationService.sendPushNotification(
          NotificationType.USER_ACCEPT,
          payload
        );
      } catch (error) {
        console.error("Failed to send USER_ACCEPT push notification:", error);
      }
    }
  );

  // Add handlers for remaining notification types...
  const remainingTypes = [
    NotificationType.DRIVER_REJECT,
    NotificationType.DRIVER_QUOTATION_UPDATED,
    NotificationType.DRIVER_ASSIGNED,
    NotificationType.DRIVER_QUOTED,
    NotificationType.DRIVER_ACCEPT,
    NotificationType.USER_REJECT,
    NotificationType.RATING_REVIEW,
  ];

  remainingTypes.forEach(type => {
    emitter.on(
      `${BaseNotificationType.PUSH}:${type}`,
      async (payload: NotificationPayload) => {
        try {
          await UserNotificationService.sendPushNotification(type, payload);
        } catch (error) {
          console.error(`Failed to send ${type} push notification:`, error);
        }
      }
    );
  });
}
