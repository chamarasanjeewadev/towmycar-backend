import { EventEmitter } from "events";
import {
  sendNotification as sendSNSNotification,
  DriverNotifyEventPayload,
  NotificationType,
  UserWithDriver,
  DriverQuotedEventPayload,
  UserNotificationNotificationpayload,
  DriverNotificationPayload,
  UserNotificationPayload,
  DriverQuotedPayload,
} from "@towmycar/common";

export function registerNotificationListener(emitter: EventEmitter): void {
  emitter.on(
    NotificationType.DRIVER_NOTIFICATION,
    async (payload: DriverNotifyEventPayload) => {
      const snsNotificationPayload = payload?.drivers.map(driver => {
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

        const snsPayload: DriverNotificationPayload = {
          sendToId: driver.userId,
          driver: userWithDriver,
          location: payload.location,
          breakdownRequestId: payload.requestId,
          user: payload.user,
          viewRequestLink: payload.viewRequestLink,
          createdAt: payload.createdAt,
          googleMapsLink: payload.googleMapsLink,
        };

        return snsPayload;
      });
      // modify payload for email
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_NOTIFICATION,
          payload: snsNotificationPayload,
        }
      );
    }
  );

  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationNotificationpayload) => {
      const driverNotificationPlayload: UserNotificationPayload = {
        sendToId: payload.user.id,
        driver: payload.driver,
        location: payload.location,
        breakdownRequestId: payload.requestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        createdAt: payload.createdAt,
        googleMapsLink: payload.googleMapsLink,
      };
      // modify payload as push notification expects
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.USER_NOTIFICATION,
          payload: driverNotificationPlayload,
        }
      );
    }
  );

  emitter.on(
    NotificationType.DRIVER_QUOTED,
    async (payload: DriverQuotedEventPayload) => {
      const driverQuotedPlayload: DriverQuotedPayload = {
        sendToId: payload.user.id,
        driver: payload.driver,
        breakdownRequestId: payload.requestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        price: payload.newPrice,
        estimation: payload.estimation,
      };
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_QUOTED,
          payload: driverQuotedPlayload,
        }
      );
    }
  );
  emitter.on(
    NotificationType.DRIVER_QUOTATION_UPDATED,
    async (payload: DriverQuotedEventPayload) => {
      const driverQuotedPlayload: DriverQuotedPayload = {
        sendToId: payload.user.id,
        driver: payload.driver,
        breakdownRequestId: payload.requestId,
        user: payload.user,
        viewRequestLink: payload.viewRequestLink,
        price: payload.newPrice,
        estimation: payload.estimation,
      };
      await sendSNSNotification(
        process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!,
        {
          subType: NotificationType.DRIVER_QUOTATION_UPDATED,
          payload: driverQuotedPlayload,
        }
      );
    }
  );

  emitter.on(NotificationType.DRIVER_REGISTERED, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_REGISTERED,
      payload,
    });
  });

  emitter.on(NotificationType.USER_REQUEST, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_REQUEST,
      payload,
    });
  });

  emitter.on(NotificationType.USER_CREATED, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_CREATED,
      payload,
    });
  });

  emitter.on(NotificationType.USER_ACCEPT, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_ACCEPT,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_REJECT, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_REJECT,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_ASSIGNED, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_ASSIGNED,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_QUOTED, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_QUOTED,
      payload,
    });
  });

  emitter.on(NotificationType.DRIVER_ACCEPT, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.DRIVER_ACCEPT,
      payload,
    });
  });

  emitter.on(NotificationType.USER_REJECT, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.USER_REJECT,
      payload,
    });
  });

  emitter.on(NotificationType.RATING_REVIEW, async payload => {
    await sendSNSNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      subType: NotificationType.RATING_REVIEW,
      payload,
    });
  });
}
