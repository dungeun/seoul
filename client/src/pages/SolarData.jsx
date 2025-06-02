import { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function SolarData() {
  const [solarData, setSolarData] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: '',
    building: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [formData, setFormData] = useState({
    building_name: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    generation: 0,
    capacity: 0
  });

  useEffect(() => {
    fetchSolarData();
    fetchBuildings();
  }, [filters]);

  const fetchSolarData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.building) params.append('building', filters.building);
      
      const response = await axios.get(`/api/solar-data?${params}`);
      setSolarData(response.data);
    } catch (error) {
      toast.error('데이터 조회 실패');
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await axios.get('/api/buildings');
      setBuildings(response.data);
    } catch (error) {
      console.error('건물 목록 조회 실패:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingData) {
        await axios.put(`/api/solar-data/${editingData.id}`, formData);
        toast.success('데이터가 수정되었습니다');
      } else {
        await axios.post('/api/solar-data', formData);
        toast.success('데이터가 추가되었습니다');
      }
      setShowModal(false);
      setEditingData(null);
      setFormData({
        building_name: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        generation: 0,
        capacity: 0
      });
      fetchSolarData();
    } catch (error) {
      toast.error('저장 실패');
    }
  };

  const handleEdit = (data) => {
    setEditingData(data);
    setFormData({
      building_name: data.building_name,
      year: data.year,
      month: data.month,
      generation: data.generation,
      capacity: data.capacity
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await axios.delete(`/api/solar-data/${id}`);
      toast.success('삭제되었습니다');
      fetchSolarData();
    } catch (error) {
      toast.error('삭제 실패');
    }
  };

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(solarData.map(item => ({
      '건물명': item.building_name,
      '연도': item.year,
      '월': item.month,
      '발전량(kWh)': item.generation,
      '설비용량(kW)': item.capacity,
      '이용률(%)': item.capacity > 0 ? ((item.generation / (item.capacity * 24 * 30)) * 100).toFixed(2) : 0
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '태양광데이터');
    XLSX.writeFile(wb, `solar_data_${filters.year || 'all'}.xlsx`);
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData) {
          await axios.post('/api/solar-data', {
            building_name: row['건물명'],
            year: row['연도'],
            month: row['월'],
            generation: row['발전량(kWh)'] || 0,
            capacity: row['설비용량(kW)'] || 0
          });
        }

        toast.success('엑셀 업로드 완료');
        fetchSolarData();
      } catch (error) {
        toast.error('엑셀 업로드 실패');
      }
    };
    reader.readAsBinaryString(file);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">태양광 발전 관리</h1>
        <div className="flex gap-2">
          <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer flex items-center gap-2">
            <ArrowUpTrayIcon className="h-5 w-5" />
            엑셀 업로드
            <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="hidden" />
          </label>
          <button
            onClick={handleExcelDownload}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            엑셀 다운로드
          </button>
          <button
            onClick={() => {
              setEditingData(null);
              setFormData({
                building_name: '',
                year: new Date().getFullYear(),
                month: new Date().getMonth() + 1,
                generation: 0,
                capacity: 0
              });
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            데이터 추가
          </button>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">연도</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">전체</option>
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">월</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">전체</option>
              {months.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">건물</label>
            <select
              value={filters.building}
              onChange={(e) => setFilters({ ...filters, building: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">전체</option>
              {buildings.map(building => (
                <option key={building.id} value={building.name}>{building.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">건물명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연도</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발전량(kWh)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">설비용량(kW)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이용률(%)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {solarData.map((item) => {
              const utilizationRate = item.capacity > 0 
                ? ((item.generation / (item.capacity * 24 * 30)) * 100).toFixed(2)
                : 0;
              
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.building_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.generation?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{item.capacity?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${utilizationRate > 15 ? 'text-green-600' : 'text-orange-600'}`}>
                      {utilizationRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      <PencilIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingData ? '태양광 데이터 수정' : '태양광 데이터 추가'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">건물명</label>
                  <select
                    value={formData.building_name}
                    onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    disabled={editingData}
                  >
                    <option value="">선택하세요</option>
                    {buildings.map(building => (
                      <option key={building.id} value={building.name}>{building.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">연도</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={editingData}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}년</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">월</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                      required
                      disabled={editingData}
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}월</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">발전량 (kWh)</label>
                  <input
                    type="number"
                    value={formData.generation}
                    onChange={(e) => setFormData({ ...formData, generation: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">설비용량 (kW)</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}