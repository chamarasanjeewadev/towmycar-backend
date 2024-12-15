import { DriverSearchRepository } from "../repository/driversearch.repository";
import { VIEW_REQUEST_BASE_URL } from "../config";
import { getViewRequestUrl } from "@towmycar/common";
import {
  createGoogleMapsDirectionsLink,
  NearbyDriver,
  NotificationType,
  registerNotificationListener,
} from "@towmycar/common";
import { EventEmitter } from "events";

// Initialize listeners
const notificationEmitter = new EventEmitter();
registerNotificationListener(notificationEmitter);
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

      const viewRequestLink =getViewRequestUrl(NotificationType.DRIVER_NOTIFICATION, VIEW_REQUEST_BASE_URL!, {
        requestId
      });
      const googleMapsLink = createGoogleMapsDirectionsLink(
        request.location,
        request.toLocation
      );
      // may be we need to check if the emitted record is successfyll resolved before deleting
      notificationEmitter.emit(NotificationType.DRIVER_NOTIFICATION, {
        drivers: nearbyDrivers,
        breakdownRequestId: requestId,
        user,
        location: request?.location,
        toLocation: request.toLocation,
        createdAt: request.createdAt,
        viewRequestLink,
        googleMapsLink,
      });

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
