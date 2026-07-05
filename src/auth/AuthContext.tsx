import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '../api/client';
import { getMe, login as loginReq, register as registerReq } from '../api/endpoints';
import type { LoginRequestBody, RegisterRequestBody, User } from '../api/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (body: LoginRequestBody) => Promise<User>;
  register: (body: RegisterRequestBody) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  };

  useEffect(() => {
    loadMe().finally(() => setLoading(false));
  }, []);

  const handleAuth = async (token: string): Promise<User> => {
    localStorage.setItem(TOKEN_KEY, token);
    const me = await getMe();
    setUser(me);
    return me;
  };

  const login = async (body: LoginRequestBody) => {
    const { token } = await loginReq(body);
    return handleAuth(token);
  };

  const register = async (body: RegisterRequestBody) => {
    const { token } = await registerReq(body);
    return handleAuth(token);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const refresh = async () => {
    await loadMe();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
