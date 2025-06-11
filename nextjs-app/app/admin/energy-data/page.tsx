'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface EnergyData {
  id: number;
  building_name: string;
  year: number;
  month: number;
  electricity: number;
  gas: number;
  water: number;
}

interface Building {
  id: number;
  name: string;
}

interface FormData {
  building_name: string;
  year: number;
  month: number;
  electricity: number;
  gas: number;
  water: number;
}

export default function EnergyData() {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: '',
    building: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingData, setEditingData] = useState<EnergyData | null>(null);
  const [formData, setFormData] = useState<FormData>({
    building_name: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    electricity: 0,
    gas: 0,
    water: 0
  });

  useEffect(() => {
    fetchEnergyData();
    fetchBuildings();
  }, [filters]);

  const fetchEnergyData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append('year', filters.year.toString());
      if (filters.month) params.append('month', filters.month);
      if (filters.building) params.append('building', filters.building);
      
      const response = await fetch(`/api/energy-data?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setEnergyData(data);
    } catch (error) {
      alert('데이터 조회 실패');
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await fetch('/api/buildings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      
      // 데이터가 배열인지 확인하고 설정
      if (Array.isArray(data)) {
        setBuildings(data);
      } else if (data.data && Array.isArray(data.data)) {
        setBuildings(data.data);
      } else {
        console.error('Buildings data is not an array:', data);
        setBuildings([]);
      }
    } catch (error) {
      console.error('건물 목록 조회 실패:', error);
      setBuildings([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingData ? `/api/energy-data/${editingData.id}` : '/api/energy-data';
      const method = editingData ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save');

      alert(editingData ? '데이터가 수정되었습니다' : '데이터가 추가되었습니다');
      setShowModal(false);
      setEditingData(null);
      setFormData({
        building_name: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        electricity: 0,
        gas: 0,
        water: 0
      });
      fetchEnergyData();
    } catch (error) {
      alert('저장 실패');
    }
  };

  const handleEdit = (data: EnergyData) => {
    setEditingData(data);
    setFormData({
      building_name: data.building_name,
      year: data.year,
      month: data.month,
      electricity: data.electricity,
      gas: data.gas,
      water: data.water
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/energy-data/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('삭제되었습니다');
      fetchEnergyData();
    } catch (error) {
      alert('삭제 실패');
    }
  };

  const handleExcelDownload = () => {
    const ws = XLSX.utils.json_to_sheet(energyData.map(item => ({
      '건물명': item.building_name,
      '연도': item.year,
      '월': item.month,
      '전기사용량(kWh)': item.electricity,
      '가스사용량(m³)': item.gas,
      '수도사용량(ton)': item.water
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '에너지데이터');
    XLSX.writeFile(wb, `energy_data_${filters.year || 'all'}.xlsx`);
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) return;
        
        const workbook = XLSX.read(data, { type: 'binary' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        for (const row of jsonData as any[]) {
          await fetch('/api/energy-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              building_name: row['건물명'],
              year: row['연도'],
              month: row['월'],
              electricity: row['전기사용량(kWh)'] || 0,
              gas: row['가스사용량(m³)'] || 0,
              water: row['수도사용량(ton)'] || 0
            })
          });
        }

        alert('엑셀 업로드 완료');
        fetchEnergyData();
      } catch (error) {
        alert('엑셀 업로드 실패');
      }
    };
    reader.readAsBinaryString(file);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <AdminLayout>
      <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">에너지 데이터 관리</h1>
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
                electricity: 0,
                gas: 0,
                water: 0
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
              onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) || new Date().getFullYear() })}
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
              {Array.isArray(buildings) && buildings.map(building => (
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">전기(kWh)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가스(m³)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수도(ton)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {energyData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.building_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.year}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.electricity?.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.gas?.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.water?.toLocaleString()}</td>
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
            ))}
          </tbody>
        </table>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingData ? '에너지 데이터 수정' : '에너지 데이터 추가'}
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
                    disabled={!!editingData}
                  >
                    <option value="">선택하세요</option>
                    {Array.isArray(buildings) && buildings.map(building => (
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
                      disabled={!!editingData}
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
                      disabled={!!editingData}
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}월</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">전기사용량 (kWh)</label>
                  <input
                    type="number"
                    value={formData.electricity}
                    onChange={(e) => setFormData({ ...formData, electricity: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">가스사용량 (m³)</label>
                  <input
                    type="number"
                    value={formData.gas}
                    onChange={(e) => setFormData({ ...formData, gas: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">수도사용량 (ton)</label>
                  <input
                    type="number"
                    value={formData.water}
                    onChange={(e) => setFormData({ ...formData, water: parseFloat(e.target.value) || 0 })}
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
    </AdminLayout>
  );
}