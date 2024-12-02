import { EventEmitter } from "events";
import {
  BaseNotificationType,
  NotificationPayload,
  NotificationType,
  driverNotificationEmailType,
} from "@towmycar/common";
import { UserNotificationService } from "../service/notification.service";

export function registerPushNotificationListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.PUSH}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: driverNotificationEmailType[]) => {
      const processPromises = payload.map(async payloadData => {
        try {
          const isAlreadySent = false;
          // await NotificationRepository.checkNotificationSent({
          //   userId: payloadData.driver.id,
          //   notificationType: NotificationType.DRIVER_NOTIFICATION,
          //   deliveryType: BaseNotificationType.PUSH,
          //   breakdownRequestId: payloadData.breakdownRequestId.toString()
          // });

          if (isAlreadySent) {
            console.log(
              `Push notification already sent for driver: ${payloadData.driver.id}`
            );
            return;
          }

          await UserNotificationService.sendPushNotification(
            NotificationType.DRIVER_NOTIFICATION,
            payloadData
          );
        } catch (error) {
          console.error(
            `Failed to process push notification for driver ${payloadData.driver.id}:`,
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
    async (payload: NotificationPayload) => {
      try {
        await UserNotificationService.sendPushNotification(
          NotificationType.USER_NOTIFICATION,
          payload
        );
      } catch (error) {
        console.error(
          "Failed to process user push notification:",
          error
        );
      }
    }
  );
}
