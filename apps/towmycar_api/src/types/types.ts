
export interface BreakdownRequestType {
  id: number;
  requestId: number;
  driverStatus: string; //'ACCEPTED' | 'PENDING' | 'REJECTED' | 'CLOSED';
  userStatus: string;
  estimation: string;
  explanation: string;
  updatedAt: string;
  userLocation: {
    x: number;
    y: number;
  };
  createdAt: string;
  driver: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    authId: string;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// export interface BreakdownRequestWithUserDetails {
//   id: number;
//   requestType: string;
//   location: string;
//   description: string | null;
//   status: string;
//   regNo: string | null;
//   weight: number | null;
//   userId: number;
//   firstName: string | null;
//   lastName: string | null;
//   userEmail: string | null;
//   mobileNumber: string | null;
//   make: string | null;
//   makeModel: string | null;
//   color: string | null;
//   userLocation: {
//     latitude: number;
//     longitude: number;
//   };
// }



export interface CloseDriverAssignmentParams {
  requestId: number;
  driverId: number;
  markAsCompleted: boolean;
  reason: string;
}

export type CloseBreakdownParams = {
  requestId: number;
  driverId?: number;
  driverRating?: number | null;
  driverFeedback?: string | null;
  siteRating?: number | null;
  siteFeedback?: string | null;
};

export type BreakdownRequestWithUserDetails = {
  id: number;
  requestType: string;
  location: { latitude: number; longitude: number } | null;
  description: string | null;
  make: string | null;
  makeModel: string | null;
  regNo: string | null;
  mobileNumber: string | null;
  weight: number | null; // Change this to number | null
  status: string;
  createdAt: Date;
  userId: number;
  assignments: {
    id: number;
    driverStatus: string;
    userStatus: string;
    estimation: number | null;
    explanation: string | null;
    updatedAt: Date;
    driver: {
      id: number;
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber: string | null;
      imageUrl: string | null;
    };
  }[];
};

// Add this interface near the top with other type definitions
export interface DriverProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  imageUrl: string | null;
  ratings: {
    count: number;
    averageRating: number | null;
    completedJobs: number;
  };
  reviews: {
    rating: number;
    feedback: string;
    createdAt: Date;
    customer: {
      firstName: string;
      lastName: string;
      imageUrl: string | null;
    };
  }[];
}