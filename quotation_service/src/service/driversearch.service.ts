import {
  DriverSearchRepository,
  DriverSearchRepositoryType,
} from "../repository/driversearch.repository";
import { EmailService } from "../service/email.service"; // Add this import

export type DriverSearchServiceType = {
  findAndUpdateNearbyDrivers: (
    latitude: number,
    longitude: number,
    requestId: number
  ) => Promise<any[]>;
};

const findAndUpdateNearbyDrivers = async (
  latitude: number,
  longitude: number,
  requestId: number
): Promise<any[]> => {
  // Find nearby drivers
  const nearbyDrivers = await DriverSearchRepository.findNearbyDrivers(
    latitude,
    longitude
  );

  // Pass the full nearbyDrivers array to updateDriverRequests
  await DriverSearchRepository.updateDriverRequests(requestId, nearbyDrivers);
console.log("nearbyDrivers",nearbyDrivers);
  // Send email to each driver
  // for (const driver of nearbyDrivers) {
  //   if (driver.email) {
  //     try {
  //       await EmailService.sendNewRequestNotification(driver.email, requestId);
  //     } catch (error) {
  //       console.error(`Failed to send email to driver ${driver.id}:`, error);
  //       // Decide how you want to handle email sending failures
  //       // You might want to log it, report it, or retry later
  //     }
  //   }
  // }

  return nearbyDrivers;
};

export const DriverSearchService: DriverSearchServiceType = {
  findAndUpdateNearbyDrivers,
};
