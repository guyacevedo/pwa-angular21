import { InjectionToken } from '@angular/core';
import { User } from '../models';

export interface UserRepository {
  createUser(user: User): Promise<void>;
  dniExists(dni: string): Promise<boolean>;
  getActiveUsers(): Promise<User[]>;
  getAllUsers(onSuccess: (users: User[]) => void, onError?: (error: Error) => void): () => void;
  getUserById(id: string): Promise<User | null>;
  getUsersByIds(ids: string[]): Promise<User[]>;
  getUserByUId(uid: string): Promise<User | null>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUser(updatedData: Partial<User> & { id: string }): Promise<void>;
  deactivateUser(id: string): Promise<void>;
  activateUser(id: string): Promise<void>;
}

export const USER_REPOSITORY = new InjectionToken<UserRepository>('USER_REPOSITORY');
