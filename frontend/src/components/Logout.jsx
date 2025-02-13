import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { userState, toastState } from '../store/atoms';

const Logout = () => {
  const setUser = useSetRecoilState(userState);
  const setToast = useSetRecoilState(toastState);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('token');
      setUser(null);
      setToast({ message: 'Logged out successfully', type: 'success' });
      navigate('/login');
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Logout failed',
        type: 'error'
      });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:text-red-800 font-medium"
    >
      Logout
    </button>
  );
};

export default Logout; 