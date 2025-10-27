
import React from 'react';
import ReactDOM from 'react-dom';

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  message: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const bgColor = {
    [ToastType.SUCCESS]: 'bg-green-500',
    [ToastType.ERROR]: 'bg-red-500',
    [ToastType.INFO]: 'bg-blue-500',
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(message.id), 300); // Allow fade-out animation
    }, 5000);

    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  return (
    <div
      className={`relative p-4 rounded-lg shadow-lg text-white mb-3 max-w-sm w-full transition-all duration-300 ease-out transform
        ${bgColor[message.type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <p className="text-sm font-semibold">{message.message}</p>
      <button
        onClick={() => onDismiss(message.id)}
        className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
        aria-label="Dismiss toast"
      >
        &times;
      </button>
    </div>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback((message: string, type: ToastType = ToastType.INFO) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {ReactDOM.createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
          {toasts.map((toast) => (
            <Toast key={toast.id} message={toast} onDismiss={dismissToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
