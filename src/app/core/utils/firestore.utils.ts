import { User } from '../models/user.model';

type FirestoreUserData = Record<string, unknown> & {
  registrationDate?: { toDate?: () => Date };
  lastLogin?: { toDate?: () => Date };
  lastLogout?: { toDate?: () => Date };
};

/**
 * Mapea campos de Firestore con Timestamp a objetos Date de JavaScript.
 * Usado en FirebaseUserService para normalizar datos recuperados de Firestore.
 *
 * @param data Objeto con posibles Firestore Timestamps
 * @returns Objeto con Timestamps convertidos a Date
 */
export function mapUserDates(data: FirestoreUserData | null | undefined): Partial<User> {
  if (!data) return {};

  return {
    registrationDate: data.registrationDate?.toDate?.() as Date,
    lastLogin: data.lastLogin?.toDate?.() as Date,
    lastLogout: data.lastLogout?.toDate?.() as Date,
  };
}

/**
 * Aplica mapUserDates a un array de objetos de usuario
 */
export function mapUserDatesArray(docs: FirestoreUserData[]): Partial<User>[] {
  return docs.map((doc) => ({
    ...doc,
    ...mapUserDates(doc),
  })) as Partial<User>[];
}

/**
 * Aplica mapUserDates a un objeto de usuario simple
 */
export function mapSingleUser(data: FirestoreUserData | null | undefined): User | null {
  if (!data) return null;
  return {
    ...data,
    ...mapUserDates(data),
  } as User;
}
