import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { Toast as ToastType } from '../../types';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation to complete
    setTimeout(() => {
      onClose(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-primary-500" />;
      default:
        return <Info className="w-5 h-5 text-primary-500" />;
    }
  };

  const getClasses = () => {
    const baseClasses = 'flex items-center justify-between p-4 mb-3 rounded-lg shadow-md transform transition-all duration-300 ease-in-out';
    const typeClasses = {
      success: 'bg-success-50 border-l-4 border-success-500',
      error: 'bg-error-50 border-l-4 border-error-500',
      warning: 'bg-warning-50 border-l-4 border-warning-500',
      info: 'bg-primary-50 border-l-4 border-primary-500',
    };
    const visibilityClasses = isVisible
      ? 'translate-x-0 opacity-100'
      : 'translate-x-full opacity-0';

    return `${baseClasses} ${typeClasses[toast.type]} ${visibilityClasses}`;
  };

  return (
    <div className={getClasses()} role="alert">
      <div className="flex items-center">
        <div className="mr-3">{getIcon()}</div>
        <div className="text-sm font-medium">{toast.message}</div>
      </div>
      <button
        onClick={handleClose}
        className="ml-4 text-neutral-400 hover:text-neutral-600 focus:outline-none"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;