import {
  DriverSearchRepository,
  NearbyDriver,
} from "../repository/driversearch.repository";
import { sendNotification } from "../utils/sns.service";
import { EmailNotificationType } from "../enums";

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

  // Get userId by requestId
  const userId = await DriverSearchRepository.getUserIdByRequestId(requestId);

  // Get user details
  const user = userId ? await DriverSearchRepository.getUserById(userId) : null;

  // Send notifications to nearby drivers
  for (const driver of nearbyDrivers) {
    await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
      type: EmailNotificationType.DRIVER_NOTIFICATION_EMAIL,
      payload: {
        breakdownRequestId: requestId,
        driver,
        user,
        location: `${latitude}, ${longitude}`,
        viewRequestLink: `${process.env.FRONTEND_URL}/driver/requests/${requestId}`,
      },
    });
  }

  // Send notification to the user
  await sendNotification(process.env.NOTIFICATION_REQUEST_SNS_TOPIC_ARN!, {
    type: EmailNotificationType.USER_NOTIFICATION_EMAIL,
    payload: {
      breakdownRequestId: requestId,
      user,
      viewRequestLink: `${process.env.FRONTEND_URL}/user/view-request/${requestId}`,
    },
  });

  console.log("should be requestId", requestId);
  return nearbyDrivers;
};

export const DriverSearchService: DriverSearchServiceType = {
  findAndUpdateNearbyDrivers,
};
