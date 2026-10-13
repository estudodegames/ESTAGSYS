import React from 'react';
import {
  Student,
  MonthlyMeetingControl,
  SchoolSettings,
  MeetingStatus,
} from '../types';
import { MESES_NOMES, formatDateBr, getStatusDetails } from '../utils/dateUtils';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  LayoutDashboard,
  School,
  Building2,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Check,
  Ban,
  GraduationCap,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  meetings: MonthlyMeetingControl[];
  schoolSettings: SchoolSettings;
  mesAno: string;
  onChangeMesAno: (mesAno: string) => void;
  onSelectStudentMeeting: (student: Student, mesAno: string) => void;
  onNavigateToStudents: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  meetings,
  schoolSettings,
  mesAno,
  onChangeMesAno,
  onSelectStudentMeeting,
  onNavigateToStudents,
}) => {
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

  // 1. Distribuição por Modalidade (Interno vs Externo)
  const totalStudents = students.length;
  const internos = students.filter((s) => s.modalidade === 'interno');
  const externos = students.filter((s) => s.modalidade === 'externo');

  const modalityData = [
    {
      name: 'Estágio Interno (Na Escola)',
      value: internos.length,
      percentage: totalStudents > 0 ? Math.round((internos.length / totalStudents) * 100) : 0,
      color: '#4f46e5', // indigo-600
    },
    {
      name: 'Estágio Externo (Na Empresa)',
      value: externos.length,
      percentage: totalStudents > 0 ? Math.round((externos.length / totalStudents) * 100) : 0,
      color: '#10b981', // emerald-500
    },
  ];

  // 2. Status das Reuniões no Mês Selecionado
  // Agrupar os alunos pelo status da reunião no mês
  const studentMeetingStatusList = students.map((s) => {
    const meeting = meetings.find((m) => m.studentId === s.id && m.mesAno === mesAno);
    const status: MeetingStatus = meeting ? meeting.status : 'Pendente';

    return {
      student: s,
      meeting,
      status,
      dataReuniao: meeting?.dataReuniao || '',
      teveProblema: meeting?.teveProblemaRotina || false,
      observacao: meeting?.relatoProblemaOuObservacao || '',
    };
  });

  const countPresentes = studentMeetingStatusList.filter((item) => item.status === 'Presente').length;
  const countFaltas = studentMeetingStatusList.filter((item) => item.status === 'Falta').length;
  const countCancelados = studentMeetingStatusList.filter((item) => item.status === 'Estágio Cancelado').length;
  const countConcluidos = studentMeetingStatusList.filter((item) => item.status === 'Estágio Concluído').length;
  const countPendentes = studentMeetingStatusList.filter((item) => item.status === 'Pendente').length;

  const totalAtivos = totalStudents - countCancelados - countConcluidos;
  const taxaPresenca = totalAtivos > 0 ? Math.round((countPresentes / totalAtivos) * 100) : 0;

  // Chart de Status do Comparecimento com Recharts
  const statusChartData = [
    {
      name: 'Presente',
      quantidade: countPresentes,
      fill: '#10b981', // emerald
    },
    {
      name: 'Falta',
      quantidade: countFaltas,
      fill: '#f43f5e', // rose
    },
    {
      name: 'Pendente',
      quantidade: countPendentes,
      fill: '#94a3b8', // slate
    },
    {
      name: 'Cancelado',
      quantidade: countCancelados,
      fill: '#ef4444', // red
    },
    {
      name: 'Concluído',
      quantidade: countConcluidos,
      fill: '#3b82f6', // blue
    },
  ];

  // Custom Tooltips
  const CustomTooltipModality = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5">
            {data.value} estagiários ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltipStatus = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-xs">
          <p className="font-bold text-slate-900 dark:text-white">{data.name}</p>
          <p className="text-slate-600 dark:text-slate-300 mt-0.5">
            Total: <span className="font-bold">{data.quantidade}</span> estagiários
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Month Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Dashboard das Reuniões de Estágio na Escola
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Comprovação de comparecimento dos estagiários às reuniões mensais de acompanhamento
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            Mês da Reunião:
          </span>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-32 text-center">
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
        </div>
      </div>

      {/* KPI Cards Row (Foco em Comparecimento e Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Cadastrado</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {totalStudents}
            </span>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              {internos.length} internos · {externos.length} externos
            </p>
          </div>
        </div>

        {/* Card 2: Compareceram */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Compareceram</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {countPresentes}
            </span>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              Presentes na reunião
            </p>
          </div>
        </div>

        {/* Card 3: Faltas */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Faltas</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {countFaltas}
            </span>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              Não compareceram
            </p>
          </div>
        </div>

        {/* Card 4: Taxa de Presença */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Taxa de Presença</span>
            <span className="text-xs font-bold text-indigo-600">%</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {taxaPresenca}%
            </span>
            <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, taxaPresenca)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Concluídos / Cancelados */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Encerramentos</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-blue-600">
                {countConcluidos} conc.
              </span>
              <span className="text-xs font-bold text-red-500">
                {countCancelados} canc.
              </span>
            </div>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              Situação do estágio
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Distribuição por Modalidade (Donut Chart) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col min-w-0">
          <div className="mb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Distribuição por Modalidade
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              Estágio Interno (na escola) vs. Estágio Externo (na empresa)
            </p>
          </div>

          <div className="h-60 w-full min-w-0 flex items-center justify-center">
            {totalStudents === 0 ? (
              <p className="text-xs text-slate-400">Nenhum estagiário cadastrado</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={modalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {modalityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltipModality />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legenda simples */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-indigo-600 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Internos (Na Escola)
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {internos.length} ({modalityData[0].percentage}%)
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Externos (Na Empresa)
                </span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white">
                {externos.length} ({modalityData[1].percentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart 2: Status do Comparecimento à Reunião Mensal */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col min-w-0">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Status das Reuniões no Mês — {nomeMesExtenso}/{currentYearNum}
              </h3>
              <p className="text-2xs text-slate-500 dark:text-slate-400">
                Quantidade de estagiários por situação na reunião mensal de acompanhamento
              </p>
            </div>

            <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
              {countPresentes} Presentes
            </span>
          </div>

          <div className="h-60 w-full min-w-0">
            {students.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Nenhum estagiário cadastrado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusChartData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltipStatus />} />
                  <Bar
                    dataKey="quantidade"
                    name="Estagiários"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400">
            <span>
              Comparecimento no mês: <strong>{countPresentes} presentes</strong> · <strong>{countFaltas} faltas</strong> · <strong>{countPendentes} pendentes</strong>.
            </span>
            <button
              onClick={onNavigateToStudents}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
            >
              Cadastros <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabela Rápida de Comparecimento do Mês */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Lista Mensal de Comparecimento à Escola — {nomeMesExtenso} / {currentYearNum}
            </h3>
            <p className="text-2xs text-slate-500 dark:text-slate-400">
              Comprovação do comparecimento de cada estagiário e registro de eventuais ocorrências
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-2xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="pb-3 pr-4">Estagiário</th>
                <th className="pb-3 px-3">Modalidade</th>
                <th className="pb-3 px-3">Local / Empresa</th>
                <th className="pb-3 px-3">Data da Reunião</th>
                <th className="pb-3 px-3">Status na Reunião</th>
                <th className="pb-3 px-3">Problema Relatado?</th>
                <th className="pb-3 pl-3 text-right">Lançar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {studentMeetingStatusList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Nenhum estagiário cadastrado.
                  </td>
                </tr>
              ) : (
                studentMeetingStatusList.map((item) => {
                  const statusDetails = getStatusDetails(item.status);

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.student.nomeCompleto}
                        </span>
                        <span className="text-2xs text-slate-500 dark:text-slate-400">
                          Mat: {item.student.matricula} · <strong className="text-indigo-600 dark:text-indigo-400">{item.student.curso || 'Informática'}</strong> · Turma {item.student.turma} ({item.student.anoEstudo})
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-3xs font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                            item.student.modalidade === 'interno'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {item.student.modalidade === 'interno' ? 'Interno' : 'Externo'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 max-w-44 truncate">
                        {item.student.localEstagio}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-2xs">
                        {item.dataReuniao ? formatDateBr(item.dataReuniao) : '—'}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-2xs font-bold inline-block ${statusDetails.badgeBg}`}
                        >
                          {statusDetails.badgeText}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {item.teveProblema ? (
                          <span className="text-2xs font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Sim
                          </span>
                        ) : (
                          <span className="text-2xs text-slate-400">
                            Não / Regular
                          </span>
                        )}
                      </td>

                      <td className="py-3 pl-3 text-right">
                        <button
                          onClick={() => onSelectStudentMeeting(item.student, mesAno)}
                          className="px-2.5 py-1 text-2xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors"
                        >
                          Registrar
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
    </div>
  );
};
