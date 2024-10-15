// export type BreakdownRequestType = {
//   id: number;
//   requestId: number;
//   driverStatus: string;
//   userStatus: string;
//   estimation: string;
//   explanation: string;
//   updatedAt: string;
//   userLocation: {
//     x: number;
//     y: number;
//   };
//   createdAt: string;
//   driver: {
//     id: number;
//     firstName: string | null;
//     lastName: string | null;
//     email: string | null;
//   };
//   user: {
//     id: number;
//     firstName: string;
//     lastName: string;
//     email: string;
//     authId: string;
//   };
// };

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
export type Role = "customer" | "driver";