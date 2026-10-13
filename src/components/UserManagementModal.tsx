import React, { useState } from 'react';
import { AppUser } from '../types';
import { loadUsers, registerUser, deleteUser } from '../utils/authStorage';
import {
  Users,
  UserPlus,
  Trash2,
  X,
  Shield,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface UserManagementModalProps {
  isOpen: boolean;
  currentUser: AppUser;
  onClose: () => void;
  onUsersUpdated?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onUsersUpdated,
}) => {
  const [users, setUsers] = useState<AppUser[]>(() => loadUsers());
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'Administrador' | 'Coordenador'>('Administrador');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);

  if (!isOpen) return null;

  const refreshList = () => {
    setUsers(loadUsers());
    if (onUsersUpdated) onUsersUpdated();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newUsername.trim() || !newFullName.trim() || !newPassword) {
      setError('Preencha os campos obrigatórios.');
      return;
    }

    if (newPassword.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    const res = registerUser({
      username: newUsername.trim(),
      fullName: newFullName.trim(),
      role: newRole,
      email: newEmail.trim(),
      passwordHash: newPassword,
    });

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(`Usuário "${newUsername}" criado com sucesso!`);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewPassword('');
      setIsAddingNew(false);
      refreshList();
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    const res = deleteUser(userToDelete.id, currentUser.id);
    if (!res.success) {
      setError(res.error || 'Erro ao excluir usuário.');
    } else {
      setSuccess(`Usuário "${userToDelete.username}" excluído.`);
      refreshList();
      setTimeout(() => setSuccess(null), 3000);
    }
    setUserToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Gestão de Usuários e Administradores
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gerencie quem pode acessar e lançar frequências no sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Action to show create form */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Usuários Cadastrados ({users.length})
            </span>
            {!isAddingNew && (
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Novo Administrador
              </button>
            )}
          </div>

          {/* Add New User Collapsible Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateUser}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-indigo-200 dark:border-indigo-900/60 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Cadastrar Novo Usuário / Administrador
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Ex: Prof. José da Silva"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome de Usuário (Login) *
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Ex: josesilva"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Função *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Coordenador">Coordenador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-2xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-mail institucional
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="usuario@escola.edu.br"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Salvar Usuário
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            {users.map((u) => {
              const isSelf = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-sm shrink-0">
                      {u.role === 'Administrador' ? (
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <Shield className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {u.fullName}
                        </span>
                        {isSelf && (
                          <span className="px-2 py-0.5 text-3xs font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-full">
                            Você
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="font-mono">@{u.username}</span>
                        <span>•</span>
                        <span>{u.role}</span>
                        {u.email && (
                          <>
                            <span>•</span>
                            <span>{u.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {!isSelf && (
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Excluir Usuário"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        title="Excluir Usuário do Sistema?"
        message={`Tem certeza que deseja remover o usuário @${userToDelete?.username} (${userToDelete?.fullName})? Esta pessoa não poderá mais acessar o sistema.`}
        itemDescription={`@${userToDelete?.username} - ${userToDelete?.fullName}`}
        confirmButtonText="Sim, Excluir Usuário"
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
