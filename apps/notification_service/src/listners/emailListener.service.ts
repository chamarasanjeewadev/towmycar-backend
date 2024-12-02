import { EventEmitter } from "events";
import {
  BaseNotificationType,
  NotificationType,
  UserNotificationEventPayload,
  driverNotificationEmailType,
} from "@towmycar/common";
import { sendEmail } from "../service/email.service";
import { NotificationRepository } from "../repository/notification.repository";

export function registerEmailListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.EMAIL}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: driverNotificationEmailType[]) => {
      const processPromises = payload.map(async payloadData => {
        try {
          const isAlreadySent = false;
          // await NotificationRepository.checkNotificationSent({
          //   userId: payloadData.driver.id,
          //   notificationType: NotificationType.DRIVER_NOTIFICATION,
          //   deliveryType: BaseNotificationType.EMAIL,
          //   breakdownRequestId: payloadData.breakdownRequestId.toString()
          // });

          if (isAlreadySent) {
            console.log(
              `Email already sent for driver: ${payloadData.driver.id}`
            );
            return;
          }

          await sendEmail(NotificationType.DRIVER_NOTIFICATION, payloadData);
        } catch (error) {
          console.error(
            `Failed to process email for driver ${payloadData.driver.id}:`,
            error
          );
        }
      });

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing email notifications:", error);
      }
    }
  );

  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationEventPayload) => {
      // modify payload as push notification expects
    }
  );
}
