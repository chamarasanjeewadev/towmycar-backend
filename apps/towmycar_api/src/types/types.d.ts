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
