import Cookies from 'js-cookie';
import type { User } from './types';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function getUser(): User | null {
  const raw = Cookies.get(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setAuth(accessToken: string, user: User) {
  Cookies.set(TOKEN_KEY, accessToken, { expires: 7 });
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
}

export function clearAuth() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
}
