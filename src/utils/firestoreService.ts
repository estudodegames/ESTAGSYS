import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Student, MonthlyMeetingControl, SchoolSettings } from '../types';

export const COLLECTIONS = {
  STUDENTS: 'students',
  MEETINGS: 'meetings',
  SETTINGS: 'settings',
  SYSTEM: 'system',
};

// Check if user is authenticated with verified email
export function isUserReady(): boolean {
  return !!auth.currentUser && auth.currentUser.emailVerified === true;
}

// Subscribe to students collection in real time (works immediately for all clients)
export function subscribeStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  const path = COLLECTIONS.STUDENTS;
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items: Student[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Student);
        });
        // Sort alphabetically by full name
        items.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore students subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe students:', error);
    return null;
  }
}

// Subscribe to meetings collection in real time
export function subscribeMeetings(
  onUpdate: (meetings: MonthlyMeetingControl[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  const path = COLLECTIONS.MEETINGS;
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items: MonthlyMeetingControl[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as MonthlyMeetingControl);
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore meetings subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe meetings:', error);
    return null;
  }
}

// Subscribe to school settings
export function subscribeSettings(
  onUpdate: (settings: SchoolSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  const path = `${COLLECTIONS.SETTINGS}/general`;
  try {
    return onSnapshot(
      doc(db, COLLECTIONS.SETTINGS, 'general'),
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as SchoolSettings);
        }
      },
      (error) => {
        console.warn('Firestore settings subscription warning:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe settings:', error);
    return null;
  }
}

// Save a student to Firestore
export async function saveStudentToFirestore(student: Student): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${student.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), {
      ...student,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete student from Firestore
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${studentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save a meeting record to Firestore
export async function saveMeetingToFirestore(
  meeting: MonthlyMeetingControl
): Promise<void> {
  const path = `${COLLECTIONS.MEETINGS}/${meeting.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.MEETINGS, meeting.id), {
      ...meeting,
      ultimaModificacao: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete meeting record
export async function deleteMeetingFromFirestore(meetingId: string): Promise<void> {
  const path = `${COLLECTIONS.MEETINGS}/${meetingId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.MEETINGS, meetingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Save school settings
export async function saveSettingsToFirestore(
  settings: SchoolSettings
): Promise<void> {
  const path = `${COLLECTIONS.SETTINGS}/general`;
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'general'), {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Mark system as initialized in Firestore
export async function markSystemInitialized(): Promise<void> {
  try {
    await setDoc(doc(db, COLLECTIONS.SYSTEM, 'status'), {
      isInitialized: true,
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Failed to mark system initialized:', e);
  }
}

// Check if Firestore was never seeded; seed ONLY on very first run
export async function seedFirestoreIfEmpty(
  initialStudents: Student[],
  initialMeetings: MonthlyMeetingControl[],
  initialSettings: SchoolSettings
): Promise<boolean> {
  try {
    // If system status doc already exists, it was initialized previously - DO NOT RE-SEED!
    const statusSnap = await getDoc(doc(db, COLLECTIONS.SYSTEM, 'status'));
    if (statusSnap.exists()) {
      return false;
    }

    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (studentsSnap.empty && initialStudents.length > 0) {
      console.log('Primeira inicialização: enviando dados base para o Firestore...');
      for (const student of initialStudents) {
        await saveStudentToFirestore(student);
      }
      for (const meeting of initialMeetings) {
        await saveMeetingToFirestore(meeting);
      }
      await saveSettingsToFirestore(initialSettings);
      await markSystemInitialized();
      return true;
    }
    await markSystemInitialized();
    return false;
  } catch (error) {
    console.warn('Seed check exception:', error);
    return false;
  }
}

// Full Synchronize: Mirror local data to Firestore (deletes remote docs not in local list, including emptying to 0)
export async function syncAllLocalToFirestore(
  students: Student[],
  meetings: MonthlyMeetingControl[],
  settings: SchoolSettings
): Promise<{ countStudents: number; countMeetings: number; deletedStudents: number; deletedMeetings: number }> {
  let deletedStudents = 0;
  let deletedMeetings = 0;

  // 1. Sync Students: Delete remote students that are not present locally
  const remoteStudentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  const localStudentIds = new Set(students.map((s) => s.id));
  for (const docSnap of remoteStudentsSnap.docs) {
    if (!localStudentIds.has(docSnap.id)) {
      await deleteDoc(doc(db, COLLECTIONS.STUDENTS, docSnap.id));
      deletedStudents++;
    }
  }

  // Upsert all local students
  for (const s of students) {
    await saveStudentToFirestore(s);
  }

  // 2. Sync Meetings: Delete remote meetings that are not present locally
  const remoteMeetingsSnap = await getDocs(collection(db, COLLECTIONS.MEETINGS));
  const localMeetingIds = new Set(meetings.map((m) => m.id));
  for (const docSnap of remoteMeetingsSnap.docs) {
    if (!localMeetingIds.has(docSnap.id)) {
      await deleteDoc(doc(db, COLLECTIONS.MEETINGS, docSnap.id));
      deletedMeetings++;
    }
  }

  // Upsert all local meetings
  for (const m of meetings) {
    await saveMeetingToFirestore(m);
  }

  // 3. Save Settings & Mark system as initialized
  await saveSettingsToFirestore(settings);
  await markSystemInitialized();

  return {
    countStudents: students.length,
    countMeetings: meetings.length,
    deletedStudents,
    deletedMeetings,
  };
}

// Pull all data directly from Firestore
export async function pullAllFromFirestore(): Promise<{
  students: Student[];
  meetings: MonthlyMeetingControl[];
  settings: SchoolSettings | null;
}> {
  const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
  const students: Student[] = [];
  studentsSnap.forEach((docSnap) => {
    students.push(docSnap.data() as Student);
  });
  students.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));

  const meetingsSnap = await getDocs(collection(db, COLLECTIONS.MEETINGS));
  const meetings: MonthlyMeetingControl[] = [];
  meetingsSnap.forEach((docSnap) => {
    meetings.push(docSnap.data() as MonthlyMeetingControl);
  });

  let settings: SchoolSettings | null = null;
  const settingsSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'general'));
  if (settingsSnap.exists()) {
    settings = settingsSnap.data() as SchoolSettings;
  }

  return { students, meetings, settings };
}

// Get cloud documents count
export async function getCloudCounts(): Promise<{ studentsCount: number; meetingsCount: number }> {
  try {
    const sSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    const mSnap = await getDocs(collection(db, COLLECTIONS.MEETINGS));
    return {
      studentsCount: sSnap.size,
      meetingsCount: mSnap.size,
    };
  } catch (e) {
    return { studentsCount: 0, meetingsCount: 0 };
  }
}
