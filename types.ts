export interface Submission {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  bagsCount: number;
  bagsLocation: string;
  timestamp: string;
  status: 'Pending' | 'On The Way' | 'Completed';
}

export interface AdminCredentials {
  email: string;
  password: string;
}
