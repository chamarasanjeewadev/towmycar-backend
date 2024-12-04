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
      const { drivers } = payload;

      // Create individual SMS notifications for each driver
      const smsForDrivers = drivers.map(driver => {
        const userWithDriver: UserWithDriver = {
          userId: driver.userId,
          email: driver.email,
          firstName: driver.firstName,
          lastName: driver.lastName,
          phoneNumber: driver.phoneNumber,
          driver: {
            id: driver.id,
            phoneNumber: driver.phoneNumber,
          },
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

  // New DRIVER_REGISTERED listener
  emitter.on(NotificationType.DRIVER_REGISTERED, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.DRIVER_REGISTERED,
      payload,
    });
  });

  // New USER_REQUEST listener
  emitter.on(NotificationType.USER_REQUEST, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.USER_REQUEST,
      payload,
    });
  });

  // New USER_CREATED listener
  emitter.on(NotificationType.USER_CREATED, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.USER_CREATED,
      payload,
    });
  });

  // New USER_ACCEPT listener
  emitter.on(NotificationType.USER_ACCEPT, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.USER_ACCEPT,
      payload,
    });
  });

  // New DRIVER_REJECT listener
  emitter.on(NotificationType.DRIVER_REJECT, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.DRIVER_REJECT,
      payload,
    });
  });

  // New DRIVER_QUOTATION_UPDATED listener
  emitter.on(NotificationType.DRIVER_QUOTATION_UPDATED, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.DRIVER_QUOTATION_UPDATED,
      payload,
    });
  });

  // New DRIVER_ASSIGNED listener
  emitter.on(NotificationType.DRIVER_ASSIGNED, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.DRIVER_ASSIGNED,
      payload,
    });
  });

  // New DRIVER_QUOTE listener
  emitter.on(NotificationType.DRIVER_QUOTED, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.DRIVER_QUOTED,
      payload,
    });
  });

  // New DRIVER_ACCEPT listener
  emitter.on(NotificationType.DRIVER_ACCEPT, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.DRIVER_ACCEPT,
      payload,
    });
  });

  // New USER_REJECT listener
  emitter.on(NotificationType.USER_REJECT, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.USER_REJECT,
      payload,
    });
  });

  // New RATING_REVIEW listener
  emitter.on(NotificationType.RATING_REVIEW, async payload => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.SMS,
      subType: NotificationType.RATING_REVIEW,
      payload,
    });
  });
}
