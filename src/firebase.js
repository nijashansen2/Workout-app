import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDfIMuBb902OAYJTAdqeJKE4oz6-B0prNA',
  authDomain: 'wokrout-app-8d7c2.firebaseapp.com',
  projectId: 'wokrout-app-8d7c2',
  storageBucket: 'wokrout-app-8d7c2.firebasestorage.app',
  messagingSenderId: '296110778916',
  appId: '1:296110778916:web:ae8a9134641887796a86b1',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export function ensureAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth).then((cred) => resolve(cred.user));
      }
    });
  });
}
