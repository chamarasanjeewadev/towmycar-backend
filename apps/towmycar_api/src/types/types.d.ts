type BreakdownRequestType = {
  id: number;
  requestId: number;
  driverStatus: string; //'ACCEPTED' | 'PENDING' | 'REJECTED' | 'CLOSED';
  userStatus: string; //'ACCEPTED' | 'PENDING' | 'REJECTED' | 'CLOSED';
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
};

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

type BreakdownRequestWithUserDetails = {
  id: number;
  requestType: string;
  location: string;
  description: string | null;
  status: string;
  regNo: string | null; // Add this line
  weight: number | null; // Add this line
  userId: number;
  firstName: string | null;
  lastName: string | null;
  userEmail: string | null;
  mobileNumber: string | null;
  make: string | null;
  makeModel: string | null;
  color: string | null;
  userLocation: {
    latitude: number;
    longitude: number;
  };
};

interface BreakdownAssignmentDetails {
  id: number;
  requestId: number;
  driverStatus: string;
  userStatus: string;
  estimation: string;
  explanation: string;
  updatedAt: Date;
  userLocation: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  userRequest: {
    id: number;
    customerId: number;
    status: string;
    description: string | null;
    regNo: string | null;
    weight: number | null;
    address: string;
    createdAt: string;
    updatedAt: string;
    make: string | null;
    makeModel: string | null;
    mobileNumber: string | null;
    requestType: string;
  };
  driver: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
    vehicleType: string;
    regNo: string;
    vehicleRegistration: string;
    licenseNumber: string;
    serviceRadius: number;
    workingHours: string;
    experienceYears: number;
    insuranceDetails: string;
    primaryLocation: string;
  };
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string | null;
  };
}

type CloseBreakdownParams = {
  requestId: number;
  customerId: number;
  customerRating: number | null;
  customerFeedback: string | null;
  siteRating: number | null;
  siteFeedback: string | null;
};

type CloseDriverAssignmentParams = {
  requestId: number;
  driverId: number;
  markAsCompleted:boolean;
  reason:string;
};
