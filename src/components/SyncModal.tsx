import React, { useState } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Database,
  FileCode,
  RotateCcw,
} from 'lucide-react';
import {
  exportAllAppData,
  importAllAppData,
  AppExportData,
} from '../utils/storage';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'file' | 'code'>('quick');
  const [copiedQuick, setCopiedQuick] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  // Handler: Copy current preview data as JSON to clipboard
  const handleCopyAllData = async () => {
    try {
      const data = exportAllAppData();
      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopiedQuick(true);
      setStatusMessage({
        type: 'success',
        text: `Dados copiados com sucesso (${data.students.length} estagiários, ${data.meetings.length} registros). Agora abra a Vercel e use a opção "Colar e Aplicar"!`,
      });
      setTimeout(() => setCopiedQuick(false), 3000);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Não foi possível copiar automaticamente para a área de transferência. Tente baixar o arquivo de backup.',
      });
    }
  };

  // Handler: Apply pasted JSON
  const handleApplyPastedData = () => {
    if (!pasteContent.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Cole o texto do backup JSON no campo antes de aplicar.',
      });
      return;
    }

    const result = importAllAppData(pasteContent);
    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: result.message,
      });
      setPasteContent('');
      onDataImported();
      setTimeout(() => {
        setStatusMessage(null);
        onClose();
      }, 1800);
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message,
      });
    }
  };

  // Handler: Download Backup File
  const handleDownloadFile = () => {
    try {
      const data = exportAllAppData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `backup-estagio-frequencia-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: 'Arquivo de backup baixado com sucesso! Você pode carregá-lo no Vercel quando quiser.',
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Erro ao gerar o download do arquivo de backup.',
      });
    }
  };

  // Handler: Upload and Restore Backup File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importAllAppData(content);
      if (result.success) {
        setStatusMessage({
          type: 'success',
          text: result.message,
        });
        onDataImported();
        setTimeout(() => {
          setStatusMessage(null);
          onClose();
        }, 1800);
      } else {
        setStatusMessage({
          type: 'error',
          text: result.message,
        });
      }
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: 'Falha ao ler o arquivo selecionado.',
      });
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  // Handler: Copy code for chat
  const handleCopyCodeForAssistant = async () => {
    try {
      const data = exportAllAppData();
      const codePayload = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(codePayload);
      setCopiedCode(true);
      setStatusMessage({
        type: 'success',
        text: 'Dados copiados! Cole essa mensagem no chat para que eu grave esses dados como padrão definitivo no código do seu projeto para o Vercel.',
      });
      setTimeout(() => setCopiedCode(false), 3500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Erro ao copiar código.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Sincronizar Dados
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  Preview ⇄ Vercel
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transfira tudo o que você cadastrou entre o Preview e o Vercel em segundos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explain Card */}
        <div className="px-6 pt-4 pb-2">
          <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 rounded-xl flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <p className="font-semibold">
                Por que os dados digitados no Preview não aparecem sozinhos no Vercel?
              </p>
              <p className="text-2xs text-blue-800 dark:text-blue-300 leading-relaxed">
                Navegadores como Chrome e Edge isolam os dados salvos de endereços diferentes por segurança (o Preview tem um link e o Vercel tem outro). Com os botões abaixo, você transfere todos os cadastros com 1 clique!
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-2">
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
            <button
              onClick={() => setActiveTab('quick')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'quick'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transferência Rápida (Copiar & Colar)
            </button>

            <button
              onClick={() => setActiveTab('file')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'file'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <Database className="w-4 h-4" />
              Arquivo de Backup (.json)
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'code'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Gravar de Fábrica no Código
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: Transferência Rápida */}
          {activeTab === 'quick' && (
            <div className="space-y-5">
              {/* Passo 1: Copiar */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Copiar todos os dados deste ambiente
                    </h3>
                  </div>
                  <button
                    onClick={handleCopyAllData}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    {copiedQuick ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Tudo
                      </>
                    )}
                  </button>
                </div>
                <p className="text-2xs text-slate-600 dark:text-slate-400">
                  Copia alunos, turmas, notas da reunião mensal e configurações escolares para a área de transferência.
                </p>
              </div>

              {/* Passo 2: Colar */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Colar dados trazidos do outro ambiente
                  </h3>
                </div>
                <p className="text-2xs text-slate-600 dark:text-slate-400 mb-3">
                  Quando você abrir a Vercel (ou o Preview), abra este modal e cole os dados copiados aqui para carregar instantaneamente:
                </p>
                <textarea
                  rows={4}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                  placeholder="Cole aqui o texto copiado (começa com { ... })"
                  className="w-full p-2.5 text-2xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleApplyPastedData}
                    disabled={!pasteContent.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Salvar e Carregar no App
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Arquivo de Backup */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-indigo-600" />
                    Baixar Arquivo de Backup Completo (.json)
                  </h3>
                  <p className="text-2xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Gera um arquivo seguro no seu computador para guardar ou transferir para a Vercel.
                  </p>
                </div>
                <button
                  onClick={handleDownloadFile}
                  className="px-4 py-2 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 dark:hover:bg-indigo-900 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Baixar Backup
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    Restaurar / Carregar Arquivo de Backup (.json)
                  </h3>
                  <p className="text-2xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Substitui ou atualiza os registros do aplicativo pelo arquivo selecionado.
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-xs">
                  <Upload className="w-4 h-4" />
                  Selecionar Arquivo
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Gravar Definitivo no Código */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  Como fazer a Vercel já vir com tudo cadastrado por padrão?
                </div>
                <p className="text-2xs leading-relaxed text-amber-800 dark:text-amber-300">
                  Para que qualquer pessoa (ou você mesmo) abra a Vercel e tudo já apareça cadastrado de fábrica sem precisar importar nada, basta me enviar esses dados no chat! Eu gravo eles diretamente nos arquivos do código-fonte do projeto.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Copiar Dados Atuais para o Assistente:
                  </h4>
                  <button
                    onClick={handleCopyCodeForAssistant}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Dados para o Chat
                      </>
                    )}
                  </button>
                </div>
                <p className="text-2xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  1. Clique no botão acima para copiar os seus dados atuais.
                  <br />
                  2. Cole na mensagem do chat dizendo: <em>&quot;Gravar esses dados como padrão no código&quot;</em>.
                  <br />
                  3. O assistente atualizará o código-fonte e o próximo build do Vercel já terá tudo carregado automaticamente por padrão!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            Seus dados são salvos localmente com total privacidade.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
