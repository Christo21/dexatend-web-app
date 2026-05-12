import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import Summary from './pages/Summary';
import ManageEmployee from './pages/ManageEmployee';
import AttendanceMonitor from './pages/AttendanceMonitor';
import { User, Calendar, List, LogOut, Shield, Users, LayoutDashboard } from 'lucide-react';
import api from './api';
import { useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('profile');
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  const MenuItem = ({ id, icon: Icon, label, active, onClick }) => (
    <li 
      className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-all duration-200 ${
        activeMenu === id ? 'bg-white/20 shadow-inner font-bold' : 'hover:bg-white/10'
      }`} 
      onClick={() => setActiveMenu(id)}
    >
      <Icon size={20} /> {label}
    </li>
  );

  const handleLogout = () => {
    setUser(null);
    localStorage.clear(); 
    sessionStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    window.location.replace('/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/employee/me')
        .then(res => setUser(res.data))
        .catch(() => {
           localStorage.removeItem('token');
           navigate('/login');
        })
        .finally(() => setIsChecking(false));
    } else {
      setIsChecking(false);
      if (window.location.pathname !== '/login') {
        navigate('/login');
      }
    }
  }, [navigate]);

  if (isChecking) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  if (!user && window.location.pathname === '/login') {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      <nav className="hidden md:flex w-72 bg-linear-to-b from-blue-700 to-indigo-800 text-white p-6 flex-col justify-between sticky top-0 h-screen shadow-2xl overflow-y-auto custom-scrollbar">
        <div>
          <div className="flex items-center gap-3 px-2">
            <h1 className="text-2xl font-black tracking-tight italic">DEXA-TEND</h1>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-200 mb-3 px-3 font-bold">Personal</p>
              <ul className="space-y-1">
                <MenuItem id="profile" label="Profil Saya" icon={User} />
                <MenuItem id="attendance" label="Absensi" icon={Calendar} />
                <MenuItem id="summary" label="Riwayat" icon={List} />
              </ul>
            </div>

            {user?.position === 'HRD' && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-orange-300 mb-3 px-3 font-bold">HR Management</p>
                <ul className="space-y-1">
                  <MenuItem id="manageemployee" label="Kelola Karyawan" icon={Users} />
                  <MenuItem id="attendancemonitor" label="Monitoring Absen" icon={LayoutDashboard} />
                </ul>
              </div>
            )}
          </div>
        </div>

        <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-200 hover:text-white hover:bg-red-500/20 rounded-xl transition-all mt-10">
          <LogOut size={20} /> Keluar
        </button>
      </nav>

      <header className="md:hidden bg-blue-700 text-white px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-black italic tracking-tighter">DEXA-TEND</h1>
        <button onClick={handleLogout} className="text-red-200"><LogOut size={20} /></button>
      </header>

      <main className="flex-1 p-4 md:p-10 pb-28 md:pb-10 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto">
          {activeMenu === 'profile' && <Profile user={user} />}
          {activeMenu === 'attendance' && <Attendance />}
          {activeMenu === 'summary' && <Summary />}
          
          {user?.position === 'HRD' && (
            <>
              {activeMenu === 'manageemployee' && <ManageEmployee />}
              {activeMenu === 'attendancemonitor' && <AttendanceMonitor />}
            </>
          )}
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-3 flex justify-around items-center z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.05)]">
        <div onClick={() => setActiveMenu('profile')} className={`flex flex-col items-center gap-1 flex-1 ${activeMenu === 'profile' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
          <User size={22}/> <span className="text-[10px] font-bold uppercase">Profil</span>
        </div>
        <div onClick={() => setActiveMenu('attendance')} className={`flex flex-col items-center gap-1 flex-1 ${activeMenu === 'attendance' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
          <Calendar size={22}/> <span className="text-[10px] font-bold uppercase">Absen</span>
        </div>
        <div onClick={() => setActiveMenu('summary')} className={`flex flex-col items-center gap-1 flex-1 ${activeMenu === 'summary' ? 'text-blue-600 scale-110' : 'text-gray-400'}`}>
          <List size={22}/> <span className="text-[10px] font-bold uppercase">Riwayat</span>
        </div>

        {user?.position === 'HRD' && (
          <>
            <div onClick={() => setActiveMenu('manageemployee')} className={`flex flex-col items-center gap-1 flex-1 ${activeMenu === 'manageemployee' ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
              <Users size={22}/> <span className="text-[10px] font-bold uppercase">Kelola</span>
            </div>
            <div onClick={() => setActiveMenu('attendancemonitor')} className={`flex flex-col items-center gap-1 flex-1 ${activeMenu === 'attendancemonitor' ? 'text-orange-500 scale-110' : 'text-gray-400'}`}>
              <LayoutDashboard size={22}/> <span className="text-[10px] font-bold uppercase">Monitor</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;