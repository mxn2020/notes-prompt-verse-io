import React, { createContext, useReducer, useEffect, useState } from 'react';
import { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';
import { api } from '../utils/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
  | { type: 'AUTH_UPDATE'; payload: User };

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
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        const response = await api.get('/auth/me');
        
        if (response.data.success) {
          dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
        }
      } catch (error) {
        dispatch({ type: 'AUTH_FAILURE', payload: 'Not authenticated' });
      } finally {
        setInitialized(true);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.data.error || 'Login failed' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.error || 'Login failed. Please try again.'
      });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/register', credentials);
      
      if (response.data.success) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.data });
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: response.data.error || 'Registration failed' });
      }
    } catch (error: any) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout on client side even if API fails
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/auth/user', userData);
      
      if (response.data.success && state.user) {
        dispatch({ 
          type: 'AUTH_UPDATE', 
          payload: { ...state.user, ...response.data.data }
        });
      }
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  if (!initialized) {
    return null; // Don't render anything until we've checked auth status
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};