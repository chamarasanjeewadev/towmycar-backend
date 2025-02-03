import { DriverSearchRepository } from "../repository/driversearch.repository";
import { VIEW_REQUEST_BASE_URL ,GOOGLE_MAPS_API_KEY} from "../config";
import { getDistance, getViewRequestUrl, logger, QUOTATION_NO } from "@towmycar/common";
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
      throw new Error(`Invalid pickup location for ${QUOTATION_NO}: ${requestId}`);
    }

    // Find nearby drivers with validated parameters
    //TODO wrap this in a try catch block
    const nearbyDrivers = await DriverSearchRepository.findNearbyDrivers(
      request.location.latitude,
      request.location.longitude,
      request?.toLocation?.latitude ?? null,
      request?.toLocation?.longitude ?? null,
      request?.weight ?? null
    );
    if(!nearbyDrivers || nearbyDrivers.length === 0)return [];
   
   const firsttwentyNearbyDrivers = nearbyDrivers.sort((a, b) => a.distance - b.distance).slice(0, 20);

   const distanceCalculatedNearbyDrivers = await Promise.allSettled(
    firsttwentyNearbyDrivers.map(async (driver) => {
      try {
        const userLocation = { lat: request?.location?.latitude!, lng: request?.location?.longitude! };
        const driverLocation = { lat: driver?.primaryLocation?.latitude!, lng: driver?.primaryLocation?.longitude! };
        const pickupDistance = await getDistance(userLocation, driverLocation, GOOGLE_MAPS_API_KEY!);
        if(pickupDistance){driver.pickupDistance = `${pickupDistance}`;}
        return driver;
      } catch (error) {
        logger.error("Error in getDistance:", error);
        // throw error; // Re-throw the error if you want it to be caught by Promise.allSettled
      }
    })
  );
  
  // Process the results
  const successfulDrivers = distanceCalculatedNearbyDrivers
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<any>).value);
  
    // Only update and return if nearby drivers are available
    if (successfulDrivers && successfulDrivers.length > 0) {
      // Pass the full nearbyDrivers array to updateDriverRequests
      await DriverSearchRepository.updateDriverRequests(
        requestId,
        successfulDrivers
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
        make: request?.make,
        model: request?.makeModel,
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
