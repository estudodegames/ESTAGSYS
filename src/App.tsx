/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  saveStudentMeeting,
  deleteStudent,
  loadSettings,
  saveSettings,
} from './utils/storage';
import {
  getCurrentSession,
  setCurrentSession,
} from './utils/authStorage';
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

  // Student CRUD
  const handleSaveStudent = (studentData: Student) => {
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
  };

  const handleDeleteStudent = (studentId: string) => {
    deleteStudent(studentId);
    const updated = students.filter((s) => s.id !== studentId);
    setStudents(updated);
    setMeetings(loadAllMeetings());
    if (selectedStudentId === studentId && updated.length > 0) {
      setSelectedStudentId(updated[0].id);
    }
  };

  // Meeting Save
  const handleSaveMeeting = (meetingData: MonthlyMeetingControl) => {
    saveStudentMeeting(meetingData);
    setMeetings(loadAllMeetings());
  };

  // Reset
  const handleDataReset = () => {
    setStudents(loadStudents());
    setMeetings(loadAllMeetings());
    setSchoolSettings(loadSettings());
    setIsSettingsModalOpen(false);
  };

  // Auth handlers
  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    setCurrentSession(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentSession(null);
    setIsConfirmLogoutOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors pb-16 md:pb-6">
      {/* Navbar with responsive navigation, dark mode toggle and user actions */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={() => setIsConfirmLogoutOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={setDarkMode}
        schoolSettings={schoolSettings}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Visitor Warning */}
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
            onSelectStudentMeeting={(student, mesAno) => {
              setSelectedStudentId(student.id);
              setSelectedMesAno(mesAno);
              setCurrentTab('attendance');
            }}
            onNavigateToStudents={() => setCurrentTab('students')}
          />
        )}

        {/* Tab 1: Estagiários (Clean Student Management) */}
        {currentTab === 'students' && (
          <StudentList
            students={students}
            onAddNew={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEdit={(student) => {
              setEditingStudent(student);
              setIsStudentModalOpen(true);
            }}
            onDelete={handleDeleteStudent}
            onLaunchMeeting={(student) => {
              setSelectedStudentId(student.id);
              setCurrentTab('attendance');
            }}
            onViewReport={(student) => {
              setSelectedStudentId(student.id);
              setCurrentTab('report_main');
            }}
          />
        )}

        {/* Tab 2: Controle da Reunião Mensal */}
        {currentTab === 'attendance' && selectedStudent && currentMeeting && (
          <MonthlyMeetingEditor
            student={selectedStudent}
            students={students}
            onSelectStudent={(s) => setSelectedStudentId(s.id)}
            initialMeeting={currentMeeting}
            onSaveMeeting={handleSaveMeeting}
            onViewReport={(student, mesAno) => {
              setSelectedStudentId(student.id);
              setSelectedMesAno(mesAno);
              setCurrentTab('report_main');
            }}
          />
        )}

        {/* Tab 3: O Relatório Principal (Folha Oficial da Reunião Mensal A4) */}
        {currentTab === 'report_main' && selectedStudent && currentMeeting && (
          <MonthlyReportPrint
            students={students}
            selectedStudent={selectedStudent}
            onSelectStudent={(s) => setSelectedStudentId(s.id)}
            meeting={currentMeeting}
            schoolSettings={schoolSettings}
            onEditMeeting={(studentId, mesAno) => {
              setSelectedStudentId(studentId);
              setSelectedMesAno(mesAno);
              setCurrentTab('attendance');
            }}
          />
        )}

        {/* Tab 4: Relatório Consolidado das Reuniões */}
        {currentTab === 'consolidated' && (
          <ConsolidatedReport
            students={students}
            meetings={meetings}
            schoolSettings={schoolSettings}
            mesAno={selectedMesAno}
            onChangeMesAno={setSelectedMesAno}
            onOpenStudentReport={(student, mesAno) => {
              setSelectedStudentId(student.id);
              setSelectedMesAno(mesAno);
              setCurrentTab('report_main');
            }}
          />
        )}
      </main>

      {/* Clean Student Modal */}
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
        onSave={(newSettings) => {
          setSchoolSettings(newSettings);
          saveSettings(newSettings);
        }}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataReset={handleDataReset}
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
        message="Tem certeza que deseja sair do sistema? Você precisará informar seu usuário e senha novamente para acessar como administrador."
        confirmButtonText="Sim, Sair"
        onConfirm={handleLogout}
        onCancel={() => setIsConfirmLogoutOpen(false)}
      />
    </div>
  );
}
