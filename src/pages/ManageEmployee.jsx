import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Save, UserPlus, Phone, Mail, Briefcase, Search, Trash2 } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';
import { db } from '../services/firebase';
import { onValue, ref, onChildAdded, update } from 'firebase/database';

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    phoneNumber: ''
  });

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employee');
      setEmployees(res.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };
  
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => { 
      const notificationsRef = ref(db, 'notification');
      const unsubscribe = onChildAdded(notificationsRef, (snapshot) => {
        const data = snapshot.val();
        const notificationKey = snapshot.key;
  
        if (data && data.isRead === false) {
          Swal.fire({
            title: 'Update Profile',
            text: data.message,
            icon: 'info',
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
          }).then((result) => {
            const updates = {};
            updates[`/notification/${notificationKey}/isRead`] = true;
            update(ref(db), updates)
          });
        } 
      });
      
      fetchEmployees();
      return () => unsubscribe();
    }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (employee = null) => {
    if (employee) {
      setIsEditing(true);
      setCurrentId(employee.id);
      setFormData({
        name: employee.name,
        email: employee.email,
        position: employee.position,
        phoneNumber: employee.phoneNumber
      });
    } else {
      setIsEditing(false);
      setFormData({ name: '', email: '', position: '', phoneNumber: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await api.patch(`/employee/update-employee/${currentId}`, formData);
        Swal.fire({
          title: 'Berhasil!',
          text: `Data karyawan diperbarui!`,
          icon: 'success',
          confirmButtonText: 'Oke',
          confirmButtonColor: '#1d4ed8',
          timer: 1500,
          timerProgressBar: true,
        });
      } else {
        const payload = { 
          ...formData, 
          password: 'dexa123'
        };
        await api.post('/employee/register', payload);
        Swal.fire({
          title: 'Berhasil!',
          text: `Karyawan baru terdaftar!`,
          icon: 'success',
          confirmButtonText: 'Oke',
          confirmButtonColor: '#1d4ed8',
          timer: 1500,
          timerProgressBar: true,
        });
      }
      
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    Swal.fire({
      title: 'Hapus Karyawan?',
      text: `Anda akan menghapus ${name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/employee/${id}`);
          
          Swal.fire({
            title: 'Terhapus!',
            text: 'Data karyawan telah dihapus.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          
          fetchEmployees();
        } catch (err) {
          Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus data', 'error');
        }
      }
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="w-full flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Cari nama, email, atau posisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap"
        >
          <UserPlus size={18} /> Tambah Karyawan
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-180px)] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm text-center">
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-100">
                <th className="p-5 font-bold">Nama & Email</th>
                <th className="p-5 font-bold">Posisi</th>
                <th className="p-5 font-bold">Nomor HP</th>
                <th className="p-5 font-bold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5">
                      <div className="font-bold text-gray-800">{emp.name}</div>
                      <div className="text-xs text-gray-400 font-medium">{emp.email}</div>
                    </td>
                    <td className="p-5 text-center justify-center">
                      <div className="flex justify-center items-center h-full">
                        <span className={`px-3 py-1.5 text-[12px] font-medium tracking-tight leading-none ${
                          emp.position === 'HRD' ? 'text-orange-600' : 'text-blue-600'
                        }`}>
                        {emp.position}
                      </span>
                      </div>
                      
                    </td>
                    <td className="p-5 text-gray-600 text-sm font-medium">{emp.phoneNumber}</td>
                    <td className="p-5 flex justify-center">
                      <button 
                        onClick={() => openModal(emp)}
                        className="text-blue-600 hover:bg-white p-2 rounded-lg transition-all border border-transparent hover:border-blue-100 hover:shadow-sm"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id, emp.name)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all border border-transparent hover:border-red-100"
                        title="Hapus Karyawan"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400 italic text-sm">
                    Karyawan tidak ditemukan...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-999 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {isEditing ? 'Update Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nama Lengkap</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="user@dexagroup.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Posisi</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" name="position" value={formData.position} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nomor Handphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 text-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="08xxxxxx"
                  />
                </div>
              </div>

              {!isEditing && (
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-blue-600 font-medium">
                    * Karyawan baru akan menggunakan password default: <span className="font-bold">dexa123</span>
                  </p>
                </div>
              )}

              <button 
                type="submit" disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 disabled:opacity-50"
              >
                {loading ? 'Memproses...' : <><Save size={18} /> Simpan</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEmployee;