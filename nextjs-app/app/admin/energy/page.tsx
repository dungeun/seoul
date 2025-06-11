'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { EnergyData, Building } from '@/types';
import { formatNumber, generateYears, generateMonths } from '@/lib/utils';
import { apiClient } from '@/lib/api';

interface EnergyFormData {
  building_name: string;
  year: number;
  month: number;
  electricity: number;
  gas: number;
  water: number;
}

export default function AdminEnergyPage() {
  const [energyData, setEnergyData] = useState<EnergyData[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EnergyData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof EnergyData>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState<EnergyFormData>({
    building_name: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    electricity: 0,
    gas: 0,
    water: 0,
  });

  // 데이터 로드
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [energyResponse, buildingsResponse] = await Promise.all([
        apiClient.get('/api/energy'),
        apiClient.get('/api/buildings'),
      ]);

      setEnergyData(energyResponse.data.data as EnergyData[]);
      setBuildings(buildingsResponse.data.data as Building[]);
    } catch (error) {
      console.error('데이터 로딩 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 정렬된 데이터
  const sortedData = [...energyData]
    .filter(item => 
      item.building_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.year.toString().includes(searchTerm) ||
      item.month.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        // 수정
        await apiClient.put(`/api/energy/${editingItem.id}`, formData);
      } else {
        // 생성
        await apiClient.post('/api/energy', formData);
      }
      
      await loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  // 삭제
  const handleDelete = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;
    
    try {
      await apiClient.delete(`/api/energy/${id}`);
      await loadData();
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 편집 시작
  const handleEdit = (item: EnergyData) => {
    setEditingItem(item);
    setFormData({
      building_name: item.building_name,
      year: item.year,
      month: item.month,
      electricity: item.electricity,
      gas: item.gas,
      water: item.water,
    });
    setIsModalOpen(true);
  };

  // 폼 리셋
  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      building_name: '',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      electricity: 0,
      gas: 0,
      water: 0,
    });
  };

  // 정렬 처리
  const handleSort = (column: keyof EnergyData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">에너지 데이터를 불러오는 중...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">에너지 데이터 관리</h1>
            <p className="text-gray-600">전기, 가스, 수도 사용량 데이터를 관리합니다.</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>새 데이터 추가</span>
          </button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="건물명, 연도, 월로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              총 {sortedData.length}개 데이터
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('building_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>건물명</span>
                      <ArrowsUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('year')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>연도</span>
                      <ArrowsUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('month')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>월</span>
                      <ArrowsUpDownIcon className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전기 (kWh)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가스 (m³)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수도 (t)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.building_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.month}월
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.electricity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.gas)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatNumber(item.water)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 모달 */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingItem ? '에너지 데이터 수정' : '새 에너지 데이터 추가'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">건물</label>
                    <select
                      value={formData.building_name}
                      onChange={(e) => setFormData({ ...formData, building_name: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">건물 선택</option>
                      {buildings.map((building) => (
                        <option key={building.id} value={building.name}>
                          {building.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">연도</label>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateYears().map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">월</label>
                      <select
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generateMonths().map((month) => (
                          <option key={month} value={month}>{month}월</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">전기 사용량 (kWh)</label>
                    <input
                      type="number"
                      value={formData.electricity}
                      onChange={(e) => setFormData({ ...formData, electricity: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">가스 사용량 (m³)</label>
                    <input
                      type="number"
                      value={formData.gas}
                      onChange={(e) => setFormData({ ...formData, gas: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">수도 사용량 (t)</label>
                    <input
                      type="number"
                      value={formData.water}
                      onChange={(e) => setFormData({ ...formData, water: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                    >
                      {editingItem ? '수정' : '추가'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 