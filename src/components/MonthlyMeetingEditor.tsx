import React, { useState, useEffect } from 'react';
import {
  Student,
  MonthlyMeetingControl,
  MeetingStatus,
} from '../types';
import { MESES_NOMES, getStatusDetails } from '../utils/dateUtils';
import {
  Save,
  MessageSquare,
  CheckCircle,
  FileText,
  School,
  Building2,
  AlertCircle,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface MonthlyMeetingEditorProps {
  student: Student;
  students: Student[];
  onSelectStudent: (student: Student) => void;
  initialMeeting: MonthlyMeetingControl;
  onSaveMeeting: (meeting: MonthlyMeetingControl) => void;
  onViewReport: (student: Student, mesAno: string) => void;
}

export const MonthlyMeetingEditor: React.FC<MonthlyMeetingEditorProps> = ({
  student,
  students,
  onSelectStudent,
  initialMeeting,
  onSaveMeeting,
  onViewReport,
}) => {
  const [meeting, setMeeting] = useState<MonthlyMeetingControl>(initialMeeting);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  useEffect(() => {
    setMeeting(initialMeeting);
    setSavedNotice(false);
  }, [initialMeeting, student.id]);

  const nomeMesExtenso = MESES_NOMES[meeting.mes - 1];
  const isInterno = student.modalidade === 'interno';

  const handleFieldChange = (field: keyof MonthlyMeetingControl, val: any) => {
    setMeeting((prev) => ({
      ...prev,
      [field]: val,
    }));
    setSavedNotice(false);
  };

  const handleClear = () => {
    setMeeting((prev) => ({
      ...prev,
      status: 'Pendente',
      teveProblemaRotina: false,
      relatoProblemaOuObservacao: '',
    }));
    setIsConfirmClearOpen(false);
    setSavedNotice(false);
  };

  const handleSave = () => {
    onSaveMeeting(meeting);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const statuses: { key: MeetingStatus; title: string; desc: string; color: string }[] = [
    {
      key: 'Presente',
      title: 'Presente na Reunião',
      desc: 'Aluno compareceu à escola para a reunião mensal',
      color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300',
    },
    {
      key: 'Falta',
      title: 'Falta na Reunião',
      desc: 'Aluno não compareceu à reunião no mês',
      color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300',
    },
    {
      key: 'Estágio Cancelado',
      title: 'Estágio Cancelado',
      desc: 'Estágio interrompido ou rescindido',
      color: 'border-red-500 bg-red-50 dark:bg-red-950/50 text-red-800 dark:text-red-300',
    },
    {
      key: 'Estágio Concluído',
      title: 'Estágio Concluído',
      desc: 'Aluno já finalizou o período de estágio',
      color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Card: Seleção de Estagiário e Mês */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Selecionar Estagiário
            </label>
            <select
              value={student.id}
              onChange={(e) => {
                const found = students.find((s) => s.id === e.target.value);
                if (found) onSelectStudent(found);
              }}
              className="w-full sm:w-72 px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomeCompleto} ({s.modalidade === 'interno' ? 'Interno' : 'Externo'}) - {s.turma}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 sm:pt-4">
            <span
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 ${
                isInterno
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              }`}
            >
              {isInterno ? <School className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
              {student.localEstagio}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsConfirmClearOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar
          </button>

          <button
            onClick={() => onViewReport(student, meeting.mesAno)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            Folha Oficial A4
          </button>

          <button
            onClick={handleSave}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${
              savedNotice ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {savedNotice ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Registro
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Card: Registro Simples de Comparecimento */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Comprovação de Comparecimento à Reunião Mensal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro de comparecimento do estagiário à escola — {nomeMesExtenso} / {meeting.ano}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
              Mês: {nomeMesExtenso} / {meeting.ano}
            </span>
          </div>
        </div>

        {/* 1. Status da Reunião / Estágio */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Status do Estagiário neste Mês *
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {statuses.map((item) => {
              const isSelected = meeting.status === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleFieldChange('status', item.key)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `${item.color} shadow-xs ring-2 ring-indigo-500/20`
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs">{item.title}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 leading-snug">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Data da Reunião */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Data da Reunião de Acompanhamento na Escola *
            </label>
            <input
              type="date"
              value={meeting.dataReuniao || ''}
              onChange={(e) => handleFieldChange('dataReuniao', e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* 3. Houve algum problema ao longo do mês? */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Houve algum problema ou intercorrência no mês?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFieldChange('teveProblemaRotina', false)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  meeting.teveProblemaRotina === false
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Não, tudo regular
              </button>
              <button
                type="button"
                onClick={() => handleFieldChange('teveProblemaRotina', true)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  meeting.teveProblemaRotina === true
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Sim, houve problema
              </button>
            </div>
          </div>
        </div>

        {/* 4. Campo de Anotação e Ocorrências da Reunião */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Relato do Aluno / Observações da Reunião
          </label>
          <textarea
            rows={4}
            value={meeting.relatoProblemaOuObservacao || ''}
            onChange={(e) => handleFieldChange('relatoProblemaOuObservacao', e.target.value)}
            placeholder="Ex: Aluno compareceu à reunião. Relatou que a rotina na empresa está normal, sem problemas. / Aluno informou incompatibilidade de escala ou dúvida pontual..."
            className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden transition-all"
          />
        </div>

        {/* Botão Salvar no Rodapé */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
              savedNotice ? 'bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {savedNotice ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Registro Salvo!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Comparecimento
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmação para Limpar */}
      <ConfirmDeleteModal
        isOpen={isConfirmClearOpen}
        title="Limpar Registro da Reunião?"
        message={`Deseja redefinir o comparecimento de ${student.nomeCompleto} no mês de ${nomeMesExtenso}? O status voltará para Pendente.`}
        confirmButtonText="Sim, Limpar"
        onConfirm={handleClear}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
};
