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

function registerCommonNotificationHandler(
  emitter: EventEmitter,
  notificationType: NotificationType,
  type: BaseNotificationType
) {
  emitter.on(notificationType, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type,
      subType: notificationType,
      payload,
    });
  });
}

export function registerPushNotificationListener(emitter: EventEmitter) {
  // Special case handlers
  emitter.on(
    NotificationType.DRIVER_NOTIFICATION,
    async (payload: DriverNotifyEventPayload) => {
      const { drivers } = payload;
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

      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.PUSH,
        subType: NotificationType.DRIVER_NOTIFICATION,
        payload: pushNotificationsForDrivers,
      });
    }
  );

  // Register common handlers for all other notification types
  const notificationTypes = Object.values(NotificationType).filter(
    type => type !== NotificationType.DRIVER_NOTIFICATION
  );

  notificationTypes.forEach(notificationType => {
    registerCommonNotificationHandler(
      emitter,
      notificationType,
      BaseNotificationType.PUSH
    );
  });
}
