import { Signal, InjectionToken } from '@angular/core';
import { User } from '../models';
import { Observable } from 'rxjs';


export interface AuthRepository {
  register(email: string, password: string): Promise<void | string>;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated: Signal<boolean>;
  getCurrentUser: Signal<User | null>;
  authReady: Signal<boolean>;
  authState$: Observable<User | null>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>(
  'AUTH_REPOSITORY'
);
