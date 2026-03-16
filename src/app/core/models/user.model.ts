import { UserRole, UserStatus } from '../types';

export interface User {
  uid: string;
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password?: string;
  phone?: string;
  profilePictureUrl: string;
  registrationDate: Date;
  role: UserRole;
  status: UserStatus;
  lastLogin: Date;
  lastLogout: Date;
}
