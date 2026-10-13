import { AppUser } from '../types';

const USERS_STORAGE_KEY = 'estagio_users_v1';
const SESSION_STORAGE_KEY = 'estagio_auth_session_v1';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    fullName: 'Prof. Carlos Eduardo Silveira',
    role: 'Administrador',
    email: 'admin@colegio.edu.br',
    passwordHash: 'admin123',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user-coord',
    username: 'coordenacao',
    fullName: 'Coordenação Geral de Estágios',
    role: 'Coordenador',
    email: 'estagios@colegio.edu.br',
    passwordHash: 'estagio2026',
    createdAt: '2026-02-01T10:00:00.000Z',
  },
];

export function loadUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load users:', e);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function getCurrentSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setCurrentSession(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to update session:', e);
  }
}

export function loginUser(username: string, password: string): { user?: AppUser; error?: string } {
  const users = loadUsers();
  const cleanUsername = username.trim().toLowerCase();
  const found = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!found) {
    return { error: 'Usuário não encontrado. Verifique o nome de usuário digitado.' };
  }

  if (found.passwordHash !== password) {
    return { error: 'Senha incorreta. Tente novamente.' };
  }

  setCurrentSession(found);
  return { user: found };
}

export function registerUser(newUser: Omit<AppUser, 'id' | 'createdAt'>): { user?: AppUser; error?: string } {
  const users = loadUsers();
  const cleanUsername = newUser.username.trim().toLowerCase();

  if (cleanUsername.length < 3) {
    return { error: 'O nome de usuário deve ter no mínimo 3 caracteres.' };
  }

  const alreadyExists = users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (alreadyExists) {
    return { error: `O nome de usuário "${newUser.username}" já está em uso.` };
  }

  const created: AppUser = {
    ...newUser,
    id: `user-${Date.now()}`,
    username: cleanUsername,
    createdAt: new Date().toISOString(),
  };

  users.push(created);
  saveUsers(users);
  return { user: created };
}

export function deleteUser(userId: string, currentUserId: string): { success: boolean; error?: string } {
  if (userId === currentUserId) {
    return { success: false, error: 'Você não pode excluir o seu próprio usuário logado.' };
  }

  const users = loadUsers();
  const remainingAdmins = users.filter((u) => u.role === 'Administrador' && u.id !== userId);

  if (remainingAdmins.length === 0) {
    return { success: false, error: 'O sistema deve manter pelo menos um Administrador cadastrado.' };
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  return { success: true };
}
