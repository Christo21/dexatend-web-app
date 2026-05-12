import React, { useState, useEffect } from 'react';
import api from '../api';
import { Camera, Phone, Lock, User, Mail, Briefcase, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    position: '',
    phoneNumber: '',
    photo: '',
    password: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const res = await api.get('/employee/me');
            setProfile({
            ...res.data,
            password: ''
            });
        } catch (err) {
            console.error("Gagal mengambil data profil", err);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        }
    };
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const payload = {
            phoneNumber: profile.phoneNumber,
            photo: profile.photo,
        };
        if (profile.password) {
            payload.password = profile.password;
        }
      await api.patch('/employee/update-profile', payload);

      Swal.fire({
        title: 'Berhasil!',
        text: `Profil berhasil diperbarui!`,
        icon: 'success',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#1d4ed8',
        timer: 1500,
        timerProgressBar: true,
      });
      setProfile({ ...profile, password: '' });
    } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal memperbarui profil',
          text: err.response?.data?.message,
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#3b82f6'
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 h-40 relative">
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative">
              {profile.photo ? (
                <img 
                  src={profile.photo} 
                  alt={profile.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center text-gray-400">
                  <User size={64} strokeWidth={1.5} />
                </div>
              )}
              <label className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-50 transition-colors">
                <Camera size={18} className="text-blue-600" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
          </div>
        </div>

        <div className="pt-20 pb-10 px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800!">{profile.name || 'Nama Karyawan'}</h1>
          
          <div className="flex flex-wrap justify-center gap-4 mt-3 text-gray-500">
            <div className="flex items-center gap-1">
              <Briefcase size={16} />
              <span>{profile.position || 'Posisi'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail size={16} />
              <span>{profile.email || 'email@dexagroup.com'}</span>
            </div>
          </div>

          <hr className="my-8 border-gray-100" />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="md:col-span-1">
              <label className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2">
                <Phone size={16} className="text-blue-500" /> Nomor Handphone
              </label>
              <input 
                type="text"
                name="phoneNumber"
                value={profile.phoneNumber}
                onChange={handleChange}
                placeholder="08xxxxxx"
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 outline-none transition"
              />
            </div>

            <div className="md:col-span-1">
              <label className="text-sm font-bold text-gray-600 flex items-center gap-2 mb-2">
                <Lock size={16} className="text-blue-500" /> Password Baru
              </label>
              <input 
                type="password"
                name="password"
                value={profile.password}
                onChange={handleChange}
                placeholder="Isi untuk ubah password"
                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-700 outline-none transition"
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? "Memproses..." : <><Save size={20} /> Simpan Perubahan</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;