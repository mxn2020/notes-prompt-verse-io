import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { api } from '../utils/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_UPDATE'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'AUTH_UPDATE':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: async () => {},
  refreshAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initial auth check
  useEffect(() => {
    let mounted = true;

    const checkAuthStatus = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        const response = await api.get('/auth/me');
        
        if (!mounted) return;
        
        if (response.data.success && response.data.data) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Not authenticated' });
        }
      } catch (error: any) {
        if (!mounted) return;
        
        // Only log non-401 errors as they are expected when not authenticated
        if (error.response?.status !== 401) {
          console.error('Auth check error:', error);
        }
        dispatch({ type: 'AUTH_FAILURE', payload: 'Not authenticated' });
      }
    };

    checkAuthStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
      } else {
        const errorMessage = response.data.error || 'Login failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await api.post('/auth/register', credentials);
      
      if (response.data.success && response.data.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
      } else {
        const errorMessage = response.data.error || 'Registration failed';
        dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/auth/user', userData);
      
      if (response.data.success && response.data.data && state.user) {
        dispatch({ 
          type: 'AUTH_UPDATE', 
          payload: { ...state.user, ...response.data.data }
        });
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const refreshAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await api.get('/auth/me');
      
      if (response.data.success && response.data.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        login, 
        register, 
        logout, 
        updateUser, 
        refreshAuth 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};