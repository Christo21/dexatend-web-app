import React, { useState } from 'react';
import api from '../api';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@dexagroup\.com$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak sesuai (@dexagroup.com)');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, position } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('position', position);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userRes = await api.get('/employee/me');
      onLoginSuccess(userRes.data);

      if (position === 'HRD') {
        navigate('/admindashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email atau Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800!">Selamat Datang</h2>
          <p className="text-gray-500">Silakan masuk</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="pl-10 w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 outline-none"
                placeholder="nama@dexagroup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                required
                className="pl-10 w-full bg-gray-50 border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-700 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;