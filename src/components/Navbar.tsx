import React, { useState } from 'react';
import { AppUser, SchoolSettings } from '../types';
import {
  School,
  Users,
  Calendar,
  FileText,
  FileSpreadsheet,
  Moon,
  Sun,
  Settings,
  LogOut,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  UserPlus,
  MessageSquare,
  LayoutDashboard,
  ArrowLeftRight,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'students' | 'attendance' | 'report_main' | 'consolidated';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenSync: () => void;
  onOpenUserManagement: () => void;
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  schoolSettings: SchoolSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  onOpenSettings,
  onOpenSync,
  onOpenUserManagement,
  darkMode,
  onToggleDarkMode,
  schoolSettings,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <header className="no-print sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  Frequência de Estágio
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Escolar
                  </span>
                </span>
                <p className="text-2xs text-slate-500 dark:text-slate-400 truncate max-w-56 sm:max-w-xs">
                  {schoolSettings.nomeEscola}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'dashboard'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Dashboard
              </button>

              <button
                onClick={() => onSelectTab('students')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'students'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Estagiários
              </button>

              <button
                onClick={() => onSelectTab('attendance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'attendance'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Reunião Mensal
              </button>

              <button
                onClick={() => onSelectTab('report_main')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'report_main'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Folha Oficial (Principal)
              </button>

              <button
                onClick={() => onSelectTab('consolidated')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentTab === 'consolidated'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Relatório Geral
              </button>
            </nav>

            {/* Right Tools: Dark Mode, Settings, User Profile */}
            <div className="flex items-center gap-2">
              {/* Quick Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => onToggleDarkMode(!darkMode)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* Sincronização e Backup Preview ⇄ Vercel */}
              <button
                type="button"
                onClick={onOpenSync}
                className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/70 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
                title="Sincronizar dados entre Preview e Vercel (Copiar/Colar e Backup)"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Sincronizar</span>
              </button>

              {/* School Settings Button */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Configurações da Escola e Tema"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Menu */}
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.fullName.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-28">
                        {currentUser.fullName.split(' ')[0]}
                      </span>
                      <span className="block text-3xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {currentUser.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          {currentUser.fullName}
                        </span>
                        <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
                          @{currentUser.username} • {currentUser.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={onOpenUserManagement}
                          className="w-full px-3.5 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          Gerenciar Usuários
                        </button>

                        <button
                          onClick={onOpenSettings}
                          className="w-full px-3.5 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          Configurações
                        </button>

                        <button
                          onClick={onOpenSync}
                          className="w-full px-3.5 py-2 text-xs text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
                          Sincronizar Dados (Vercel)
                        </button>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={onLogout}
                          className="w-full px-3.5 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair do Sistema
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-3 flex items-center justify-around">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-3xs font-bold ${
            currentTab === 'dashboard'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectTab('students')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-3xs font-bold ${
            currentTab === 'students'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Alunos</span>
        </button>

        <button
          onClick={() => onSelectTab('attendance')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-3xs font-bold ${
            currentTab === 'attendance'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>Reunião</span>
        </button>

        <button
          onClick={() => onSelectTab('report_main')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-3xs font-black ${
            currentTab === 'report_main'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileText className="w-5 h-5 text-indigo-600" />
          <span>Folha Oficial</span>
        </button>

        <button
          onClick={() => onSelectTab('consolidated')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-3xs font-bold ${
            currentTab === 'consolidated'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          <span>Geral</span>
        </button>
      </div>
    </>
  );
};
