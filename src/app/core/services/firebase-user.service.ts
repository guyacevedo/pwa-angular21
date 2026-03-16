import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  where,
  updateDoc,
  onSnapshot,
} from '@angular/fire/firestore';
import { UserRepository } from '../../../app/core/interfaces/user.repository';
import { User } from '../../core/models';
import { mapUserDates } from '../utils/firestore.utils';

@Injectable({ providedIn: 'root' })
export class FirebaseUserService implements UserRepository {
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  async createUser(user: User): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const defaultProfilePictureUrl =
        'https://res.cloudinary.com/dsd1komi4/image/upload/v1755811833/default-profile_qzf9ga.png';

      const userWithProfilePicture: User = {
        ...user,
        profilePictureUrl: user.profilePictureUrl || defaultProfilePictureUrl,
        status: 'INACTIVE', // New users are created with INACTIVE status
      };

      const userRef = doc(collection(this.firestore, 'users'), userWithProfilePicture.id);
      await setDoc(userRef, userWithProfilePicture);
    });
  }

  async dniExists(dni: string): Promise<boolean> {
    return runInInjectionContext(this.injector, async () => {
      const q = query(collection(this.firestore, 'users'), where('dni', '==', dni));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    });
  }

  async getActiveUsers(): Promise<User[]> {
    return runInInjectionContext(this.injector, async () => {
      const q = query(collection(this.firestore, 'users'), where('status', '==', 'ACTIVE'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          ...mapUserDates(data),
        } as User;
      });
    });
  }

  getAllUsers(onSuccess: (users: User[]) => void, onError?: (error: Error) => void): () => void {
    const q = query(collection(this.firestore, 'users'));
    return onSnapshot(
      q,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            ...mapUserDates(data),
          } as User;
        });
        onSuccess(users);
      },
      (error) => {
        console.error('Error fetching users:', error);
        if (onError) onError(error as Error);
      },
    );
  }

  async getUserByUId(uid: string): Promise<User | null> {
    return runInInjectionContext(this.injector, async () => {
      const userRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          ...data,
          ...mapUserDates(data),
        } as User;
      }
      return null;
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return runInInjectionContext(this.injector, async () => {
      const q = query(collection(this.firestore, 'users'), where('id', '==', id));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        const data = docSnap.data();
        return {
          ...data,
          ...mapUserDates(data),
        } as User;
      }
      return null;
    });
  }

  async getUsersByIds(ids: string[]): Promise<User[]> {
    return runInInjectionContext(this.injector, async () => {
      if (ids.length === 0) {
        return [];
      }
      const usersCol = collection(this.firestore, 'users');
      const q = query(usersCol, where('id', 'in', ids));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          ...mapUserDates(data),
        } as User;
      });
    });
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return runInInjectionContext(this.injector, async () => {
      const q = query(collection(this.firestore, 'users'), where('role', '==', role));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          ...mapUserDates(data),
        } as User;
      });
    });
  }

  async updateUser(updatedData: Partial<User> & { id: string }): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      if (!updatedData.id) {
        throw new Error('El campo "id" es obligatorio para actualizar un usuario.');
      }

      const q = query(collection(this.firestore, 'users'), where('id', '==', updatedData.id));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error(`No se encontró un usuario con el ID: ${updatedData.id}`);
      }

      const userDoc = snapshot.docs[0].ref;
      await updateDoc(userDoc, updatedData);
    });
  }

  async deactivateUser(id: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const userRef = doc(this.firestore, 'users', id);
      await updateDoc(userRef, { status: 'INACTIVE' });
    });
  }

  async activateUser(id: string): Promise<void> {
    return runInInjectionContext(this.injector, async () => {
      const userRef = doc(this.firestore, 'users', id);
      await updateDoc(userRef, { status: 'ACTIVE' });
    });
  }
}
