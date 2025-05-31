import React, { createContext, useState, useCallback, useEffect } from 'react';
import { Toast } from '../types';
import { nanoid } from 'nanoid';

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type, duration = 5000 }: Omit<Toast, 'id'>) => {
      const id = nanoid();
      setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
    },
    []
  );

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timeout = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
        
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};