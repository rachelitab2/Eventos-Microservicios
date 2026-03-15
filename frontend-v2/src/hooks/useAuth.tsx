import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';

interface UserSession {
  userId: string | number;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
  login: (data: UserSession, token?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const uid = localStorage.getItem('authUserId');
    const uname = localStorage.getItem('username');
    const uemail = localStorage.getItem('email');
    const urole = localStorage.getItem('authRole');

    if (uid && uname && uemail && urole) {
      setSession({
        userId: uid,
        username: uname,
        email: uemail,
        role: urole
      });
    }
    setIsLoading(false);
  }, []);

  const login = (data: UserSession, token?: string) => {
    localStorage.setItem('authUserId', String(data.userId));
    localStorage.setItem('username', data.username);
    localStorage.setItem('email', data.email);
    localStorage.setItem('authRole', data.role);
    if (token) {
      localStorage.setItem('authToken', token);
    }
    setSession(data);
  };

  const logout = () => {
    localStorage.removeItem('authUserId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('authRole');
    localStorage.removeItem('authToken');
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
