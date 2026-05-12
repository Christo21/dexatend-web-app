import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Mail, Filter } from 'lucide-react';
import api from '../api';
import Swal from 'sweetalert2';

const AttendanceMonitor = () => {
  const [employees, setEmployees] = useState([]);
  const [rawAttendance, setRawAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filter, setFilter] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return {
      from: `${year}-${month}-01`,
      to: `${year}-${month}-${day}`
    };
  });

  const fetchData = async () => {
    try {
      const [empRes, attRes] = await Promise.all([
        api.get('/employee'),
        api.get('/attendance/all-summary', {
          params: {
            from: `${filter.from}T00:00:00.000`,
            to: `${filter.to}T23:59:59.999`
          }
        })
      ]);
      setEmployees(empRes.data);
      setRawAttendance(attRes.data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      Swal.fire('Error', 'Gagal memuat data monitoring', 'error');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    while (start <= end) {
      dates.push(new Date(start).toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }
    return dates.reverse();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${hour}:${minute}`;
  };

  const monitoringData = () => {
    const dateRange = getDatesInRange(filter.from, filter.to);
    const result = [];

    dateRange.forEach(date => {
      employees.forEach(emp => {
        const records = rawAttendance.filter(att => {
          const d = new Date(att.time);
          const attDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          return att.employee.id === emp.id && attDate === date;
        });

        let latestMasuk = null;
        let latestPulang = null;

        records.forEach(rec => {
          if (rec.status === 'MASUK') {
            if (!latestMasuk || new Date(rec.time) > new Date(latestMasuk)) latestMasuk = rec.time;
          }
          if (rec.status === 'PULANG') {
            if (!latestPulang || new Date(rec.time) > new Date(latestPulang)) latestPulang = rec.time;
          }
        });

        let keterangan = "Bolos";
        let colorClass = "text-red-600";

        if (latestMasuk && latestPulang) {
          keterangan = "Hadir";
          colorClass = "text-green-600";
        } else if (latestMasuk) {
          keterangan = "Tidak Absen Pulang";
          colorClass = "text-orange-600";
        } else if (latestPulang) {
          keterangan = "Tidak Absen Masuk";
          colorClass = "text-yellow-600";
        }

        const d = new Date(date);
        const year = d.getFullYear().toString().slice(-2);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        const tgl = `${day}/${month}/${year}`;

        result.push({
          date: tgl,
          id: emp.id,
          name: emp.name,
          email: emp.email,
          masuk: formatTime(latestMasuk),
          pulang: formatTime(latestPulang),
          keterangan,
          colorClass
        });
      });
    });

    return result.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const tableRows = monitoringData();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div className="flex-1 w-full space-y-4">
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" placeholder="Cari karyawan..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <input 
                type="date" value={filter.from}
                onChange={(e) => setFilter({...filter, from: e.target.value})}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="date" value={filter.to}
                onChange={(e) => setFilter({...filter, to: e.target.value})}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={fetchData} className="w-full bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition">
                <Filter size={18} className='m-auto' />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-180px)] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-50 z-10 text-center">
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-100">
                <th className="p-5 font-bold">Tanggal</th>
                <th className="p-5 font-bold">Karyawan</th>
                <th className="p-5 font-bold text-center">Masuk</th>
                <th className="p-5 font-bold text-center">Pulang</th>
                <th className="p-5 font-bold text-center">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableRows.length > 0 ? (
                tableRows.map((row, index) => (
                  <tr key={`${row.date}-${row.id}`} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5 text-xs font-bold text-gray-500">{row.date}</td>
                    <td className="p-5">
                      <div className="font-bold text-sm text-gray-800">{row.name}</div>
                      <div className="text-xs text-gray-400 font-medium">{row.email}</div>
                    </td>
                    <td className="p-5 text-center font-mono text-sm text-gray-600">{row.masuk || "-"}</td>
                    <td className="p-5 text-center font-mono text-sm text-gray-600">{row.pulang || "-"}</td>
                    <td className="p-5 text-center justify-center">
                      <div className="flex justify-center items-center h-full">
                        <span className={`px-3 py-1.5 text-[12px] font-medium tracking-tight leading-none ${row.colorClass}`}>
                          {row.keterangan}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-400 italic text-sm">Tidak ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceMonitor;