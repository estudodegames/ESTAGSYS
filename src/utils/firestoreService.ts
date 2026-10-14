import {
  collection,
  doc,
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
};

// Check if user is authenticated with verified email
export function isUserReady(): boolean {
  return !!auth.currentUser && auth.currentUser.emailVerified === true;
}

// Subscribe to students collection in real time
export function subscribeStudents(
  onUpdate: (students: Student[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  if (!auth.currentUser) return null;

  const path = COLLECTIONS.STUDENTS;
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items: Student[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as Student);
        });
        // Sort by creation date or name
        items.sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto));
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Subscribe to meetings collection in real time
export function subscribeMeetings(
  onUpdate: (meetings: MonthlyMeetingControl[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  if (!auth.currentUser) return null;

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
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Subscribe to school settings
export function subscribeSettings(
  onUpdate: (settings: SchoolSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe | null {
  if (!auth.currentUser) return null;

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
        handleFirestoreError(error, OperationType.GET, path);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
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

// Check if Firestore is empty and seed initial data if needed
export async function seedFirestoreIfEmpty(
  initialStudents: Student[],
  initialMeetings: MonthlyMeetingControl[],
  initialSettings: SchoolSettings
): Promise<boolean> {
  const path = COLLECTIONS.STUDENTS;
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty && initialStudents.length > 0) {
      console.log('Firestore is empty. Uploading initial baseline data...');
      for (const student of initialStudents) {
        await saveStudentToFirestore(student);
      }
      for (const meeting of initialMeetings) {
        await saveMeetingToFirestore(meeting);
      }
      await saveSettingsToFirestore(initialSettings);
      return true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return false;
  }
}

// Upload all local data to Firestore
export async function syncAllLocalToFirestore(
  students: Student[],
  meetings: MonthlyMeetingControl[],
  settings: SchoolSettings
): Promise<{ countStudents: number; countMeetings: number }> {
  for (const s of students) {
    await saveStudentToFirestore(s);
  }
  for (const m of meetings) {
    await saveMeetingToFirestore(m);
  }
  await saveSettingsToFirestore(settings);
  return {
    countStudents: students.length,
    countMeetings: meetings.length,
  };
}
