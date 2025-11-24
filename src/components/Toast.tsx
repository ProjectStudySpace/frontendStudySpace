import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const duration = toast.duration || 5000; // Default 5 seconds
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-200',
          iconColor: 'text-green-500 dark:text-green-400',
          icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          iconColor: 'text-red-500 dark:text-red-400',
          icon: AlertCircle
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          iconColor: 'text-yellow-500 dark:text-yellow-400',
          icon: AlertTriangle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          iconColor: 'text-blue-500 dark:text-blue-400',
          icon: Info
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div className={`
      flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
      ${styles.bgColor} ${styles.borderColor}
      animate-in slide-in-from-right-full duration-300
    `}>
      <Icon className={`w-5 h-5 mt-0.5 ${styles.iconColor} flex-shrink-0`} />
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium ${styles.textColor}`}>
          {toast.title}
        </h4>
        {toast.message && (
          <p className={`text-sm mt-1 ${styles.textColor} opacity-90`}>
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className={`
          flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5
          ${styles.iconColor} transition-colors
        `}
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ToastComponent;