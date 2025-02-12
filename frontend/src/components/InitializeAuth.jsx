import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { userState, loadingState } from '../store/atoms';

const InitializeAuth = () => {
  const setUser = useSetRecoilState(userState);
  const setLoading = useSetRecoilState(loadingState);
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUser(payload);
        const currentPath = window.location.pathname;
        if (payload.role === 'guest' && currentPath !== '/guest') {
          navigate('/guest');
        } else if (payload.role === 'user' && currentPath !== '/') {
          navigate('/');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        Cookies.remove('token');
      }
    }
    setLoading(false);
  }, [navigate, setUser, setLoading]);

  return null;
};

export default InitializeAuth; 