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

export function registerPushNotificationListener(emitter: EventEmitter) {
  emitter.on(
    NotificationType.DRIVER_NOTIFICATION,
    async (payload: DriverNotifyEventPayload) => {
      const { drivers } = payload;
      // Create individual push notifications for each driver
      const pushNotificationsForDrivers = drivers.map(driver => {
        const userWithDriver: UserWithDriver = {
          id: driver.userId,
          email: driver.email,
          firstName: driver.firstName,
          lastName: driver.lastName,
          phoneNumber: driver.phoneNumber,
          driver: {
            id: driver.id,
            phoneNumber: driver.phoneNumber,
          },
        };
        const pushPlayload: NotificationPayload = {
          driver: userWithDriver,
          location: payload.location,
          breakdownRequestId: payload.requestId,
          user: payload.user,
          viewRequestLink: payload.viewRequestLink,
          createdAt: payload.createdAt,
          googleMapsLink: payload.googleMapsLink,
        };

        return pushPlayload;
      });

      // Send individual push notifications
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.PUSH,
        subType: NotificationType.DRIVER_NOTIFICATION,
        payload: pushNotificationsForDrivers,
      });
    }
  );

  // Keep USER_NOTIFICATION handler unchanged
  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationEventPayload) => {
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.PUSH,
        subType: NotificationType.USER_NOTIFICATION,
        payload,
      });
    }
  );
}
