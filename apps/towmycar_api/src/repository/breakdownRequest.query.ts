// import {
//   DB,
//   user,
//   User,
//   breakdownRequest,
//   breakdownAssignment,
//   driver,
//   Driver,
//   BreakdownAssignment,
// } from "@towmycar/database";
// import { eq, sql, desc } from "drizzle-orm";

// // Add this type definition
// type BreakdownRequestWithUserDetails = {
//   id: number;
//   requestType: string;
//   location: string;
//   description: string | null;
//   status: string;
//   userId: number;
//   firstName: string | null;
//   lastName: string | null;
//   userEmail: string | null;
// };

// export type BreakdownRequestQueryType = {
//   // getAllBreakdownRequestsWithUserDetails: () => Promise<
//   //   BreakdownRequestWithUserDetails[]
//   // >;
//   getPaginatedBreakdownRequestsWithUserDetails: (
//     page: number,
//     pageSize: number,
//     userId?: number,
//     requestId?: number
//   ) => Promise<{
//     requests: BreakdownRequestWithUserDetails[];
//     totalCount: number;
//   }>;
//   getBreakdownAssignmentsByUserIdAndRequestId: (
//     userId: number,
//     requestId?: number
//   ) => Promise<(BreakdownAssignment & { driver: Driver; user: User })[]>;
//   getBreakdownAssignmentsByRequestId: (
//     requestId: number
//   ) => Promise<(BreakdownAssignment & { driver: Driver; user: User })[]>;
// };

// // const getAllBreakdownRequestsWithUserDetails = async (): Promise<
// //   BreakdownRequestWithUserDetails[]
// // > => {
// //   return DB.select({
// //     id: breakdownRequest.id,
// //     requestType: breakdownRequest.requestType,
// //     location: breakdownRequest.address,
// //     description: breakdownRequest.description,
// //     status: breakdownRequest.status,
// //     userId: breakdownRequest.customerId,
// //     firstName: user.firstName,
// //     lastName: user.lastName,
// //     userEmail: user.email,
// //   })
// //     .from(breakdownRequest)
// //     .leftJoin(user, eq(user.id, breakdownRequest.customerId));
// // };

// const getPaginatedBreakdownRequestsWithUserDetails = async (
//   page: number,
//   pageSize: number,
//   userId?: number,
//   requestId?: number
// ): Promise<{
//   requests: BreakdownRequestWithUserDetails[];
//   totalCount: number;
// }> => {
//   console.log("hit repo..", userId, requestId);
//   const offset = (page - 1) * pageSize;

//   const baseQuery = DB.select({
//     id: breakdownRequest.id,
//     requestType: breakdownRequest.requestType,
//     location: breakdownRequest.address,
//     description: breakdownRequest.description,
//     status: breakdownRequest.status,
//     userId: breakdownRequest.customerId,
//     firstName: user.firstName,
//     lastName: user.lastName,
//     userEmail: user.email,
//   })
//     .from(breakdownRequest)
//     .leftJoin(user, eq(user.id, breakdownRequest.customerId));

//   let filteredQuery = baseQuery;

//   if (userId) {
//     // @ts-ignore
//     filteredQuery = filteredQuery.where(eq(breakdownRequest.userId, userId));
//   }

//   if (requestId) {
//     // @ts-ignore
//     filteredQuery = filteredQuery.where(eq(breakdownRequest.id, requestId));
//   }

//   const requests = await filteredQuery.limit(pageSize).offset(offset);

//   const countQuery = DB.select({
//     count: sql<number>`cast(count(*) as integer)`,
//   }).from(breakdownRequest);

//   let filteredCountQuery = countQuery;

//   if (userId) {
//     // @ts-ignore
//     filteredCountQuery = filteredCountQuery.where(
//       eq(breakdownRequest.customerId, userId)
//     );
//   }

//   if (requestId) {
//     // @ts-ignore
//     filteredCountQuery = filteredCountQuery.where(
//       eq(breakdownRequest.id, requestId)
//     );
//   }

//   const [{ count }] = await filteredCountQuery;

//   return {
//     requests,
//     totalCount: count,
//   };
// };

// const getBreakdownAssignmentsByUserIdAndRequestId = async (
//   userId: number,
//   requestId?: number
// ): Promise<(BreakdownAssignment & { driver: Driver; user: User })[]> => {
//   let query = DB.select({
//     assignment: {
//       id: breakdownAssignment.id,
//       requestId: breakdownAssignment.requestId,
//       status: breakdownAssignment.driverStatus,
//       userStatus: breakdownAssignment.userStatus,
//       estimation: breakdownAssignment.estimation,
//       explanation: breakdownAssignment.explanation,
//       updatedAt: breakdownAssignment.updatedAt,
//     },
//     driver: {
//       id: driver.id,
//       email: user.email,
//       fullName: user.firstName,
//       phoneNumber: driver.phoneNumber,
//     },
//     user: {
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//     },
//   })
//     .from(breakdownAssignment)
//     .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
//     .innerJoin(
//       breakdownRequest,
//       eq(breakdownAssignment.requestId, breakdownRequest.id)
//     )
//     .innerJoin(user, eq(breakdownRequest.customerId, user.id))
//     .where(eq(user.id, userId));

//   if (requestId) {
//     query = query.where(eq(breakdownRequest.id, requestId));
//   }

//   const result = await query.orderBy(desc(breakdownAssignment.updatedAt));

//   return result as unknown as (BreakdownAssignment & {
//     driver: Driver;
//     user: User;
//   })[];
// };

// const getBreakdownAssignmentsByRequestId = async (
//   requestId: number
// ): Promise<(BreakdownAssignment & { driver: Driver; user: User })[]> => {
//   let query = DB.select({
//     assignment: {
//       id: breakdownAssignment.id,
//       requestId: breakdownAssignment.requestId,
//       status: breakdownAssignment.driverStatus,
//       userStatus: breakdownAssignment.userStatus,
//       estimation: breakdownAssignment.estimation,
//       explanation: breakdownAssignment.explanation,
//       updatedAt: breakdownAssignment.updatedAt,
//     },
//     driver: {
//       id: driver.id,
//       email: user.email,
//       fullName: user.firstName,
//       phoneNumber: driver.phoneNumber,
//     },
//     user: {
//       id: user.id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//     },
//   })
//     .from(breakdownAssignment)
//     .innerJoin(driver, eq(breakdownAssignment.driverId, driver.id))
//     .innerJoin(
//       breakdownRequest,
//       eq(breakdownAssignment.requestId, breakdownRequest.id)
//     )
//     .innerJoin(user, eq(breakdownRequest.customerId, user.id))
//     .where(eq(breakdownRequest.id, requestId));

//   const result = await query.orderBy(desc(breakdownAssignment.updatedAt));

//   return result as unknown as (BreakdownAssignment & {
//     driver: Driver;
//     user: User;
//   })[];
// };

// export const BreakdownRequestQuery: BreakdownRequestQueryType = {
//   // getAllBreakdownRequestsWithUserDetails,
//   getPaginatedBreakdownRequestsWithUserDetails,
//   getBreakdownAssignmentsByUserIdAndRequestId,
//   getBreakdownAssignmentsByRequestId,
// };
