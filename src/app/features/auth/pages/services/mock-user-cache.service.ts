import { Injectable, signal } from '@angular/core';
import { User } from '../../../../core/models';

@Injectable({ providedIn: 'root' })
export class MockUserCacheService {
  users = signal<(User & { password: string })[]>([]);
  loaded = signal(false);

  setUsers(users: (User & { password: string })[]) {
    this.users.set(users);
    this.loaded.set(true);
  }
}
