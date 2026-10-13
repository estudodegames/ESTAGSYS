import React, { useState } from 'react';
import { SchoolSettings } from '../types';
import {
  School,
  Settings,
  X,
  Save,
  Moon,
  Sun,
  Palette,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { resetAllDataToDefault } from '../utils/storage';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface SchoolSettingsModalProps {
  isOpen: boolean;
  settings: SchoolSettings;
  darkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  onSave: (settings: SchoolSettings) => void;
  onClose: () => void;
  onDataReset: () => void;
}

export const SchoolSettingsModal: React.FC<SchoolSettingsModalProps> = ({
  isOpen,
  settings,
  darkMode,
  onToggleDarkMode,
  onSave,
  onClose,
  onDataReset,
}) => {
  const [nomeEscola, setNomeEscola] = useState(settings.nomeEscola);
  const [setorCoordenação, setSetorCoordenação] = useState(settings.setorCoordenação);
  const [nomeCoordenador, setNomeCoordenador] = useState(settings.nomeCoordenador);
  const [cargoCoordenador, setCargoCoordenador] = useState(settings.cargoCoordenador);
  const [emailEscola, setEmailEscola] = useState(settings.emailEscola || '');
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      nomeEscola: nomeEscola.trim(),
      setorCoordenação: setorCoordenação.trim(),
      nomeCoordenador: nomeCoordenador.trim(),
      cargoCoordenador: cargoCoordenador.trim(),
      emailEscola: emailEscola.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 1200);
  };

  const handleResetData = () => {
    resetAllDataToDefault();
    setIsConfirmResetOpen(false);
    onDataReset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Configurações do Sistema
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aparência visual e dados institucionais para as folhas oficiais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {savedNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          {/* Theme Settings: Modo Escuro / Claro */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Aparência do Aplicativo (Tema)
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => onToggleDarkMode(false)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  !darkMode
                    ? 'border-indigo-600 bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                Modo Claro
              </button>

              <button
                type="button"
                onClick={() => onToggleDarkMode(true)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-xs font-bold transition-all ${
                  darkMode
                    ? 'border-indigo-500 bg-slate-950 text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                Modo Escuro
              </button>
            </div>
          </div>

          {/* Institutional Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Dados da Escola e Coordenação (Folha de Frequência)
            </h3>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome da Instituição de Ensino / Escola *
              </label>
              <input
                type="text"
                value={nomeEscola}
                onChange={(e) => setNomeEscola(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Setor / Coordenação de Estágios *
              </label>
              <input
                type="text"
                value={setorCoordenação}
                onChange={(e) => setSetorCoordenação(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Coordenador Geral *
                </label>
                <input
                  type="text"
                  value={nomeCoordenador}
                  onChange={(e) => setNomeCoordenador(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cargo / Função do Coordenador *
                </label>
                <input
                  type="text"
                  value={cargoCoordenador}
                  onChange={(e) => setCargoCoordenador(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail da Coordenação
                </label>
                <input
                  type="email"
                  value={emailEscola}
                  onChange={(e) => setEmailEscola(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-2xs text-slate-500">
              Precisa reiniciar os exemplos de demonstração?
            </span>
            <button
              type="button"
              onClick={() => setIsConfirmResetOpen(true)}
              className="px-3 py-1.5 text-2xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar Dados Padrão
            </button>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>

      {/* Confirm Reset Data Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmResetOpen}
        title="Restaurar Dados Iniciais de Demonstração?"
        message="Esta ação substituirá os cadastros e registros atuais pelos dados de demonstração originais com estagiários internos e externos."
        confirmButtonText="Sim, Restaurar"
        onConfirm={handleResetData}
        onCancel={() => setIsConfirmResetOpen(false)}
      />
    </div>
  );
};
