import React, { useState } from 'react';
import { Student, InternshipType, CourseType } from '../types';
import {
  UserPlus,
  Search,
  School,
  Building2,
  Edit2,
  Trash2,
  FileText,
  Phone,
  Mail,
  GraduationCap,
  MessageSquare,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface StudentListProps {
  students: Student[];
  onAddNew: () => void;
  onEdit: (student: Student) => void;
  onDelete: (studentId: string) => void;
  onLaunchMeeting: (student: Student) => void;
  onViewReport: (student: Student) => void;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onAddNew,
  onEdit,
  onDelete,
  onLaunchMeeting,
  onViewReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState<'all' | InternshipType>('all');
  const [cursoFilter, setCursoFilter] = useState<'all' | CourseType>('all');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const filtered = students.filter((s) => {
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

    return matchesSearch && matchesModalidade && matchesCurso;
  });

  const totalInternos = students.filter((s) => s.modalidade === 'interno').length;
  const totalExternos = students.filter((s) => s.modalidade === 'externo').length;

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      onDelete(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra Superior */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Estagiários Cadastrados
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhamento de estagiários dos cursos de Informática, Jogos e Redes
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          Novo Estagiário
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filtros por Modalidade */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setModalidadeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              modalidadeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setModalidadeFilter('interno')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              modalidadeFilter === 'interno'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            Internos ({totalInternos})
          </button>
          <button
            onClick={() => setModalidadeFilter('externo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              modalidadeFilter === 'externo'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Externos ({totalExternos})
          </button>
        </div>

        {/* Filtro por Curso e Campo de Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 md:justify-end">
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

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno, curso, turma ou ano..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Grade de Estagiários (Design Limpo e Confortável) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            Nenhum estagiário encontrado. Clique em "Novo Estagiário" para cadastrar.
          </div>
        ) : (
          filtered.map((student) => {
            const isInterno = student.modalidade === 'interno';

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isInterno
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {isInterno ? <School className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                          {student.nomeCompleto}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 text-2xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="font-mono">Matrícula: {student.matricula}</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                            {student.curso || 'Informática'}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            Turma {student.turma} ({student.anoEstudo})
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-3xs font-bold uppercase tracking-wider shrink-0 ${
                        isInterno
                          ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {isInterno ? 'Interno' : 'Externo'}
                    </span>
                  </div>

                  {/* Informações Principais do Estágio */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1.5 mb-4">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="text-slate-500 text-2xs">
                        {isInterno ? 'Setor na Escola:' : 'Empresa:'}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-right truncate">
                        {student.localEstagio}
                      </span>
                    </div>

                    {student.supervisorNome && (
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-slate-500 text-2xs">
                          Observações:
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 text-right truncate">
                          {student.supervisorNome}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-2xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {student.telefone ? student.telefone : <span className="italic text-slate-400">Sem celular</span>}
                      </span>
                      <span className="flex items-center gap-1 truncate max-w-44 text-right">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {student.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLaunchMeeting(student)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reunião do Mês
                    </button>

                    <button
                      onClick={() => onViewReport(student)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      Comprovante A4
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(student)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      title="Editar dados"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setStudentToDelete(student)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Excluir estagiário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Excluir Cadastro do Estagiário?"
        message={`Tem certeza que deseja excluir o cadastro do(a) aluno(a) ${studentToDelete?.nomeCompleto}? Todas as reuniões e relatórios deste aluno serão removidos permanentemente.`}
        itemDescription={`Matrícula: ${studentToDelete?.matricula} - ${studentToDelete?.nomeCompleto} (${studentToDelete?.curso} - ${studentToDelete?.turma}/${studentToDelete?.anoEstudo})`}
        confirmButtonText="Sim, Excluir Estagiário"
        onConfirm={handleConfirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
};
