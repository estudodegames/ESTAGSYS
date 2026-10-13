import React, { useState, useEffect } from 'react';
import { Student, InternshipType, GenderType, CourseType } from '../types';
import { formatPhone } from '../utils/dateUtils';
import { X, School, Building2, Check, UserPlus } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  studentToEdit?: Student | null;
  onSave: (student: Student) => void;
  onClose: () => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  studentToEdit,
  onSave,
  onClose,
}) => {
  const [modalidade, setModalidade] = useState<InternshipType>('externo');
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [matricula, setMatricula] = useState('');
  const [sexo, setSexo] = useState<GenderType>('Feminino');
  const [curso, setCurso] = useState<CourseType>('Informática');
  const [turma, setTurma] = useState('');
  const [anoEstudo, setAnoEstudo] = useState('2026');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [localEstagio, setLocalEstagio] = useState('');
  const [supervisorNome, setSupervisorNome] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (studentToEdit) {
      setModalidade(studentToEdit.modalidade);
      setNomeCompleto(studentToEdit.nomeCompleto);
      setMatricula(studentToEdit.matricula);
      setSexo(studentToEdit.sexo);
      setCurso(studentToEdit.curso || 'Informática');
      setTurma(studentToEdit.turma);
      setAnoEstudo(studentToEdit.anoEstudo ? studentToEdit.anoEstudo.replace(/\D/g, '').slice(0, 4) : '2026');
      setTelefone(studentToEdit.telefone);
      setEmail(studentToEdit.email);
      setLocalEstagio(studentToEdit.localEstagio);
      setSupervisorNome(studentToEdit.supervisorNome || '');
    } else {
      setModalidade('externo');
      setNomeCompleto('');
      setMatricula('');
      setSexo('Feminino');
      setCurso('Informática');
      setTurma('');
      setAnoEstudo('2026');
      setTelefone('');
      setEmail('');
      setLocalEstagio('');
      setSupervisorNome('');
    }
    setErrors({});
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatPhone(e.target.value));
  };

  const handleAnoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allows digits, up to 4 characters
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
    setAnoEstudo(digitsOnly);
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!nomeCompleto.trim()) err.nomeCompleto = 'Digite o nome completo do aluno.';
    if (!matricula.trim()) err.matricula = 'Informe a matrícula escolar.';
    if (!turma.trim()) err.turma = 'Informe a turma.';
    if (!anoEstudo.trim() || anoEstudo.length !== 4) {
      err.anoEstudo = 'Informe o ano com 4 números (ex: 2023, 2025 ou 2026).';
    }
    if (telefone.trim() && telefone.length < 14) {
      err.telefone = 'Se preenchido, informe o celular com DDD (Ex: 11 98888-7777).';
    }
    if (!email.trim() || !email.includes('@')) err.email = 'E-mail válido é obrigatório.';
    if (!localEstagio.trim()) {
      err.localEstagio =
        modalidade === 'interno'
          ? 'Informe o setor da escola (ex: Laboratório de Informática).'
          : 'Informe o nome da empresa concedente.';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: studentToEdit ? studentToEdit.id : `stud-${Date.now()}`,
      matricula: matricula.trim(),
      nomeCompleto: nomeCompleto.trim(),
      sexo,
      curso,
      telefone: telefone.trim(),
      email: email.trim().toLowerCase(),
      turma: turma.trim(),
      anoEstudo: anoEstudo.trim(),
      modalidade,
      localEstagio: localEstagio.trim(),
      supervisorNome: supervisorNome.trim(),
      supervisorCargo: '',
      ativo: true,
      dataCriacao: studentToEdit ? studentToEdit.dataCriacao : new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Limpo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {studentToEdit ? 'Editar Estagiário' : 'Novo Cadastro de Estagiário'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Preencha os dados do estudante, curso e local de estágio
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário Limpo e Organizado */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Seletor de Modalidade: Interno ou Externo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Modalidade do Estágio
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
              <button
                type="button"
                onClick={() => setModalidade('externo')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  modalidade === 'externo'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Estágio Externo (Na Empresa)</span>
              </button>

              <button
                type="button"
                onClick={() => setModalidade('interno')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  modalidade === 'interno'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Estágio Interno (Na Escola)</span>
              </button>
            </div>
          </div>

          {/* Dados do Aluno */}
          <div className="space-y-3.5">
            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo do Aluno *
              </label>
              <input
                type="text"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                placeholder="Ex: Beatriz Mendes Silveira"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
              />
              {errors.nomeCompleto && (
                <p className="text-xs text-rose-500 mt-1">{errors.nomeCompleto}</p>
              )}
            </div>

            {/* Matrícula e Sexo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Matrícula Escolar *
                </label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  placeholder="Ex: 20240188"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                />
                {errors.matricula && (
                  <p className="text-xs text-rose-500 mt-1">{errors.matricula}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sexo *
                </label>
                <select
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value as GenderType)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                >
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Outro">Outro</option>
                  <option value="Prefiro não informar">Prefiro não informar</option>
                </select>
              </div>
            </div>

            {/* CURSO, TURMA e ANO (4 DÍGITOS) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Campo Curso: Informática / Jogos / Redes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Curso *
                </label>
                <select
                  value={curso}
                  onChange={(e) => setCurso(e.target.value as CourseType)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                >
                  <option value="Informática">Informática</option>
                  <option value="Jogos">Jogos</option>
                  <option value="Redes">Redes</option>
                </select>
              </div>

              {/* Campo Turma */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Turma *
                </label>
                <input
                  type="text"
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  placeholder="Ex: 3º A, Turma B"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                />
                {errors.turma && (
                  <p className="text-xs text-rose-500 mt-1">{errors.turma}</p>
                )}
              </div>

              {/* Campo Ano com 4 dígitos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ano na Turma (4 dígitos) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={anoEstudo}
                  onChange={handleAnoChange}
                  placeholder="Ex: 2026, 2025, 2023"
                  className="w-full px-3.5 py-2.5 text-sm font-mono tracking-wider bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                />
                {errors.anoEstudo && (
                  <p className="text-xs text-rose-500 mt-1">{errors.anoEstudo}</p>
                )}
              </div>
            </div>

            {/* Telefone e E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefone Celular (Opcional)
                </label>
                <input
                  type="tel"
                  value={telefone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                />
                {errors.telefone && (
                  <p className="text-xs text-rose-500 mt-1">{errors.telefone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@escola.edu.br"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Local do Estágio e Responsável */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {modalidade === 'interno' ? 'Setor da Escola onde Estagia *' : 'Nome da Empresa Concedente *'}
              </label>
              <input
                type="text"
                value={localEstagio}
                onChange={(e) => setLocalEstagio(e.target.value)}
                placeholder={
                  modalidade === 'interno'
                    ? 'Ex: Laboratório de Informática, Biblioteca, Secretaria'
                    : 'Ex: TecnoLog Soluções Corporativas Ltda'
                }
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
              />
              {errors.localEstagio && (
                <p className="text-xs text-rose-500 mt-1">{errors.localEstagio}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observações
              </label>
              <input
                type="text"
                value={supervisorNome}
                onChange={(e) => setSupervisorNome(e.target.value)}
                placeholder="Observações sobre o estágio ou aluno (opcional)"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Botões de Ação Limpos */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              {studentToEdit ? (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Cadastrar Estagiário
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
