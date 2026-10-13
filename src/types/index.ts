export type InternshipType = 'interno' | 'externo';

export type GenderType = 'Feminino' | 'Masculino' | 'Outro' | 'Prefiro não informar';

export type CourseType = 'Informática' | 'Jogos' | 'Redes';

export type MeetingStatus =
  | 'Presente'
  | 'Falta'
  | 'Estágio Cancelado'
  | 'Estágio Concluído'
  | 'Pendente';

export interface Student {
  id: string;
  matricula: string;
  nomeCompleto: string;
  sexo: GenderType;
  telefone: string;
  email: string;
  curso: CourseType;
  turma: string;
  anoEstudo: string; // Ano com exatamente 4 dígitos, ex: "2026", "2025", "2023"
  modalidade: InternshipType; // 'interno' (na escola) | 'externo' (na empresa)
  localEstagio: string; // Ex: "Laboratório de Informática" ou "Empresa Alfa Tech"
  supervisorNome: string;
  supervisorCargo?: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface MonthlyMeetingControl {
  id: string; // studentId + '_' + mesAno (ex: 'uuid_2026-10')
  studentId: string;
  mesAno: string; // 'YYYY-MM'
  ano: number;
  mes: number; // 1..12
  status: MeetingStatus;
  dataReuniao: string; // YYYY-MM-DD
  teveProblemaRotina?: boolean;
  relatoProblemaOuObservacao?: string;
  ultimaModificacao: string;
}

export interface SchoolSettings {
  nomeEscola: string;
  setorCoordenação: string;
  nomeCoordenador: string;
  cargoCoordenador: string;
  emailEscola?: string;
  logoUrl?: string;
}

export type UserRole = 'Administrador' | 'Coordenador';

export interface AppUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  email?: string;
  passwordHash: string;
  createdAt: string;
}
