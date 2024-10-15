import type {
  user,
  customer,
  driver,
  breakdownRequest,
  breakdownAssignment,
  fcmTokens,
  vehicles,
  chats,
  serviceRatings,
} from './db-schema';

export type User = typeof user.$inferSelect;
export type Customer = typeof customer.$inferSelect;
export type Driver = typeof driver.$inferSelect;
export type BreakdownRequest = typeof breakdownRequest.$inferSelect;
export type BreakdownAssignment = typeof breakdownAssignment.$inferSelect;
export type FcmToken = typeof fcmTokens.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Chat = typeof chats.$inferSelect;
export type ServiceRating = typeof serviceRatings.$inferSelect;
