import { EventEmitter } from "events";

import {
  BaseNotificationType,
  sendNotification,
  DriverNotifyEventPayload,
  NotificationType,
  UserNotificationEventPayload,
  NotificationPayload,
  UserWithDriver,
} from "@towmycar/common";

export function registerSmsNotificationListener(emitter: EventEmitter) {
  emitter.on(
    NotificationType.DRIVER_NOTIFICATION,
    async (payload: DriverNotifyEventPayload) => {
      const {
        drivers,
      } = payload;

      // Create individual SMS notifications for each driver
      const smsForDrivers = drivers.map(driver => {

        const userWithDriver: UserWithDriver = {
          id: driver.userId,
          email: driver.email,
          firstName: driver.firstName,
          lastName: driver.lastName,
          phoneNumber: driver.phoneNumber,
          driver: {
            id: driver.id,
            phoneNumber: driver.phoneNumber,
          }
        };
         const smsPayload: NotificationPayload = {
          driver: userWithDriver,
          location: payload.location,
          breakdownRequestId: payload.requestId,
          user: payload.user,
          viewRequestLink: payload.viewRequestLink,
          createdAt: payload.createdAt,
          googleMapsLink: payload.googleMapsLink,
        };

       
        return smsPayload;
      });

      // Send individual SMS notifications
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.SMS,
        subType: NotificationType.DRIVER_NOTIFICATION,
        payload: smsForDrivers,
      });
    }
  );

  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationEventPayload) => {
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.SMS,
        subType: NotificationType.USER_NOTIFICATION,
        payload,
      });
    }
  );
}
