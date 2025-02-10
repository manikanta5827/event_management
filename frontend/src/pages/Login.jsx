import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import api from '../api/api';
import { userState, toastState } from '../store/atoms';

const Login = () => {
    const [email, setEmail] = useState('Hari@example.com');
    const [password, setPassword] = useState('Hari123');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setUser = useSetRecoilState(userState);
    const setToast = useSetRecoilState(toastState);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                const token = Cookies.get('token');
                if (token) {
                    const decodedUser = jwtDecode(token);
                    setUser(decodedUser);
                    setToast({ message: 'Login successful!', type: 'success' });
                    navigate('/');
                }
            }
        } catch (error) {
            setToast({
                message: error.response?.data?.message || 'Login failed',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            const response = await api.post('/auth/guest-login');
            console.log(response)
            if (response.data.success) {
                console.log('ssdff');
                const token = Cookies.get('token');
                console.log(token, 'token')
                if (token) {
                    console.log('dd')
                    const decodedUser = jwtDecode(token);
                    setUser(decodedUser);
                    setToast({ message: 'Welcome, Guest!', type: 'success' });
                    navigate('/guest');
                }
                console.log('sfve')
            }
        } catch (error) {
            setToast({
                message: error.response?.data?.message || 'Guest login failed',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-pink-600 p-4">
            <div className="p-8 bg-white shadow-2xl rounded-2xl w-full max-w-md transition-all duration-300">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                            placeholder="john@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleGuestLogin}
                        className="w-full py-3 px-4 border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300"
                        disabled={loading}
                    >
                        Continue as Guest
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="text-purple-600 font-semibold hover:text-purple-700 focus:outline-none"
                    >
                        Sign up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login; 