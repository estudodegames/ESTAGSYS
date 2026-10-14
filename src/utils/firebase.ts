import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (CRITICAL: Required for AI Studio multi-database)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Mandatory testConnection function
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes('the client is offline')
    ) {
      console.warn('Firebase client is offline or starting up.');
    }
    return false;
  }
}

export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
export const FIREBASE_AUTH_SETTINGS_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

// Google Sign-In with popup
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    const code = err?.code || 'auth/unknown';
    const domain = typeof window !== 'undefined' ? window.location.hostname : '';
    
    let friendlyMessage = 'Falha ao autenticar com Google. Tente novamente.';
    if (code === 'auth/unauthorized-domain') {
      friendlyMessage = `O domínio "${domain}" ainda não está autorizado no Firebase. Adicione "vercel.app" ou "${domain}" na lista de Domínios Autorizados no Firebase Console do projeto ${FIREBASE_PROJECT_ID}.`;
    } else if (code === 'auth/popup-blocked') {
      friendlyMessage = 'A janela de autenticação foi bloqueada pelo navegador. Permita pop-ups para este site e tente novamente.';
    } else if (code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'A janela de login do Google foi fechada antes de concluir. Tente novamente.';
    } else if (err?.message) {
      friendlyMessage = `${err.message} (${code})`;
    }

    const enhancedErr: any = new Error(friendlyMessage);
    enhancedErr.code = code;
    enhancedErr.domain = domain;
    enhancedErr.originalError = err;
    throw enhancedErr;
  }
}

// Sign-Out
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}
