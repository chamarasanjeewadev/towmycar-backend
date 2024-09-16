import {
  DriverSearchRepository,
  DriverSearchRepositoryType,
  NearbyDriver,
} from "../repository/driversearch.repository";

export type DriverSearchServiceType = {
  findAndUpdateNearbyDrivers: (
    latitude: number,
    longitude: number,
    requestId: number
  ) => Promise<NearbyDriver[]>;
};

const findAndUpdateNearbyDrivers = async (
  latitude: number,
  longitude: number,
  requestId: number
): Promise<NearbyDriver[]> => {
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
