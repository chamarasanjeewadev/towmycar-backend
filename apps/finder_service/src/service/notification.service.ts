import { EventEmitter } from 'events';

export const NOTIFICATION_EVENTS = {
  NOTIFY_DRIVERS: 'notify_drivers',
  DRIVER_ASSIGNED: 'driver_assigned',
  REQUEST_STATUS_UPDATE: 'request_status_update',
  PAYMENT_CONFIRMATION: 'payment_confirmation'
} as const;

export const notificationEmitter = new EventEmitter(); 