import { DriverSearchRepository } from "../repository/driversearch.repository";

import { VIEW_REQUEST_BASE_URL } from "../config";
import {
  createGoogleMapsDirectionsLink,
  NearbyDriver,
  NotificationType,
} from "@towmycar/common";
import { EventEmitter } from "events";

// Initialize listeners
import { registerEmailListener } from "./listeners/emailListener.service";
import { registerPushNotificationListener } from "./listeners/pushNotificationListener.service";
import { registerSmsNotificationListener } from "./listeners/smsNotificationListener.service";
const notificationEmitter = new EventEmitter();
registerEmailListener(notificationEmitter);
registerPushNotificationListener(notificationEmitter);
registerSmsNotificationListener(notificationEmitter);
// initializeSmsNotificationListener(notificationEmitter);

// Add User interface (you might want to import this from a shared types file)

export type DriverSearchServiceType = {
  findAndNotifyNearbyDrivers: (requestId: number) => Promise<NearbyDriver[]>;
};

const findAndNotifyNearbyDrivers = async (
  requestId: number
): Promise<NearbyDriver[]> => {
  try {
    const request = await DriverSearchRepository.getBreakdownRequestById(
      requestId
    );

    if (!request) {
      throw new Error(`Breakdown request not found for ID: ${requestId}`);
    }

    // Validate location data
    if (!request.location?.latitude || !request.location?.longitude) {
      throw new Error(`Invalid pickup location for request ID: ${requestId}`);
    }

    // Find nearby drivers with validated parameters
    const nearbyDrivers = await DriverSearchRepository.findNearbyDrivers(
      request.location.latitude,
      request.location.longitude,
      request?.toLocation?.latitude ?? null,
      request?.toLocation?.longitude ?? null,
      request?.weight ?? null
    );

    // Only update and return if nearby drivers are available
    if (nearbyDrivers && nearbyDrivers.length > 0) {
      // Pass the full nearbyDrivers array to updateDriverRequests
      await DriverSearchRepository.updateDriverRequests(
        requestId,
        nearbyDrivers
      );

      const user = await DriverSearchRepository.getUserByCustomerId(
        request.customerId
      );

      const viewRequestLink = `${VIEW_REQUEST_BASE_URL}/driver/requests/${requestId}`;
      const googleMapsLink = createGoogleMapsDirectionsLink(
        request.location,
        request.toLocation
      );
      // const notificationPromises = nearbyDrivers.map(driver => {
      notificationEmitter.emit(NotificationType.DRIVER_NOTIFICATION, {
        drivers: nearbyDrivers,
        requestId,
        user,
        location:request?.location,
        toLocation: request.toLocation,
        createdAt: request.createdAt,
        viewRequestLink,
        googleMapsLink,
      } );
      // });
      // send push notification to user stating request has been assigned to few drivers

      // await Promise.allSettled(notificationPromises);
      return nearbyDrivers;
    } else {
      console.log("No nearby drivers found for requestId:", requestId);
      return [];
    }
  } catch (error) {
    console.error("Error in findAndNotifyNearbyDrivers:", error);
    throw error;
  }
};

export const DriverSearchService: DriverSearchServiceType = {
  findAndNotifyNearbyDrivers,
};
