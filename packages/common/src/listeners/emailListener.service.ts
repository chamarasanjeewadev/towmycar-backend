import { EventEmitter } from "events";
import {
  BaseNotificationType,
  sendNotification,
  DriverNotifyEventPayload,
  NotificationType,
  UserNotificationEventPayload,
  DriverNotificationEmailType,
  UserWithDriver,
  DriverQuotedPayload,
} from "@towmycar/common";

export function registerEmailListener(emitter: EventEmitter): void {
  emitter.on(
    NotificationType.DRIVER_NOTIFICATION,
    async (payload: DriverNotifyEventPayload) => {
      const emailsForDrivers = payload?.drivers.map(driver => {
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

        const emailPlayload: DriverNotificationEmailType = {
          driver: userWithDriver,
          location: payload.location,
          breakdownRequestId: payload.requestId,
          user: payload.user,
          viewRequestLink: payload.viewRequestLink,
          createdAt: payload.createdAt,
          googleMapsLink: payload.googleMapsLink,
          subject: `TowmyCar - Towing Request #${payload.requestId}`,
          recipientEmail: driver.email,
        };

        return emailPlayload;
      });
      // modify payload for email
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: NotificationType.DRIVER_NOTIFICATION,
        payload: emailsForDrivers,
      });
    }
  );

  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationEventPayload) => {
      // modify payload as push notification expects
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: NotificationType.USER_NOTIFICATION,
        payload,
      });
    }
  );

  emitter.on(
    NotificationType.DRIVER_QUOTATION_UPDATED,
    async (payload: DriverQuotedPayload) => {
      // modify payload as push notification expects
      await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: NotificationType.DRIVER_QUOTATION_UPDATED,
        payload,
      });
    }
  );

  emitter.on(NotificationType.DRIVER_REGISTERED, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.DRIVER_REGISTERED,
      payload,
    });
  });

  emitter.on(NotificationType.USER_REQUEST, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.USER_REQUEST,
      payload,
    });
  });

  emitter.on(NotificationType.USER_CREATED, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.USER_CREATED,
      payload,
    });
  });

  emitter.on(NotificationType.USER_ACCEPT, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.USER_ACCEPT,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_REJECT, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.DRIVER_REJECT,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_ASSIGNED, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.DRIVER_ASSIGNED,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_QUOTE, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.DRIVER_QUOTE,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_ACCEPT, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.DRIVER_ACCEPT,
      payload,
    });
  });

  emitter.on(NotificationType.USER_REJECT, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.USER_REJECT,
      payload,
    });
  });

  emitter.on(NotificationType.RATING_REVIEW, async (payload) => {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: BaseNotificationType.EMAIL,
      subType: NotificationType.RATING_REVIEW,
      payload,
    });
  });
}
