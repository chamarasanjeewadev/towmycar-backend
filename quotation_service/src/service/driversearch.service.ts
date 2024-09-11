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
  console.log("nearbyDrivers", nearbyDrivers);
  // TODO: should send emails
  console.log("should be requestId", requestId);
  return nearbyDrivers;
};

export const DriverSearchService: DriverSearchServiceType = {
  findAndUpdateNearbyDrivers,
};
