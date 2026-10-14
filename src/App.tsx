/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  Student,
  MonthlyMeetingControl,
  SchoolSettings,
  AppUser,
} from './types';
import {
  loadStudents,
  saveStudents,
  loadAllMeetings,
  saveAllMeetings,
  saveStudentMeeting,
  deleteStudent,
  loadSettings,
  saveSettings,
} from './utils/storage';
import {
  getCurrentSession,
  setCurrentSession,
} from './utils/authStorage';
import {
  auth,
  loginWithGoogle,
  logoutFirebase,
  testConnection,
} from './utils/firebase';
import {
  subscribeStudents,
  subscribeMeetings,
  subscribeSettings,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  saveMeetingToFirestore,
  saveSettingsToFirestore,
  seedFirestoreIfEmpty,
  syncAllLocalToFirestore,
} from './utils/firestoreService';
import { Navbar, NavTab } from './components/Navbar';
import { StudentList } from './components/StudentList';
import { StudentModal } from './components/StudentModal';
import { MonthlyMeetingEditor } from './components/MonthlyMeetingEditor';
import { MonthlyReportPrint } from './components/MonthlyReportPrint';
import { ConsolidatedReport } from './components/ConsolidatedReport';
import { Dashboard } from './components/Dashboard';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { LoginModal } from './components/LoginModal';
import { UserManagementModal } from './components/UserManagementModal';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';
import { SyncModal } from './components/SyncModal';
import { Cloud, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme state (Modo Claro / Modo Escuro)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('estagio_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('estagio_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('estagio_theme', 'light');
    }
  }, [darkMode]);

  // Auth state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    getCurrentSession()
  );
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(
    () => auth.currentUser
  );

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  // App data state
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() =>
    loadSettings()
  );
  const [students, setStudents] = useState<Student[]>(() => loadStudents());
  const [meetings, setMeetings] = useState<MonthlyMeetingControl[]>(() =>
    loadAllMeetings()
  );

  // Navigation and selection
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() =>
    students.length > 0 ? students[0].id : ''
  );
  const [selectedMesAno, setSelectedMesAno] = useState<string>('2026-10');

  // Modals
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Initialize and attach Firebase Realtime Listeners
  useEffect(() => {
    // Validate connection to Firestore as mandated
    testConnection();

    let unsubStudents: (() => void) | null = null;
    let unsubMeetings: (() => void) | null = null;
    let unsubSettings: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        // Auto-provision local admin session if not already logged in
        if (!currentUser) {
          const autoUser: AppUser = {
            id: user.uid,
            username: user.email?.split('@')[0] || 'coordenacao',
            fullName: user.displayName || 'Profª Andrea Vargas',
            role: 'Administrador',
            email: user.email || undefined,
            passwordHash: '',
            createdAt: new Date().toISOString(),
          };
          setCurrentUser(autoUser);
          setCurrentSession(autoUser);
        }

        // Seed Firestore if this is the first deployment to cloud
        try {
          const currentLocalStudents = loadStudents();
          const currentLocalMeetings = loadAllMeetings();
          const currentLocalSettings = loadSettings();
          await seedFirestoreIfEmpty(
            currentLocalStudents,
            currentLocalMeetings,
            currentLocalSettings
          );
        } catch (e) {
          console.warn('Initial cloud seed notice:', e);
        }

        // Real-time synchronization for Students
        unsubStudents = subscribeStudents((cloudStudents) => {
          if (cloudStudents && cloudStudents.length > 0) {
            setStudents(cloudStudents);
            saveStudents(cloudStudents);
          }
        });

        // Real-time synchronization for Meetings
        unsubMeetings = subscribeMeetings((cloudMeetings) => {
          if (cloudMeetings && cloudMeetings.length > 0) {
            setMeetings(cloudMeetings);
            saveAllMeetings(cloudMeetings);
          }
        });

        // Real-time synchronization for Settings
        unsubSettings = subscribeSettings((cloudSettings) => {
          if (cloudSettings) {
            setSchoolSettings(cloudSettings);
            saveSettings(cloudSettings);
          }
        });
      }
    });

    return () => {
      unsubAuth();
      if (unsubStudents) unsubStudents();
      if (unsubMeetings) unsubMeetings();
      if (unsubSettings) unsubSettings();
    };
  }, []);

  // Selected student
  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];

  // Helper to get or create a monthly meeting control for student and mesAno
  const getOrCreateMeeting = (
    student: Student,
    mesAno: string
  ): MonthlyMeetingControl => {
    const existing = meetings.find(
      (m) => m.studentId === student.id && m.mesAno === mesAno
    );
    if (existing) return existing;

    const [yearStr, monthStr] = mesAno.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const meetingDay = student.modalidade === 'externo' ? 20 : 15;

    return {
      id: `${student.id}_${mesAno}`,
      studentId: student.id,
      mesAno,
      ano: year,
      mes: month,
      status: 'Presente',
      dataReuniao: `${year}-${String(month).padStart(2, '0')}-${String(meetingDay).padStart(2, '0')}`,
      teveProblemaRotina: false,
      relatoProblemaOuObservacao: 'Aluno compareceu à reunião mensal na escola. Informou que a rotina segue regular.',
      ultimaModificacao: new Date().toISOString(),
    };
  };

  const currentMeeting = selectedStudent
    ? getOrCreateMeeting(selectedStudent, selectedMesAno)
    : null;

  // Student CRUD (Local + Cloud Sync)
  const handleSaveStudent = async (studentData: Student) => {
    let updated: Student[];
    const exists = students.some((s) => s.id === studentData.id);
    if (exists) {
      updated = students.map((s) => (s.id === studentData.id ? studentData : s));
    } else {
      updated = [studentData, ...students];
    }
    setStudents(updated);
    saveStudents(updated);
    setSelectedStudentId(studentData.id);
    setIsStudentModalOpen(false);
    setEditingStudent(null);

    // Replicate immediately to Firebase Cloud if authenticated
    if (firebaseUser) {
      try {
        await saveStudentToFirestore(studentData);
      } catch (e) {
        console.error('Falha ao salvar estagiário na nuvem:', e);
      }
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    deleteStudent(studentId);
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    setMeetings(loadAllMeetings());
    if (selectedStudentId === studentId && updated.length > 0) {
      setSelectedStudentId(updated[0].id);
    }

    // Replicate delete to Firebase Cloud if authenticated
    if (firebaseUser) {
      try {
        await deleteStudentFromFirestore(studentId);
      } catch (e) {
        console.error('Falha ao excluir estagiário na nuvem:', e);
      }
    }
  };

  // Meeting Save (Local + Cloud Sync)
  const handleSaveMeeting = async (meetingData: MonthlyMeetingControl) => {
    saveStudentMeeting(meetingData);
    setMeetings(loadAllMeetings());

    // Replicate immediately to Firebase Cloud if authenticated
    if (firebaseUser) {
      try {
        await saveMeetingToFirestore(meetingData);
      } catch (e) {
        console.error('Falha ao salvar reunião na nuvem:', e);
      }
    }
  };

  // School Settings Save (Local + Cloud Sync)
  const handleSaveSchoolSettings = async (newSettings: SchoolSettings) => {
    setSchoolSettings(newSettings);
    saveSettings(newSettings);

    if (firebaseUser) {
      try {
        await saveSettingsToFirestore(newSettings);
      } catch (e) {
        console.error('Falha ao salvar configurações na nuvem:', e);
      }
    }
  };

  // Reset Data
  const handleDataReset = () => {
    setStudents(loadStudents());
    setMeetings(loadAllMeetings());
    setSchoolSettings(loadSettings());
    setIsSettingsModalOpen(false);
  };

  // Sync / Import Data Handler
  const handleDataImported = () => {
    const loadedStudents = loadStudents();
    const loadedMeetings = loadAllMeetings();
    const loadedSettings = loadSettings();
    setStudents(loadedStudents);
    setMeetings(loadedMeetings);
    setSchoolSettings(loadedSettings);
    if (loadedStudents.length > 0) {
      setSelectedStudentId(loadedStudents[0].id);
    }
  };

  // Force Full Sync to Cloud
  const handleForceSyncToCloud = async () => {
    await syncAllLocalToFirestore(students, meetings, schoolSettings);
  };

  // Auth handlers
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentSession(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(null);
    setCurrentSession(null);
    setFirebaseUser(null);
    setIsConfirmLogoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-16 md:pb-6">
      {/* Navbar with responsive navigation, dark mode toggle and user actions */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        firebaseUser={firebaseUser}
        onLogout={() => setIsConfirmLogoutOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
        schoolSettings={schoolSettings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Firebase Cloud Sync Banner if not logged in */}
        {!firebaseUser && (
          <div className="no-print mb-4 p-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 block">
                  Banco de Dados em Nuvem (Firebase Firestore)
                </span>
                <p className="text-2xs text-indigo-700 dark:text-indigo-300">
                  Para sincronizar seus cadastros entre o Preview e a Vercel automaticamente em tempo real, conecte sua conta Google.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await loginWithGoogle();
                } catch (e) {
                  console.error(e);
                }
              }}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <Cloud className="w-3.5 h-3.5" />
              Conectar Google
            </button>
          </div>
        )}

        {/* Visitor Warning if no local session */}
        {!currentUser && (
          <div className="no-print mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <span className="font-bold text-sm text-indigo-900 dark:text-indigo-200 block">
                Sessão de Visitante
              </span>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                Faça login como Administrador para gerenciar usuários, cadastros e aprovar as folhas de reunião de estágio.
              </p>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs shrink-0"
            >
              Fazer Login / Cadastrar
            </button>
          </div>
        )}

        {/* Tab 0: Dashboard Analítico com Recharts */}
        {currentTab === 'dashboard' && (
          <Dashboard
            students={students}
            meetings={meetings}
            schoolSettings={schoolSettings}
            mesAno={selectedMesAno}
            onChangeMesAno={setSelectedMesAno}
            onSelectStudentMeeting={(student: Student, mesAno: string) => {
              setSelectedStudentId(student.id);
              setSelectedMesAno(mesAno);
              setCurrentTab('attendance');
            }}
            onNavigateToStudents={() => setCurrentTab('students')}
          />
        )}

        {/* Tab 1: Gestão de Estagiários (CRUD) */}
        {currentTab === 'students' && (
          <StudentList
            students={students}
            onAddNew={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEdit={(student: Student) => {
              setEditingStudent(student);
              setIsStudentModalOpen(true);
            }}
            onDelete={handleDeleteStudent}
            onLaunchMeeting={(student: Student) => {
              setSelectedStudentId(student.id);
              setCurrentTab('attendance');
            }}
            onViewReport={(student: Student) => {
              setSelectedStudentId(student.id);
              setCurrentTab('report_main');
            }}
          />
        )}

        {/* Tab 2: Controle de Reunião Mensal */}
        {currentTab === 'attendance' && selectedStudent && currentMeeting && (
          <MonthlyMeetingEditor
            student={selectedStudent}
            students={students}
            onSelectStudent={(student: Student) => setSelectedStudentId(student.id)}
            initialMeeting={currentMeeting}
            onSaveMeeting={handleSaveMeeting}
            onViewReport={(student: Student, mesAno: string) => {
              setSelectedStudentId(student.id);
              setSelectedMesAno(mesAno);
              setCurrentTab('report_main');
            }}
          />
        )}

        {/* Tab 3: Folha Oficial (Principal) - Comprovante de Comparecimento Mensal */}
        {currentTab === 'report_main' && selectedStudent && currentMeeting && (
          <MonthlyReportPrint
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={(student: Student) => setSelectedStudentId(student.id)}
            meeting={currentMeeting}
            schoolSettings={schoolSettings}
            onEditMeeting={(studentId: string, mesAno: string) => {
              setSelectedStudentId(studentId);
              setSelectedMesAno(mesAno);
              setCurrentTab('attendance');
            }}
          />
        )}

        {/* Tab 4: Relatório Geral Consolidado (Tabela com todos os alunos) */}
        {currentTab === 'consolidated' && (
          <ConsolidatedReport
            students={students}
            meetings={meetings}
            schoolSettings={schoolSettings}
            mesAno={selectedMesAno}
            onChangeMesAno={setSelectedMesAno}
            onOpenStudentReport={(student: Student, mesAno: string) => {
              setSelectedStudentId(student.id);
              setSelectedMesAno(mesAno);
              setCurrentTab('report_main');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {/* Student Create/Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        studentToEdit={editingStudent}
        onSave={handleSaveStudent}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
      />

      {/* School Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSettingsModalOpen}
        settings={schoolSettings}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
        onSave={handleSaveSchoolSettings}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataReset={handleDataReset}
        onOpenSync={() => setIsSyncModalOpen(true)}
      />

      {/* Sync & Backup Modal (Firebase Cloud + Local Backup) */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onDataImported={handleDataImported}
        firebaseUser={firebaseUser}
        isCloudConnected={!!firebaseUser}
        onGoogleLogin={async () => {
          await loginWithGoogle();
        }}
        onForceSyncToCloud={handleForceSyncToCloud}
        studentsCount={students.length}
        meetingsCount={meetings.length}
      />

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
        canClose={true}
      />

      {/* User & Admin Management Modal */}
      {currentUser && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          currentUser={currentUser}
          onClose={() => setIsUserManagementOpen(false)}
        />
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmLogoutOpen}
        title="Encerrar Sessão?"
        message="Tem certeza que deseja sair do sistema? Você precisará informar seu usuário e senha ou conectar com o Google novamente."
        confirmButtonText="Sim, Sair"
        onConfirm={handleLogout}
        onCancel={() => setIsConfirmLogoutOpen(false)}
      />
    </div>
  );
}
