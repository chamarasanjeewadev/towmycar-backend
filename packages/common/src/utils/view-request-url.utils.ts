import { NotificationType } from "../enums";

interface ViewRequestUrlParams {
  requestId: number;
  driverId?: number;
  token?: string;
  tab?: string;
}

export function getViewRequestUrl(
  type: NotificationType,
  baseUrl: string,
  params: ViewRequestUrlParams,
): string {
  const { requestId, token, tab } = params;
  const driverRequestBaseUrl = `${baseUrl}/driver/requests`;
  const userRequestBaseUrl = `${baseUrl}/user/requests`;

  const urlMappings: Record<
    NotificationType,
    (p: ViewRequestUrlParams) => string
  > = {
    [NotificationType.DRIVER_REGISTERED]: ({
      requestId,
    }: ViewRequestUrlParams) => `${userRequestBaseUrl}/${requestId}`,

    [NotificationType.USER_REQUEST]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}`,

    [NotificationType.USER_CREATED]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}`,

    [NotificationType.USER_ACCEPTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${driverRequestBaseUrl}/list?tab=quoted`,

    [NotificationType.DRIVER_REJECTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}?tab=rejected`,

    [NotificationType.DRIVER_CLOSED]: ({
      requestId,
      token,
    }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/rate/${requestId}?token=${token}`,

    [NotificationType.DRIVER_QUOTATION_UPDATED]: ({
      requestId,
    }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}?tab=pending`,

    [NotificationType.DRIVER_ASSIGNED]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}`,

    [NotificationType.DRIVER_QUOTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}?tab=pending`,

    [NotificationType.DRIVER_ACCEPTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}?tab=accepted`,

    [NotificationType.DRIVER_NOTIFICATION]: ({
      requestId,
    }: ViewRequestUrlParams) => `${driverRequestBaseUrl}/${requestId}`,

    [NotificationType.USER_NOTIFICATION]: ({
      requestId,
    }: ViewRequestUrlParams) => `${userRequestBaseUrl}/${requestId}`,

    [NotificationType.USER_REJECTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${driverRequestBaseUrl}/${requestId}`,

    [NotificationType.RATING_REVIEW]: ({ requestId }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/${requestId}`,

    [NotificationType.DRIVER_CHAT_INITIATED]: ({
      requestId,
      driverId,
    }: ViewRequestUrlParams) =>
      `${userRequestBaseUrl}/requestId=${requestId}&driverId=${driverId}`,

    [NotificationType.USER_CHAT_INITIATED]: ({
      requestId,
    }: ViewRequestUrlParams) =>
      `${driverRequestBaseUrl}/user/requests/chat?requestId=${requestId}`,

    [NotificationType.ADMIN_APPROVAL_REQUEST]: ({
      requestId,
    }: ViewRequestUrlParams) => `${userRequestBaseUrl}/${requestId}`,
  };

  const urlGenerator = urlMappings[type];
  if (!urlGenerator) {
    return `${userRequestBaseUrl}/${requestId}`;
  }

  return urlGenerator(params);
}
