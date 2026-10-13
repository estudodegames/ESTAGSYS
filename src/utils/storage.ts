import {
  Student,
  MonthlyMeetingControl,
  SchoolSettings,
  AppUser,
} from '../types';
import { loadUsers, saveUsers } from './authStorage';

const STORAGE_KEYS = {
  STUDENTS: 'estagio_students_v4',
  MEETINGS: 'estagio_meetings_v4',
  SETTINGS: 'estagio_settings_v6',
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  nomeEscola: 'Colégio Técnico e Politécnico Estadual',
  setorCoordenação: 'Coordenação de Estágios Supervisionados e Acompanhamento Escolar',
  nomeCoordenador: 'Profª Andrea Vargas',
  cargoCoordenador: 'Orientação de estágio',
  emailEscola: 'estagios@colegio.edu.br',
};

// Seed Students (With Curso: Informática, Jogos, Redes and 4-digit Ano)
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stud-1',
    matricula: '20240112',
    nomeCompleto: 'Lucas Gabriel Souza',
    sexo: 'Masculino',
    telefone: '(11) 98452-1144',
    email: 'lucas.souza@estudante.edu.br',
    curso: 'Informática',
    turma: '3º A',
    anoEstudo: '2026',
    modalidade: 'interno',
    localEstagio: 'Laboratório de Informática da Escola',
    supervisorNome: 'Prof. Marcos Vinicius',
    supervisorCargo: 'Responsável pelo Laboratório',
    ativo: true,
    dataCriacao: '2026-02-10',
  },
  {
    id: 'stud-2',
    matricula: '20240188',
    nomeCompleto: 'Beatriz Mendes Silveira',
    sexo: 'Feminino',
    telefone: '(11) 97123-9090',
    email: 'beatriz.mendes@estudante.edu.br',
    curso: 'Jogos',
    turma: '3º B',
    anoEstudo: '2025',
    modalidade: 'externo',
    localEstagio: 'TecnoLog Soluções Corporativas Ltda',
    supervisorNome: 'Dra. Camila Rocha',
    supervisorCargo: 'Gerente de RH',
    ativo: true,
    dataCriacao: '2026-02-12',
  },
  {
    id: 'stud-3',
    matricula: '20240205',
    nomeCompleto: 'Guilherme Henrique Castro',
    sexo: 'Masculino',
    telefone: '(11) 99344-5511',
    email: 'guilherme.castro@estudante.edu.br',
    curso: 'Redes',
    turma: '2º C',
    anoEstudo: '2023',
    modalidade: 'interno',
    localEstagio: 'Secretaria Acadêmica da Escola',
    supervisorNome: 'Letícia Duarte',
    supervisorCargo: 'Secretária Geral',
    ativo: true,
    dataCriacao: '2026-03-01',
  },
  {
    id: 'stud-4',
    matricula: '20240319',
    nomeCompleto: 'Mariana Santos Oliveira',
    sexo: 'Feminino',
    telefone: '(11) 98822-3344',
    email: 'mariana.santos@estudante.edu.br',
    curso: 'Informática',
    turma: '3º A',
    anoEstudo: '2026',
    modalidade: 'externo',
    localEstagio: 'Clínica & Hospital Santa Clara (Setor de TI)',
    supervisorNome: 'Dr. Roberto Alencar',
    supervisorCargo: 'Diretor de Sistemas',
    ativo: true,
    dataCriacao: '2026-03-05',
  },
  {
    id: 'stud-5',
    matricula: '20240402',
    nomeCompleto: 'Rafael Augusto Pinheiro',
    sexo: 'Masculino',
    telefone: '(11) 97233-8899',
    email: 'rafael.pinheiro@estudante.edu.br',
    curso: 'Jogos',
    turma: '1º A',
    anoEstudo: '2025',
    modalidade: 'externo',
    localEstagio: 'Distribuidora Global Logística',
    supervisorNome: 'Fernando Dias',
    supervisorCargo: 'Supervisor de Logística',
    ativo: true,
    dataCriacao: '2026-03-10',
  },
];

