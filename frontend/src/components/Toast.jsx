import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Toast = () => {
  const [toast, setToast] = useRecoilState(toastState);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: '', type: '' });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast, setToast]);

  if (!toast.message) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          icon: <XCircleIcon className="w-5 h-5" />
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          icon: <InformationCircleIcon className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gray-500',
          icon: <InformationCircleIcon className="w-5 h-5" />
        };
    }
  };

  const { bg, icon } = getToastStyles();

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className={`${bg} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2`}>
        {icon}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

export default Toast;
