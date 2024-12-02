import { EventEmitter } from "events";
import {
  BaseNotificationType,
  NotificationPayload,
  NotificationType,
  UserNotificationEventPayload,
  driverNotificationEmailType,
} from "@towmycar/common";
import { SMSNotificationService } from "../service/sms.service";

export function registerSmsNotificationListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.SMS}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: driverNotificationEmailType[]) => {
      const processPromises = payload.map(async payloadData => {
        try {
          const isAlreadySent = false;
          // await NotificationRepository.checkNotificationSent({
          //   userId: payloadData.driver.id,
          //   notificationType: NotificationType.DRIVER_NOTIFICATION,
          //   deliveryType: BaseNotificationType.SMS,
          //   breakdownRequestId: payloadData.breakdownRequestId.toString()
          // });

          if (isAlreadySent) {
            console.log(
              `SMS already sent for driver: ${payloadData.driver.id}`
            );
            return;
          }

          if (!payloadData.driver.phoneNumber) {
            console.warn(
              `No phone number available for driver ${payloadData.driver.id}`
            );
            return;
          }

          await SMSNotificationService.sendSMSNotification(
            NotificationType.DRIVER_NOTIFICATION,
            {
              ...payloadData,
              viewRequestLink: payloadData.viewRequestLink,
            }
          );

          console.log(
            `SMS notification sent successfully to driver ${payloadData.driver.id}`
          );
        } catch (error) {
          console.error(
            `Failed to process SMS for driver ${payloadData.driver.id}:`,
            error
          );
        }
      });

      try {
        await Promise.allSettled(processPromises);
      } catch (error) {
        console.error("Error processing SMS notifications:", error);
      }
    }
  );

  emitter.on(
    `${BaseNotificationType.SMS}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: NotificationPayload) => {
      try {
        if (!payload.user.phoneNumber) {
          console.warn(`No phone number available for user ${payload.user.id}`);
          return;
        }

        await SMSNotificationService.sendSMSNotification(
          NotificationType.USER_REQUEST,
          {
            ...payload,
            viewRequestLink: payload.viewRequestLink,
          }
        );

        console.log(
          `SMS notification sent successfully to user ${payload.user.id}`
        );
      } catch (error) {
        console.error("Failed to process user SMS notification:", error);
      }
    }
  );
}
