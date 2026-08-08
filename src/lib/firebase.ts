import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance using the provisioned database ID if provided, otherwise default
const db = getFirestore(
  app,
  firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== ''
    ? firebaseConfigJson.firestoreDatabaseId
    : '(default)'
);

export { db };

// Collections and Document references
const CONFIG_DOC_REF = doc(db, 'school_data', 'config');
const QUESTIONS_DOC_REF = doc(db, 'school_data', 'questions');
const RESULTS_COLLECTION_REF = collection(db, 'student_results');

// 1. Questions Persistence
export async function getFirestoreQuestions() {
  try {
    const snap = await getDoc(QUESTIONS_DOC_REF);
    if (snap.exists() && snap.data().bank) {
      return snap.data().bank;
    }
  } catch (err) {
    console.warn('Firestore fetch questions error, falling back to local:', err);
  }
  return null;
}

export async function saveFirestoreQuestions(bank: any[]) {
  try {
    await setDoc(QUESTIONS_DOC_REF, { bank, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save questions to Firestore:', err);
    return false;
  }
}

// Subscribe to real-time Questions updates
export function subscribeFirestoreQuestions(callback: (bank: any[]) => void) {
  return onSnapshot(QUESTIONS_DOC_REF, (docSnap) => {
    if (docSnap.exists() && docSnap.data().bank) {
      callback(docSnap.data().bank);
    }
  }, (err) => {
    console.warn('Firestore questions subscription warning:', err);
  });
}

// 2. Config Persistence (OTPs, Special Test, Classes, Admin Passwords)
export async function getFirestoreConfig() {
  try {
    const snap = await getDoc(CONFIG_DOC_REF);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn('Firestore fetch config error:', err);
  }
  return null;
}

export async function saveFirestoreConfig(configData: Record<string, any>) {
  try {
    await setDoc(CONFIG_DOC_REF, { ...configData, updatedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to save config to Firestore:', err);
    return false;
  }
}

// Subscribe to real-time Config updates
export function subscribeFirestoreConfig(callback: (data: any) => void) {
  return onSnapshot(CONFIG_DOC_REF, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data());
    }
  }, (err) => {
    console.warn('Firestore config subscription warning:', err);
  });
}

// 3. Student Results Persistence
export async function saveFirestoreStudentResult(result: any) {
  try {
    const docData = {
      ...result,
      createdAt: new Date().toISOString()
    };
    await addDoc(RESULTS_COLLECTION_REF, docData);
    return true;
  } catch (err) {
    console.error('Failed to save student result to Firestore:', err);
    return false;
  }
}

export async function getFirestoreStudentResults() {
  try {
    const q = query(RESULTS_COLLECTION_REF, orderBy('completedAt', 'desc'), limit(500));
    const querySnapshot = await getDocs(q);
    const results: any[] = [];
    querySnapshot.forEach((docSnap) => {
      results.push({ firestoreId: docSnap.id, ...docSnap.data() });
    });
    return results;
  } catch (err) {
    console.warn('Firestore get student results warning:', err);
    return [];
  }
}

export function subscribeFirestoreStudentResults(callback: (results: any[]) => void) {
  const q = query(RESULTS_COLLECTION_REF, orderBy('completedAt', 'desc'), limit(500));
  return onSnapshot(q, (snapshot) => {
    const results: any[] = [];
    snapshot.forEach((docSnap) => {
      results.push({ firestoreId: docSnap.id, ...docSnap.data() });
    });
    callback(results);
  }, (err) => {
    console.warn('Firestore student results subscription warning:', err);
  });
}
