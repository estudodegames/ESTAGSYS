import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Student,
  MonthlyMeetingControl,
  SchoolSettings,
} from '../types';
import { MESES_NOMES, formatDateBr, getStatusDetails } from './dateUtils';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export Individual Student Monthly Meeting Report to CSV
 */
export function exportStudentMonthlyMeetingCsv(
  student: Student,
  meeting: MonthlyMeetingControl,
  settings: SchoolSettings
): void {
  const mesNome = MESES_NOMES[meeting.mes - 1];
  const BOM = '\uFEFF';

  let csv = BOM;
  csv += `COMPROVANTE DE COMPARECIMENTO À REUNIÃO MENSAL DE ESTÁGIO;;\n`;
  csv += `Instituição;${settings.nomeEscola};\n`;
  csv += `Coordenação;${settings.setorCoordenação};\n`;
  csv += `Mês de Referência;${mesNome} / ${meeting.ano};\n\n`;

  csv += `DADOS DO ESTAGIÁRIO;;\n`;
  csv += `Nome Completo;${student.nomeCompleto};\n`;
  csv += `Matrícula;${student.matricula};\n`;
  csv += `Sexo;${student.sexo};\n`;
  csv += `Curso;${student.curso || 'Informática'};\n`;
  csv += `Turma;${student.turma};\n`;
  csv += `Ano de Estudo;${student.anoEstudo};\n`;
  csv += `Telefone;${student.telefone};\n`;
  csv += `E-mail;${student.email};\n`;
  csv += `Modalidade;${student.modalidade === 'interno' ? 'Estágio Interno (Escola)' : 'Estágio Externo (Empresa)'};\n`;
  csv += `Local / Setor / Empresa;${student.localEstagio};\n`;
  csv += `Supervisor no Local;${student.supervisorNome};\n\n`;

  csv += `REGISTRO DE COMPARECIMENTO À ESCOLA;;\n`;
  csv += `Status do Comparecimento;${meeting.status};\n`;
  csv += `Data da Reunião;${meeting.dataReuniao ? formatDateBr(meeting.dataReuniao) : 'Não realizada'};\n`;
  csv += `Houve Problema na Rotina do Estágio?;${meeting.teveProblemaRotina ? 'Sim, relatou ocorrência' : 'Não, rotina regular'};\n`;
  if (meeting.relatoProblemaOuObservacao) {
    csv += `Relato / Observações da Reunião;"${meeting.relatoProblemaOuObservacao.replace(/;/g, ',')}";\n`;
  }

  const sanitizedName = student.nomeCompleto.replace(/\s+/g, '_');
  const filename = `Comprovante_Reuniao_${sanitizedName}_${meeting.ano}_${String(meeting.mes).padStart(2, '0')}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export Consolidated Meetings Table to CSV
 */
export function exportConsolidatedMeetingCsv(
  students: Student[],
  meetings: MonthlyMeetingControl[],
  mesAno: string,
  settings: SchoolSettings
): void {
  const [yearStr, monthStr] = mesAno.split('-');
  const monthNum = parseInt(monthStr, 10);
  const mesNome = MESES_NOMES[monthNum - 1];
  const BOM = '\uFEFF';

  let csv = BOM;
  csv += `RELATÓRIO MENSAL DE COMPARECIMENTO ÀS REUNIÕES DE ESTÁGIO;;\n`;
  csv += `Instituição;${settings.nomeEscola};\n`;
  csv += `Coordenação;${settings.setorCoordenação};\n`;
  csv += `Orientação de Estágio;Profª Andrea Vargas;\n`;
  csv += `Mês de Referência;${mesNome} / ${yearStr};\n\n`;

  csv += `Matrícula;Nome Completo;Sexo;Curso;Turma;Ano;Telefone;E-mail;Modalidade;Local Estágio;Status na Reunião;Data Reunião;Problema na Rotina?;Observações\n`;

  students.forEach((s) => {
    const m = meetings.find((item) => item.studentId === s.id && item.mesAno === mesAno);
    const status = m ? m.status : 'Pendente';
    const dataR = m?.dataReuniao ? formatDateBr(m.dataReuniao) : '—';
    const problema = m?.teveProblemaRotina ? 'Sim' : 'Não';
    const obs = m?.relatoProblemaOuObservacao ? m.relatoProblemaOuObservacao.replace(/;/g, ',') : '';
    const modalidadeStr = s.modalidade === 'interno' ? 'Interno (Escola)' : 'Externo (Empresa)';

    csv += `"${s.matricula}";"${s.nomeCompleto}";"${s.sexo}";"${s.curso || 'Informática'}";"${s.turma}";"${s.anoEstudo}";"${s.telefone}";"${s.email}";"${modalidadeStr}";"${s.localEstagio}";"${status}";"${dataR}";"${problema}";"${obs}"\n`;
  });

  const filename = `Relatorio_Mensal_Reunioes_${yearStr}_${monthStr}.csv`;
  downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}

/**
 * Builds the jsPDF instance for the Student Monthly Meeting Document
 */
export function buildStudentMonthlyMeetingDoc(
  student: Student,
  meeting: MonthlyMeetingControl,
  settings: SchoolSettings
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const mesNome = MESES_NOMES[meeting.mes - 1];
  const primaryColor: [number, number, number] = [30, 41, 59];
  const accentColor: [number, number, number] = [79, 70, 229];

  // Header Institucional
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(settings.nomeEscola.toUpperCase(), 14, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(settings.setorCoordenação, 14, 20);
  if (settings.emailEscola) {
    doc.text(`E-mail: ${settings.emailEscola}`, 14, 24);
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 27, 196, 27);

  // Document Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('COMPROVANTE DE COMPARECIMENTO À REUNIÃO MENSAL DE ESTÁGIO', 14, 33);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(`MÊS DE REFERÊNCIA: ${mesNome.toUpperCase()} / ${meeting.ano}`, 14, 38);

  // 1. Box do Aluno
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 42, 182, 38, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setTextColor(...primaryColor);

  doc.setFont('helvetica', 'bold');
  doc.text('1. DADOS DO(A) ESTAGIÁRIO(A) E LOCAL DO ESTÁGIO', 17, 47);

  doc.setFont('helvetica', 'bold');
  doc.text('Nome:', 17, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(student.nomeCompleto, 35, 53);

  doc.setFont('helvetica', 'bold');
  doc.text('Matrícula:', 130, 53);
  doc.setFont('helvetica', 'normal');
  doc.text(student.matricula, 148, 53);

  doc.setFont('helvetica', 'bold');
  doc.text('Curso:', 17, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(student.curso || 'Informática', 28, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Turma:', 56, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(student.turma, 68, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Ano:', 88, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(student.anoEstudo, 96, 59);

  // Campo Sexo com destaque e espaçamento claro em relação ao campo anterior (Ano)
  doc.setFont('helvetica', 'bold');
  doc.text('Sexo:', 116, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(student.sexo, 127, 59);

  doc.setFont('helvetica', 'bold');
  doc.text('Contato:', 150, 59);
  doc.setFont('helvetica', 'normal');
  doc.text(student.telefone || 'Não informado', 163, 59);

  const modalidadeStr =
    student.modalidade === 'interno'
      ? '[X] ESTÁGIO INTERNO (Na Escola)   [ ] ESTÁGIO EXTERNO'
      : '[ ] ESTÁGIO INTERNO   [X] ESTÁGIO EXTERNO (Na Empresa Concedente)';
  doc.setFont('helvetica', 'bold');
  doc.text('Modalidade:', 17, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(modalidadeStr, 38, 65);

  doc.setFont('helvetica', 'bold');
  doc.text(student.modalidade === 'interno' ? 'Setor na Escola:' : 'Empresa:', 17, 71);
  doc.setFont('helvetica', 'normal');
  const obsInfo = student.supervisorNome && student.supervisorNome !== 'A definir' ? ` • Observações: ${student.supervisorNome}` : '';
  doc.text(`${student.localEstagio}${obsInfo}`, 38, 71);

  // 2. Box do Registro da Reunião Mensal
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 84, 182, 55, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('2. REGISTRO DE COMPARECIMENTO À ESCOLA E ROTINA NO MÊS', 17, 89);

  doc.setFont('helvetica', 'bold');
  doc.text('Situação do Aluno:', 17, 97);
  doc.setFont('helvetica', 'normal');
  doc.text(meeting.status.toUpperCase(), 48, 97);

  doc.setFont('helvetica', 'bold');
  doc.text('Data do Comparecimento:', 110, 97);
  doc.setFont('helvetica', 'normal');
  doc.text(meeting.dataReuniao ? formatDateBr(meeting.dataReuniao) : 'Pendente / Não realizada', 148, 97);

  doc.setFont('helvetica', 'bold');
  doc.text('Houve Problema na Rotina?:', 17, 104);
  doc.setFont('helvetica', 'normal');
  doc.text(meeting.teveProblemaRotina ? 'SIM (Ocorrência relatada abaixo)' : 'NÃO (Rotina regular de estágio)', 60, 104);

  doc.setFont('helvetica', 'bold');
  doc.text('Relato do Estagiário / Observações da Coordenação:', 17, 112);

  doc.setFont('helvetica', 'normal');
  const relatoTxt =
    meeting.relatoProblemaOuObservacao ||
    (meeting.status === 'Presente'
      ? 'O estagiário compareceu à reunião mensal na escola. Informou que a rotina de atividades no estágio segue normalmente, sem problemas ou impedimentos.'
      : meeting.status === 'Falta'
      ? 'O aluno não compareceu à reunião mensal convocada pela coordenação da escola.'
      : `Situação do estágio: ${meeting.status}.`);
  const splitRelato = doc.splitTextToSize(relatoTxt, 174);
  doc.text(splitRelato.slice(0, 3), 17, 118);

  // 3. Assinatura da Professora
  const sigY = 160;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('3. DECLARAÇÃO E ASSINATURA', 14, sigY);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Declaro para os devidos fins de supervisão pedagógica que o registro de comparecimento à reunião mensal é fiel à verdade.',
    14,
    sigY + 5
  );

  // Linha de assinatura da Professora (centralizada)
  const lineY = sigY + 28;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.4);

  doc.line(65, lineY, 145, lineY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(settings.nomeCoordenador || 'Profª Andrea Vargas', 105, lineY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Orientação de estágio', 105, lineY + 8, { align: 'center' });

  // Rodapé
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Emissão em ${new Date().toLocaleDateString('pt-BR')} • Sistema de Frequência de Estágio Escolar`,
    105,
    285,
    { align: 'center' }
  );

  return doc;
}

