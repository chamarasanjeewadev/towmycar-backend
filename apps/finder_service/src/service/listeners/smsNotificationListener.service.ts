import { EventEmitter } from "events";
import {
  NOTIFICATION_EVENTS,
  DriverNotificationEventPayload,
} from "../../events/notificationEvents";
import { logger } from "../../utils";
import { getSMSProvider } from "../sms/smsProviderFactory";

const smsProvider = getSMSProvider();

export function initializeSmsNotificationListener(emitter: EventEmitter) {
  emitter.on(
    NOTIFICATION_EVENTS.NOTIFY_DRIVERS,
    async (payload: DriverNotificationEventPayload) => {
      const {
        driver,
        requestId,
        user,
        location,
        toLocation,
        viewRequestLink,
        googleMapsLink,
      } = payload;

      if (!driver.phoneNumber) {
        logger.warn(`No phone number available for driver ${driver.id}`);
        return;
      }

      const locationInfo = toLocation
        ? `from ${location} to ${toLocation}`
        : `at ${location}`;

      const message =
        `New tow request from ${user.firstName}!\n` +
        `Location: ${locationInfo}\n` +
        `View request: ${viewRequestLink}\n` +
        `Maps: ${googleMapsLink}`;

      try {
        await smsProvider.sendSMS(driver.phoneNumber, message);
        logger.info(
          `SMS notification sent successfully to driver ${driver.id}`
        );
      } catch (error) {
        console.log("error", error);
        logger.error(
          `Error sending SMS notification to driver ${driver.id}:`,
          error
        );
      }
    }
  );
}
