import React, { useState, useEffect } from 'react';
import api from '../api';

const Summary = () => {
  const processHistory = (rawHistory) => {
    const grouped = rawHistory.reduce((acc, item) => {
      const d = new Date(item.time);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
      if (!acc[date]) {
        acc[date] = { masuk: null, pulang: null };
      }

      if (item.status === 'MASUK') {
        if (!acc[date].masuk || new Date(item.time) > new Date(acc[date].masuk)) {
          acc[date].masuk = item.time;
        }
      }

      if (item.status === 'PULANG') {
        if (!acc[date].pulang || new Date(item.time) > new Date(acc[date].pulang)) {
          acc[date].pulang = item.time;
        }
      }

      return acc;
    }, {});

    return Object.keys(grouped).map(date => ({
      tanggal: date,
      masuk: grouped[date].masuk,
      pulang: grouped[date].pulang
    })).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  };
  
  const [history, setHistory] = useState([]);
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

  const fetchSummary = async () => {
    try {
        const res = await api.get('/attendance/summary', { 
          params: {
            from: `${filter.from}T00:00:00.000`, 
            to: `${filter.to}T23:59:59.999`
          }
        });
        const latestData = processHistory(res.data);
        setHistory(latestData);
    } catch (err) {
      console.error("Gagal mengambil data", err);
      Swal.fire({
        title: 'Gagal!',
        text: `Gagal mengambil data`,
        icon: 'error',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#3b82f6'
      });
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    
    const utcDateStr = dateStr.endsWith('Z') ? dateStr : `${dateStr.replace(' ', 'T')}Z`;
    const d = new Date(utcDateStr);
    if (isNaN(d.getTime())) return "-";

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}`;
  };

  useEffect(() => { fetchSummary(); }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Dari</label>
            <input 
              type="date" 
              className="w-full mt-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              value={filter.from} 
              onChange={(e) => setFilter({...filter, from: e.target.value})}
              onClick={(e) => e.target.showPicker()} 
            />
          </div>

          <div className="w-full md:flex-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Sampai</label>
            <input 
              type="date" 
              className="w-full mt-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
              value={filter.to} 
              onChange={(e) => setFilter({...filter, to: e.target.value})}
              onClick={(e) => e.target.showPicker()} 
            />
          </div>
        </div>

        <button 
          onClick={fetchSummary} 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
        >
          Cari
        </button>
      </div>

      <div className="overflow-x-auto overflow-y-auto rounded-xl border border-gray-100 max-h-[calc(100vh-400px)] md:max-h-[calc(100vh-180px)]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm text-center">
            <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
              <th className="p-4 font-semibold">Masuk</th>
              <th className="p-4 font-semibold">Pulang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition">
                <td className="p-4 text-gray-700 font-mono text-sm">
                  {item.masuk ? formatDateTime(item.masuk) : "-"}
                </td>
                <td className="p-4 text-gray-600 font-mono text-sm">
                  {item.pulang ? formatDateTime(item.pulang) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Summary;