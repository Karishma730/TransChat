import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  deleteUser,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User } from '../types';

export const checkDisplayNameExists = async (displayName: string): Promise<boolean> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('displayName', '==', displayName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.size > 0;
};

export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const displayNameExists = await checkDisplayNameExists(displayName);
  if (displayNameExists) {
    throw new Error('This display name is already taken. Please choose another one.');
  }

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userData: User = {
    uid: user.uid,
    email: user.email!,
    displayName,
    createdAt: new Date(),
    status: 'active',
    blockList: [],
    lastLoginAt: new Date(),
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...userData,
    createdAt: new Date().toISOString(),
    lastLoginAt: Timestamp.now(),
  });

  return userData;
};

export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const userData = userDoc.data() as User;

  await setDoc(
    doc(db, 'users', user.uid),
    { lastLoginAt: Timestamp.now() },
    { merge: true }
  );

  return {
    ...userData,
    createdAt: new Date(userData.createdAt),
  };
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const updateDisplayName = async (displayName: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  await updateProfile(user, { displayName });
  await setDoc(
    doc(db, 'users', user.uid),
    {
      displayName,
      profileUpdatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

export const deleteAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  await setDoc(
    doc(db, 'users', user.uid),
    {
      status: 'deleted',
      deletedAt: Timestamp.now(),
    },
    { merge: true }
  );

  await deleteUser(user);
};
