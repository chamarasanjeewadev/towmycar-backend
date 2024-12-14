import { NotificationType } from '../enums';

interface ViewRequestUrlParams {
  requestId: number;
  token?: string;
  tab?: string;
}

export function getViewRequestUrl(
  type: NotificationType,
  baseUrl: string,
  params: ViewRequestUrlParams
): string {
  const { requestId, token, tab } = params;

  const urlMappings: Record<NotificationType, (p: ViewRequestUrlParams) => string> = {
    [NotificationType.DRIVER_REGISTERED]: ({ requestId }: ViewRequestUrlParams) => 
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.USER_REQUEST]: ({ requestId }: ViewRequestUrlParams) => 
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.USER_CREATED]: ({ requestId }: ViewRequestUrlParams) => 
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.USER_ACCEPTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/driver/requests/${requestId}`,
      
    [NotificationType.DRIVER_REJECTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}?tab=rejected`,
      
    [NotificationType.DRIVER_CLOSED]: ({ requestId, token }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/rate/${requestId}?token=${token}`,
      
    [NotificationType.DRIVER_QUOTATION_UPDATED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}?tab=pending`,
      
    [NotificationType.DRIVER_ASSIGNED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.DRIVER_QUOTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.DRIVER_ACCEPTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.DRIVER_NOTIFICATION]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/driver/requests/${requestId}`,
      
    [NotificationType.USER_NOTIFICATION]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.USER_REJECTED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/driver/requests/${requestId}`,
      
    [NotificationType.RATING_REVIEW]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.DRIVER_CHAT_INITIATED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/user/requests/${requestId}`,
      
    [NotificationType.USER_CHAT_INITIATED]: ({ requestId }: ViewRequestUrlParams) =>
      `${baseUrl}/driver/requests/${requestId}`,
  };

  const urlGenerator = urlMappings[type];
  if (!urlGenerator) {
    return `${baseUrl}/user/requests/${requestId}`;
  }

  return urlGenerator(params);
} 