import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Toast = () => {
  const [toast, setToast] = useRecoilState(toastState);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: '', type: '' });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast.message) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-500',
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          icon: <XCircleIcon className="w-5 h-5" />
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-500',
          icon: <InformationCircleIcon className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-500',
          icon: <InformationCircleIcon className="w-5 h-5" />
        };
    }
  };

  const { bg, textColor, iconColor, icon } = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className={`${bg} ${textColor} px-4 py-3 rounded-lg shadow-lg border flex items-center space-x-3 min-w-[300px]`}>
        <div className={iconColor}>{icon}</div>
        <span className="flex-1 text-sm font-medium">{toast.message}</span>
        <button
          onClick={() => setToast({ message: '', type: '' })}
          className={`${iconColor} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
