import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

const Attendance = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleAbsen = async (status) => {
    try {
        await api.post('/attendance', { status }); 
        Swal.fire({
          title: 'Berhasil!',
          text: `Absen ${status.toLowerCase()} berhasil`,
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        });
    } catch (err) {
        console.error(err);
        Swal.fire({
          title: 'Gagal!',
          text: `Absen ${status.toLowerCase()} gagal`,
          icon: 'error',
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#3b82f6'
        });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\./g, ':');
    } catch (e) {
      return "00:00:00";
    }
  };

  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800!">Absensi</h2>
      
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl mb-8 text-center">
        
        <h1 className="text-5xl font-black tracking-widest mb-2 font-mono">
          {formatTime(currentTime)}
        </h1>
        
        <div className="flex items-center justify-center gap-2 text-blue-100 font-medium">
          <Calendar size={18} />
          <p className="text-lg">{formatDate(currentTime)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
        <button 
          disabled={loading}
          onClick={() => handleAbsen('MASUK')}
          className="h-32 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all transform active:scale-95"
        >
          <span className="text-3xl mb-1">☀️</span>
          <span className="font-bold text-xl uppercase">Masuk</span>
        </button>

        <button 
          disabled={loading}
          onClick={() => handleAbsen('PULANG')}
          className="h-32 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl shadow-lg flex flex-col items-center justify-center transition-all transform active:scale-95"
        >
          <span className="text-3xl mb-1">🏠</span>
          <span className="font-bold text-xl uppercase">Pulang</span>
        </button>
      </div>

      {loading && <p className="text-blue-600 animate-pulse font-medium">Sedang memproses...</p>}
    </div>
  );
};

export default Attendance;