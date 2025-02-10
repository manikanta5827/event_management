import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { toastState } from '../store/atoms';

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

  const bgColor = toast.type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;

// Add this to your global CSS or tailwind config
// @keyframes fadeInDown {
//   from {
//     opacity: 0;
//     transform: translateY(-20px);
//   }
//   to {
//     opacity: 1;
//     transform: translateY(0);
//   }
// } 