/**
 * Export Individual Student Monthly Meeting Document to PDF (Official 1-Page Comprovante)
 */
export function exportStudentMonthlyMeetingPdf(
  student: Student,
  meeting: MonthlyMeetingControl,
  settings: SchoolSettings
): void {
  const doc = buildStudentMonthlyMeetingDoc(student, meeting, settings);
  const sanitizedName = student.nomeCompleto.replace(/\s+/g, '_');
  const filename = `Comprovante_Reuniao_${sanitizedName}_${meeting.ano}_${String(meeting.mes).padStart(2, '0')}.pdf`;
  doc.save(filename);
}

/**
 * Direct Print Student Monthly Meeting Document
 * Opens the system printer dialog directly or via an auto-print PDF
 */
export function printStudentMonthlyMeeting(
  student: Student,
  meeting: MonthlyMeetingControl,
  settings: SchoolSettings
): string {
  const doc = buildStudentMonthlyMeetingDoc(student, meeting, settings);
  doc.autoPrint({ variant: 'non-conform' });

  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // 1. Try window.print() directly
  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Direct window.print blocked:', err);
  }

  // 2. Try invisible iframe with the PDF autoPrint
  try {
    let iframe = document.getElementById('auto-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'auto-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.style.opacity = '0';
      document.body.appendChild(iframe);
    }
    iframe.src = blobUrl;
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print blocked:', err);
      }
    };
  } catch (err) {
    console.warn('Iframe setup error:', err);
  }

  // 3. Trigger opening in new tab (triggers native browser PDF print dialog)
  try {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 300);
  } catch (err) {
    console.warn('Auto print tab opening blocked:', err);
  }

  return blobUrl;
}