// Helper to seed monthly meeting controls (Focus: Proof of attendance at school meeting)
function createSampleMeetings(): MonthlyMeetingControl[] {
  return [
    {
      id: 'stud-1_2026-10',
      studentId: 'stud-1',
      mesAno: '2026-10',
      ano: 2026,
      mes: 10,
      status: 'Presente',
      dataReuniao: '2026-10-02',
      teveProblemaRotina: false,
      relatoProblemaOuObservacao: 'Aluno compareceu à escola para a reunião mensal de acompanhamento. Informou que a rotina no laboratório segue normalmente sem problemas.',
      ultimaModificacao: '2026-10-02T10:00:00.000Z',
    },
    {
      id: 'stud-2_2026-10',
      studentId: 'stud-2',
      mesAno: '2026-10',
      ano: 2026,
      mes: 10,
      status: 'Presente',
      dataReuniao: '2026-10-03',
      teveProblemaRotina: false,
      relatoProblemaOuObservacao: 'Estagiária compareceu à escola. Relatou que as atividades na empresa estão fluindo bem e sem intercorrências no mês.',
      ultimaModificacao: '2026-10-03T14:30:00.000Z',
    },
    {
      id: 'stud-3_2026-10',
      studentId: 'stud-3',
      mesAno: '2026-10',
      ano: 2026,
      mes: 10,
      status: 'Falta',
      dataReuniao: '2026-10-04',
      teveProblemaRotina: false,
      relatoProblemaOuObservacao: 'Aluno não compareceu à reunião mensal convocada pela coordenação. Notificado por e-mail para justificativa.',
      ultimaModificacao: '2026-10-04T16:00:00.000Z',
    },
    {
      id: 'stud-4_2026-10',
      studentId: 'stud-4',
      mesAno: '2026-10',
      ano: 2026,
      mes: 10,
      status: 'Presente',
      dataReuniao: '2026-10-05',
      teveProblemaRotina: true,
      relatoProblemaOuObservacao: 'Estagiária compareceu. Relatou dúvida sobre compatibilidade de horário com as provas finais da escola; coordenação orientou ajuste junto ao supervisor da empresa.',
      ultimaModificacao: '2026-10-05T11:00:00.000Z',
    },
    {
      id: 'stud-5_2026-10',
      studentId: 'stud-5',
      mesAno: '2026-10',
      ano: 2026,
      mes: 10,
      status: 'Estágio Concluído',
      dataReuniao: '2026-10-01',
      teveProblemaRotina: false,
      relatoProblemaOuObservacao: 'Aluno compareceu e entregou o termo de encerramento do estágio. Estágio finalizado com sucesso.',
      ultimaModificacao: '2026-10-01T09:00:00.000Z',
    },
  ];
}

// Storage API
export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      saveStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading students:', e);
    return INITIAL_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students:', e);
  }
}

export function deleteStudent(studentId: string): void {
  const students = loadStudents().filter((s) => s.id !== studentId);
  saveStudents(students);
  // Also delete associated monthly meeting controls
  const meetings = loadAllMeetings().filter((m) => m.studentId !== studentId);
  saveAllMeetings(meetings);
}

export function loadAllMeetings(): MonthlyMeetingControl[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    if (!raw) {
      const sample = createSampleMeetings();
      saveAllMeetings(sample);
      return sample;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading meetings:', e);
    return [];
  }
}

export function saveAllMeetings(meetings: MonthlyMeetingControl[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  } catch (e) {
    console.error('Error saving meetings:', e);
  }
}

export function getStudentMeeting(
  studentId: string,
  mesAno: string
): MonthlyMeetingControl | null {
  const all = loadAllMeetings();
  return all.find((m) => m.studentId === studentId && m.mesAno === mesAno) || null;
}

export function saveStudentMeeting(meeting: MonthlyMeetingControl): void {
  const all = loadAllMeetings();
  const index = all.findIndex(
    (m) => m.studentId === meeting.studentId && m.mesAno === meeting.mesAno
  );
  if (index >= 0) {
    all[index] = { ...meeting, ultimaModificacao: new Date().toISOString() };
  } else {
    all.push({ ...meeting, ultimaModificacao: new Date().toISOString() });
  }
  saveAllMeetings(all);
}

export function loadSettings(): SchoolSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SchoolSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export interface AppExportData {
  version: string;
  exportDate: string;
  students: Student[];
  meetings: MonthlyMeetingControl[];
  schoolSettings: SchoolSettings;
  users?: AppUser[];
}

export function exportAllAppData(): AppExportData {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    students: loadStudents(),
    meetings: loadAllMeetings(),
    schoolSettings: loadSettings(),
    users: loadUsers(),
  };
}

export function importAllAppData(rawJsonOrObj: string | AppExportData): {
  success: boolean;
  message: string;
  countStudents: number;
  countMeetings: number;
} {
  try {
    let data: AppExportData;
    if (typeof rawJsonOrObj === 'string') {
      data = JSON.parse(rawJsonOrObj);
    } else {
      data = rawJsonOrObj;
    }

    if (!data || typeof data !== 'object') {
      return {
        success: false,
        message: 'Formato inválido: os dados fornecidos não contêm um objeto JSON válido.',
        countStudents: 0,
        countMeetings: 0,
      };
    }

    let countStudents = 0;
    let countMeetings = 0;

    if (Array.isArray(data.students)) {
      saveStudents(data.students);
      countStudents = data.students.length;
    }

    if (Array.isArray(data.meetings)) {
      saveAllMeetings(data.meetings);
      countMeetings = data.meetings.length;
    }

    if (data.schoolSettings && typeof data.schoolSettings === 'object') {
      saveSettings(data.schoolSettings);
    }

    if (Array.isArray(data.users)) {
      saveUsers(data.users);
    }

    return {
      success: true,
      message: `Sucesso! Foram importados ${countStudents} estagiários, ${countMeetings} registros de reunião e configurações escolares.`,
      countStudents,
      countMeetings,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro ao importar dados: ${err?.message || 'Arquivo corrompido ou formato não suportado'}.`,
      countStudents: 0,
      countMeetings: 0,
    };
  }
}

export function resetAllDataToDefault(): void {
  localStorage.removeItem(STORAGE_KEYS.STUDENTS);
  localStorage.removeItem(STORAGE_KEYS.MEETINGS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  saveStudents(INITIAL_STUDENTS);
  saveAllMeetings(createSampleMeetings());
  saveSettings(DEFAULT_SETTINGS);
}

