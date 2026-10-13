import React, { useState } from 'react';
import {
  Student,
  MonthlyMeetingControl,
  SchoolSettings,
  InternshipType,
  MeetingStatus,
} from '../types';
import { MESES_NOMES, formatDateBr, getStatusDetails } from '../utils/dateUtils';
import {
  exportConsolidatedMeetingCsv,
  exportConsolidatedMeetingPdf,
} from '../utils/exportUtils';
import {
  FileSpreadsheet,
  Download,
  Search,
  School,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface ConsolidatedReportProps {
  students: Student[];
  meetings: MonthlyMeetingControl[];
  schoolSettings: SchoolSettings;
  mesAno: string;
  onChangeMesAno: (mesAno: string) => void;
  onOpenStudentReport: (student: Student, mesAno: string) => void;
}

export const ConsolidatedReport: React.FC<ConsolidatedReportProps> = ({
  students,
  meetings,
  schoolSettings,
  mesAno,
  onChangeMesAno,
  onOpenStudentReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState<'all' | InternshipType>('all');
  const [cursoFilter, setCursoFilter] = useState<'all' | 'Informática' | 'Jogos' | 'Redes'>('all');
  const [turmaFilter, setTurmaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | MeetingStatus>('all');

  const [yearStr, monthStr] = mesAno.split('-');
  const currentMonthNum = parseInt(monthStr, 10);
  const currentYearNum = parseInt(yearStr, 10);
  const nomeMesExtenso = MESES_NOMES[currentMonthNum - 1];

  const handlePrevMonth = () => {
    let nextMonth = currentMonthNum - 1;
    let nextYear = currentYearNum;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear--;
    }
    onChangeMesAno(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    let nextMonth = currentMonthNum + 1;
    let nextYear = currentYearNum;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    onChangeMesAno(`${nextYear}-${String(nextMonth).padStart(2, '0')}`);
  };

  const distinctTurmas = Array.from(new Set(students.map((s) => s.turma)));

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricula.includes(searchTerm) ||
      (s.curso && s.curso.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.turma.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.anoEstudo.includes(searchTerm) ||
      s.localEstagio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModalidade =
      modalidadeFilter === 'all' || s.modalidade === modalidadeFilter;

    const matchesCurso = cursoFilter === 'all' || s.curso === cursoFilter;

    const matchesTurma = turmaFilter === 'all' || s.turma === turmaFilter;

    const m = meetings.find((item) => item.studentId === s.id && item.mesAno === mesAno);
    const status: MeetingStatus = m ? m.status : 'Pendente';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesModalidade && matchesCurso && matchesTurma && matchesStatus;
  });

  const totalInternos = students.filter((s) => s.modalidade === 'interno').length;
  const totalExternos = students.filter((s) => s.modalidade === 'externo').length;

  const totalPresentes = students.filter((s) => {
    const m = meetings.find((item) => item.studentId === s.id && item.mesAno === mesAno);
    return m?.status === 'Presente';
  }).length;

  const totalFaltas = students.filter((s) => {
    const m = meetings.find((item) => item.studentId === s.id && item.mesAno === mesAno);
    return m?.status === 'Falta';
  }).length;

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Relatório Geral Mensal de Todos os Estagiários
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Orientação de estágio: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">Profª Andrea Vargas</strong> • Acompanhamento de comparecimento às reuniões — {nomeMesExtenso} / {currentYearNum}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-28 text-center">
              {nomeMesExtenso} / {currentYearNum}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() =>
              exportConsolidatedMeetingCsv(filteredStudents, meetings, mesAno, schoolSettings)
            }
            className="px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
            title="Exportar planilha CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            onClick={() =>
              exportConsolidatedMeetingPdf(filteredStudents, meetings, mesAno, schoolSettings)
            }
            className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            title="Exportar relatório consolidado em PDF"
          >
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
            Total Cadastrados
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {students.length}
          </span>
          <span className="text-2xs text-slate-500 mt-0.5 block">
            {totalInternos} int. · {totalExternos} ext.
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
            Compareceram no Mês
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {totalPresentes}
          </span>
          <span className="text-2xs text-slate-500 mt-0.5 block">
            Presentes na reunião
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
            Faltas no Mês
          </span>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
            {totalFaltas}
          </span>
          <span className="text-2xs text-slate-500 mt-0.5 block">
            Não compareceram
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
            Taxa de Comparecimento
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {students.length > 0 ? Math.round((totalPresentes / students.length) * 100) : 0}%
            </span>
          </div>
          <span className="text-2xs text-slate-500 mt-0.5 block">
            Em relação ao total
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, matrícula ou empresa/setor..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={cursoFilter}
            onChange={(e) => setCursoFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl outline-hidden"
          >
            <option value="all">Todos os Cursos</option>
            <option value="Informática">Informática</option>
            <option value="Jogos">Jogos</option>
            <option value="Redes">Redes</option>
          </select>

          <select
            value={modalidadeFilter}
            onChange={(e) => setModalidadeFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl outline-hidden"
          >
            <option value="all">Todas as Modalidades</option>
            <option value="interno">Apenas Internos (Escola)</option>
            <option value="externo">Apenas Externos (Empresa)</option>
          </select>

          <select
            value={turmaFilter}
            onChange={(e) => setTurmaFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl outline-hidden"
          >
            <option value="all">Todas as Turmas</option>
            {distinctTurmas.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl outline-hidden"
          >
            <option value="all">Todos os Status</option>
            <option value="Presente">Presente na Reunião</option>
            <option value="Falta">Falta na Reunião</option>
            <option value="Estágio Cancelado">Estágio Cancelado</option>
            <option value="Estágio Concluído">Estágio Concluído</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase font-bold text-2xs tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">Estagiário</th>
                <th className="px-4 py-3">Curso & Turma/Ano</th>
                <th className="px-4 py-3">Modalidade & Local</th>
                <th className="px-4 py-3 text-center">Status no Mês</th>
                <th className="px-4 py-3 text-center">Data Reunião</th>
                <th className="px-4 py-3 text-center">Problema na Rotina?</th>
                <th className="px-4 py-3 text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Nenhum estagiário encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const m = meetings.find(
                    (item) => item.studentId === s.id && item.mesAno === mesAno
                  );
                  const isInterno = s.modalidade === 'interno';
                  const status: MeetingStatus = m ? m.status : 'Pendente';
                  const statusDetails = getStatusDetails(status);

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                        {s.matricula}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {s.nomeCompleto}
                        </span>
                        {s.telefone && <span className="text-2xs text-slate-500">{s.telefone}</span>}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                          {s.curso || 'Informática'}
                        </span>
                        <span className="text-2xs text-slate-600 dark:text-slate-300">
                          {s.turma} ({s.anoEstudo})
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-3xs font-black uppercase tracking-wider ${
                              isInterno
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {isInterno ? 'Interno' : 'Externo'}
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-xs">
                            {s.localEstagio}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-2xs font-bold inline-block ${statusDetails.badgeBg}`}
                        >
                          {statusDetails.badgeText}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {m?.dataReuniao ? formatDateBr(m.dataReuniao) : '—'}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {m?.teveProblemaRotina ? (
                          <span className="text-2xs font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Sim (Ocorrência)
                          </span>
                        ) : (
                          <span className="text-2xs text-slate-500 dark:text-slate-400">
                            Não / Regular
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onOpenStudentReport(s, mesAno)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-xl transition-colors inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Folha A4
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Identificação da Orientação de Estágio no Relatório Geral */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">
            Orientação e Supervisão Escolar
          </span>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">
            Relatório Geral Mensal de Acompanhamento e Presença às Reuniões de Estágio
          </p>
        </div>

        <div className="text-center sm:text-right min-w-56">
          <span className="font-bold text-slate-900 dark:text-white text-sm block">
            Profª Andrea Vargas
          </span>
          <span className="text-2xs text-slate-500 dark:text-slate-400">
            Orientação de estágio
          </span>
        </div>
      </div>
    </div>
  );
};