/**
 * Export Consolidated Meeting Document to PDF
 */
export function exportConsolidatedMeetingPdf(
  students: Student[],
  meetings: MonthlyMeetingControl[],
  mesAno: string,
  settings: SchoolSettings
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const [yearStr, monthStr] = mesAno.split('-');
  const monthNum = parseInt(monthStr, 10);
  const mesNome = MESES_NOMES[monthNum - 1];

  // Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(settings.nomeEscola.toUpperCase(), 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${settings.setorCoordenação} — Orientação de estágio: Profª Andrea Vargas (${mesNome} / ${yearStr})`,
    14,
    19
  );

  // Table Data
  const head = [
    [
      'Matrícula',
      'Nome Completo',
      'Curso',
      'Turma/Ano',
      'Modalidade',
      'Local / Empresa',
      'Data Reunião',
      'Status',
      'Problema?',
    ],
  ];

  const body = students.map((s) => {
    const m = meetings.find((item) => item.studentId === s.id && item.mesAno === mesAno);
    const status = m ? m.status : 'Pendente';
    const dataR = m?.dataReuniao ? formatDateBr(m.dataReuniao) : '—';
    const modalidade = s.modalidade === 'interno' ? 'Interno (Escola)' : 'Externo (Empresa)';
    const problema = m?.teveProblemaRotina ? 'Sim' : 'Não / Regular';

    return [
      s.matricula,
      s.nomeCompleto,
      s.curso || 'Informática',
      `${s.turma} (${s.anoEstudo})`,
      modalidade,
      s.localEstagio,
      dataR,
      status,
      problema,
    ];
  });

  autoTable(doc, {
    head,
    body,
    startY: 24,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 160;
  if (finalY < 175) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.line(14, finalY + 16, 95, finalY + 16);
    doc.text('Profª Andrea Vargas', 14, finalY + 20);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Orientação de estágio', 14, finalY + 24);
  }

  const filename = `Relatorio_Consolidado_Reunioes_${yearStr}_${monthStr}.pdf`;
  doc.save(filename);
}
