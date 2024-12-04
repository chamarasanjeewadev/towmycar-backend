import { EventEmitter } from "events";
import {
  BaseNotificationType,
  NotificationPayload,
  NotificationType,
  UserNotificationEventPayload,
  DriverNotificationPayload,
} from "@towmycar/common";
import { SMSNotificationService } from "../service/notification.sms.service";

export function registerSmsNotificationListener(emitter: EventEmitter): void {
  emitter.on(
    `${BaseNotificationType.SMS}:${NotificationType.DRIVER_NOTIFICATION}`,
    async (payload: DriverNotificationPayload[]) => {
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
              `SMS already sent for driver: ${payloadData.driver.userId}`
            );
            return;
          }

          if (!payloadData.driver.phoneNumber) {
            console.warn(
              `No phone number available for driver ${payloadData.driver.userId}`
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
            `SMS notification sent successfully to driver ${payloadData.driver.userId}`
          );
        } catch (error) {
          console.error(
            `Failed to process SMS for driver ${payloadData.driver.userId}:`,
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
    `${BaseNotificationType.SMS}:${NotificationType.USER_REQUEST}`,
    async (payload: NotificationPayload) => {
      try {
        if (!payload.user?.phoneNumber) {
          console.warn(
            `No phone number available for user ${payload.user?.id}`
          );
          return;
        }
        await SMSNotificationService.sendSMSNotification(
          NotificationType.USER_REQUEST,
          payload
        );
      } catch (error) {
        console.error("Failed to send USER_REQUEST SMS:", error);
      }
    }
  );

  emitter.on(
    `${BaseNotificationType.SMS}:${NotificationType.DRIVER_REGISTERED}`,
    async (payload: NotificationPayload) => {
      try {
        if (!payload.user?.phoneNumber) {
          console.warn(
            `No phone number available for user ${payload.user?.id}`
          );
          return;
        }
        await SMSNotificationService.sendSMSNotification(
          NotificationType.DRIVER_REGISTERED,
          payload
        );
      } catch (error) {
        console.error("Failed to send DRIVER_REGISTERED SMS:", error);
      }
    }
  );

  emitter.on(
    `${BaseNotificationType.SMS}:${NotificationType.USER_NOTIFICATION}`,
    async (payload: UserNotificationEventPayload) => {
      try {
        if (!payload.user?.phoneNumber) {
          console.warn(
            `No phone number available for user ${payload.user?.id}`
          );
          return;
        }
        await SMSNotificationService.sendSMSNotification(
          NotificationType.USER_NOTIFICATION,
          payload as any
        );
      } catch (error) {
        console.error("Failed to send USER_NOTIFICATION SMS:", error);
      }
    }
  );

  const remainingTypes = [
    NotificationType.USER_CREATED,
    NotificationType.USER_ACCEPT,
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
      `${BaseNotificationType.SMS}:${type}`,
      async (payload: NotificationPayload) => {
        try {
          if (!payload.user?.phoneNumber) {
            console.warn(
              `No phone number available for user ${payload.user?.id}`
            );
            return;
          }
          await SMSNotificationService.sendSMSNotification(type, payload);
        } catch (error) {
          console.error(`Failed to send ${type} SMS:`, error);
        }
      }
    );
  });
}
