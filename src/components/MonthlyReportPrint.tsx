import React, { useState } from 'react';
import {
  Student,
  MonthlyMeetingControl,
  SchoolSettings,
} from '../types';
import { MESES_NOMES, formatDateBr, getStatusDetails } from '../utils/dateUtils';
import {
  exportStudentMonthlyMeetingCsv,
  exportStudentMonthlyMeetingPdf,
  printStudentMonthlyMeeting,
} from '../utils/exportUtils';
import {
  Printer,
  School,
  Building2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';

interface MonthlyReportPrintProps {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (student: Student) => void;
  meeting: MonthlyMeetingControl;
  schoolSettings: SchoolSettings;
  onEditMeeting: (studentId: string, mesAno: string) => void;
}

export const MonthlyReportPrint: React.FC<MonthlyReportPrintProps> = ({
  students,
  selectedStudent,
  onSelectStudent,
  meeting,
  schoolSettings,
  onEditMeeting,
}) => {
  const [selectedMes, setSelectedMes] = useState(meeting.mes);
  const [selectedAno, setSelectedAno] = useState(meeting.ano);
  const [printNoticeUrl, setPrintNoticeUrl] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const mesAnoStr = `${selectedAno}-${String(selectedMes).padStart(2, '0')}`;
  const nomeMesExtenso = MESES_NOMES[selectedMes - 1];
  const isInterno = selectedStudent.modalidade === 'interno';
  const statusDetails = getStatusDetails(meeting.status);

  const handlePrevMonth = () => {
    if (selectedMes === 1) {
      setSelectedMes(12);
      setSelectedAno((prev) => prev - 1);
    } else {
      setSelectedMes((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMes === 12) {
      setSelectedMes(1);
      setSelectedAno((prev) => prev + 1);
    } else {
      setSelectedMes((prev) => prev + 1);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      const url = printStudentMonthlyMeeting(selectedStudent, meeting, schoolSettings);
      setPrintNoticeUrl(url);
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setTimeout(() => setIsPrinting(false), 600);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar (Hidden on print) */}
      <div className="no-print bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Student and Month Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-auto">
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Selecionar Estagiário
            </label>
            <select
              value={selectedStudent.id}
              onChange={(e) => {
                const found = students.find((s) => s.id === e.target.value);
                if (found) onSelectStudent(found);
              }}
              className="w-full sm:w-64 px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomeCompleto} ({s.modalidade === 'interno' ? 'Interno' : 'Externo'}) - {s.turma}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Mês da Reunião
            </label>
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-32 text-center">
                {nomeMesExtenso} / {selectedAno}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onEditMeeting(selectedStudent.id, mesAnoStr)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Registro
          </button>

          <button
            onClick={() =>
              exportStudentMonthlyMeetingCsv(selectedStudent, meeting, schoolSettings)
            }
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
            title="Baixar em formato CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          <button
            onClick={() =>
              exportStudentMonthlyMeetingPdf(selectedStudent, meeting, schoolSettings)
            }
            className="px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 rounded-xl border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5"
            title="Baixar arquivo PDF"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar PDF
          </button>

          <button
            onClick={handlePrint}
            disabled={isPrinting}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-75 rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            {isPrinting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Abrindo Impressora...
              </>
            ) : (
              <>
                <Printer className="w-4 h-4" />
                Imprimir Folha A4
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner de Confirmação e Acesso Direto à Impressora */}
      {printNoticeUrl && (
        <div className="no-print p-4 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs flex flex-col md:flex-row items-center justify-between gap-3 text-indigo-950 dark:text-indigo-200 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block text-indigo-900 dark:text-white">
                Comando de Impressão Enviado à Impressora!
              </span>
              <span className="text-2xs text-slate-600 dark:text-slate-400">
                Se a janela de impressão da impressora não abriu automaticamente, clique no botão ao lado para abrir diretamente:
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
            <a
              href={printNoticeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Abrir Impressora Diretamente
            </a>
            <button
              onClick={() => setPrintNoticeUrl(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              title="Fechar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* THE OFFICIAL REPORT SHEET (A4 Standard - Clean, Professional) */}
      <div className="print-container bg-white rounded-2xl border border-slate-300 shadow-md p-6 sm:p-10 max-w-4xl mx-auto text-slate-900 leading-normal">
        {/* Header Institucional */}
        <div className="border-b-2 border-slate-900 pb-4 mb-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-slate-900 flex items-center justify-center font-black text-xl text-slate-900 bg-slate-50 shrink-0">
                <School className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                  {schoolSettings.nomeEscola}
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  {schoolSettings.setorCoordenação}
                </p>
                {schoolSettings.emailEscola && (
                  <p className="text-2xs text-slate-500">
                    E-mail: {schoolSettings.emailEscola}
                  </p>
                )}
              </div>
            </div>

            <div className="text-center sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-md">
                Documento Oficial
              </span>
              <p className="text-xs font-bold text-slate-700 mt-1">Ano Letivo {selectedAno}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300 text-center">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 underline decoration-2 decoration-indigo-600 underline-offset-4">
              COMPROVANTE DE COMPARECIMENTO À REUNIÃO MENSAL DE ESTÁGIO
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              Mês de Referência:{' '}
              <span className="font-black text-slate-900 uppercase">
                {nomeMesExtenso} / {selectedAno}
              </span>
            </p>
          </div>
        </div>

        {/* 1. Ficha de Identificação do Aluno */}
        <div className="border border-slate-800 rounded-lg p-3.5 mb-4 text-xs bg-slate-50/40">
          <span className="font-black text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1 mb-2">
            1. Identificação do(a) Estagiário(a) e Local de Estágio
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-y-1.5 gap-x-4">
            <div className="sm:col-span-8">
              <span className="font-bold text-slate-700">Nome:</span>{' '}
              <span className="font-black text-slate-900 text-sm">
                {selectedStudent.nomeCompleto}
              </span>
            </div>

            <div className="sm:col-span-4">
              <span className="font-bold text-slate-700">Matrícula:</span>{' '}
              <span className="font-mono font-bold text-slate-900">
                {selectedStudent.matricula}
              </span>
            </div>

            <div className="sm:col-span-3">
              <span className="font-bold text-slate-700">Curso:</span>{' '}
              <span className="font-black text-indigo-700">{selectedStudent.curso || 'Informática'}</span>
            </div>

            <div className="sm:col-span-3">
              <span className="font-bold text-slate-700">Turma:</span>{' '}
              <span className="font-semibold text-slate-900">{selectedStudent.turma}</span>
            </div>

            <div className="sm:col-span-3">
              <span className="font-bold text-slate-700">Ano:</span>{' '}
              <span className="font-semibold text-slate-900">{selectedStudent.anoEstudo}</span>
            </div>

            <div className="sm:col-span-3">
              <span className="font-bold text-slate-700">Sexo:</span>{' '}
              <span className="font-black text-slate-900">{selectedStudent.sexo}</span>
            </div>

            <div className="sm:col-span-6">
              <span className="font-bold text-slate-700">Telefone Celular:</span>{' '}
              <span className="font-semibold text-slate-900">{selectedStudent.telefone || 'Não informado'}</span>
            </div>

            <div className="sm:col-span-6">
              <span className="font-bold text-slate-700">E-mail:</span>{' '}
              <span className="font-semibold text-slate-900">{selectedStudent.email}</span>
            </div>

            {/* Modalidade */}
            <div className="sm:col-span-12 pt-2 border-t border-slate-200">
              <div className="flex items-center gap-6">
                <span className="font-bold text-slate-800 uppercase">Modalidade:</span>
                <label className="inline-flex items-center gap-1.5 font-bold">
                  <span
                    className={`inline-block w-4 h-4 border border-slate-800 text-center leading-3.5 text-xs font-black ${
                      isInterno ? 'bg-slate-900 text-white' : 'bg-white'
                    }`}
                  >
                    {isInterno ? 'X' : ''}
                  </span>
                  <span>ESTÁGIO INTERNO (Na Escola)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 font-bold">
                  <span
                    className={`inline-block w-4 h-4 border border-slate-800 text-center leading-3.5 text-xs font-black ${
                      !isInterno ? 'bg-slate-900 text-white' : 'bg-white'
                    }`}
                  >
                    {!isInterno ? 'X' : ''}
                  </span>
                  <span>ESTÁGIO EXTERNO (Na Empresa)</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-7">
              <span className="font-bold text-slate-700">
                {isInterno ? 'Setor da Escola:' : 'Empresa Concedente:'}
              </span>{' '}
              <span className="font-bold text-slate-900">{selectedStudent.localEstagio}</span>
            </div>

            <div className="sm:col-span-5">
              <span className="font-bold text-slate-700">Observações:</span>{' '}
              <span className="font-semibold text-slate-900">
                {selectedStudent.supervisorNome || 'Nenhuma'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Registro do Comparecimento à Reunião Mensal */}
        <div className="border border-slate-800 rounded-lg p-3.5 mb-4 text-xs">
          <span className="font-black text-slate-900 uppercase tracking-wider block border-b border-slate-200 pb-1 mb-2">
            2. Registro de Comparecimento do Aluno à Escola no Mês
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3">
            <div>
              <span className="text-2xs font-bold text-slate-500 uppercase block">
                Situação do Aluno
              </span>
              <span className={`font-black text-xs ${statusDetails.textColor}`}>
                {meeting.status.toUpperCase()}
              </span>
            </div>

            <div>
              <span className="text-2xs font-bold text-slate-500 uppercase block">
                Data do Comparecimento
              </span>
              <span className="font-bold text-slate-900">
                {meeting.dataReuniao ? formatDateBr(meeting.dataReuniao) : 'Não realizada'}
              </span>
            </div>

            <div>
              <span className="text-2xs font-bold text-slate-500 uppercase block">
                Problema na Rotina?
              </span>
              <span className="font-bold text-slate-900">
                {meeting.teveProblemaRotina ? 'Sim, relatou ocorrência' : 'Não, rotina regular'}
              </span>
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-800 block mb-1">
              Relato do Estagiário / Observações da Reunião de Acompanhamento:
            </span>
            <div className="p-3 bg-white border border-slate-300 rounded-lg min-h-20 text-slate-800 leading-relaxed">
              {meeting.relatoProblemaOuObservacao ||
                (meeting.status === 'Presente'
                  ? 'O aluno estagiário compareceu à escola no dia determinado para a reunião de acompanhamento mensal. Declarou que suas atividades no local de estágio estão regulares, sem ocorrências a relatar no período.'
                  : meeting.status === 'Falta'
                  ? 'O aluno estagiário não compareceu à escola para a realização da reunião de acompanhamento de estágio referente a este mês.'
                  : `Situação do estágio registrada no sistema: ${meeting.status}.`)}
            </div>
          </div>
        </div>

        {/* 3. Termo e Bloco Formal de Assinatura */}
        <div className="pt-4 border-t-2 border-slate-900 text-xs mt-6">
          <p className="text-center font-bold text-slate-600 mb-8 leading-snug">
            Declaro, para os devidos fins de comprovação e supervisão escolar, que o registro de comparecimento
            à reunião mensal acima informado é a expressão da verdade.
          </p>

          <div className="text-center pt-2 max-w-sm mx-auto">
            <div className="border-b border-slate-800 w-4/5 mx-auto mb-2 h-6"></div>
            <p className="font-bold text-slate-900 text-sm">
              {schoolSettings.nomeCoordenador || 'Profª Andrea Vargas'}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Orientação de estágio
            </p>
          </div>

          <div className="text-center text-3xs text-slate-400 mt-8">
            Emissão em{' '}
            {new Date().toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}{' '}
            • Sistema de Frequência de Estágio Escolar
          </div>
        </div>
      </div>
    </div>
  );
};
