import { EventEmitter } from "events";
import { NOTIFICATION_REQUEST_SNS_TOPIC_ARN } from "../../config";
import {
  BaseNotificationType,
  sendNotification,
  DriverNotifyEventPayload,
  NotificationType,
  UserNotificationEventPayload,
  driverNotificationEmailType,
  UserWithDriver,
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
          }
        };

        const emailPlayload: driverNotificationEmailType = {
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
      await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: NotificationType.DRIVER_NOTIFICATION,
        payload:emailsForDrivers,
      });
    }
  );

  emitter.on(
    NotificationType.USER_NOTIFICATION,
    async (payload: UserNotificationEventPayload) => {
      // modify payload as push notification expects
      await sendNotification(NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
        type: BaseNotificationType.EMAIL,
        subType: NotificationType.USER_NOTIFICATION,
        payload,
      });
    }
  );
}
