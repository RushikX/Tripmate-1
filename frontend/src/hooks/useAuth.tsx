
import { useState, useEffect, createContext, useContext } from 'react';
import { API_ENDPOINTS, api } from '@/lib/api';

interface User {
  _id: string;
  email: string;
  name: string;
  age: number;
  phone?: string;
  profilePicture?: string;
  userType: 'passenger' | 'driver' | 'owner' | 'admin';
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string, name: string, age: number) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and validate it
    const token = localStorage.getItem('tripmate_token');
    if (token) {
      validateToken();
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async () => {
    try {
      const userData = await api.get<User>(API_ENDPOINTS.AUTH.PROFILE);
      setUser(userData);
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('tripmate_token');
    } finally {
      setLoading(false);
    }
  };



  const signUp = async (email: string, password: string, name: string, age: number) => {
    try {
      const response = await api.post<{ token: string; user: User }>(
        API_ENDPOINTS.AUTH.REGISTER,
        { email, password, name, age }
      );
      
      localStorage.setItem('tripmate_token', response.token);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = 'Registration failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      return { error: { message: errorMessage } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<{ token: string; user: User }>(
        API_ENDPOINTS.AUTH.LOGIN,
        { email, password }
      );
      
      localStorage.setItem('tripmate_token', response.token);
      setUser(response.user);
      return { error: null };
    } catch (error: any) {
      // Extract error message from API response
      let errorMessage = 'Login failed';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error) {
        errorMessage = error.error;
      }
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('tripmate_token');
      setUser(null);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
