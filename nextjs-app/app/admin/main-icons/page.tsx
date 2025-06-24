'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, LinkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface MainIcon {
  id: number;
  title: string;
  url: string;
  icon_image: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function MainIconsPage() {
  const [icons, setIcons] = useState<MainIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIcon, setEditingIcon] = useState<MainIcon | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon_image: '',
    order_index: 0
  });

  useEffect(() => {
    fetchIcons();
  }, []);

  const fetchIcons = async () => {
    try {
      const response = await fetch('/api/main-icons');
      const data = await response.json();
      setIcons(data);
    } catch (error) {
      console.error('Error fetching icons:', error);
      toast.error('아이콘을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingIcon ? '/api/main-icons' : '/api/main-icons';
      const method = editingIcon ? 'PUT' : 'POST';
      
      const body = editingIcon 
        ? { ...formData, id: editingIcon.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save icon');

      toast.success(editingIcon ? '아이콘이 수정되었습니다' : '아이콘이 추가되었습니다');
      setShowForm(false);
      setEditingIcon(null);
      setFormData({ title: '', url: '', icon_image: '', order_index: 0 });
      fetchIcons();
    } catch (error) {
      console.error('Error saving icon:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  const handleEdit = (icon: MainIcon) => {
    setEditingIcon(icon);
    setFormData({
      title: icon.title,
      url: icon.url,
      icon_image: icon.icon_image,
      order_index: icon.order_index
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/main-icons?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete icon');

      toast.success('아이콘이 삭제되었습니다');
      fetchIcons();
    } catch (error) {
      console.error('Error deleting icon:', error);
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleToggleActive = async (icon: MainIcon) => {
    try {
      const response = await fetch('/api/main-icons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: icon.id,
          is_active: !icon.is_active
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle icon');

      toast.success(icon.is_active ? '비활성화되었습니다' : '활성화되었습니다');
      fetchIcons();
    } catch (error) {
      console.error('Error toggling icon:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">메인 페이지 아이콘 관리</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingIcon(null);
              setFormData({ title: '', url: '', icon_image: '', order_index: 0 });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            새 아이콘 추가
          </button>
        </div>

        {/* 아이콘 폼 */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {editingIcon ? '아이콘 수정' : '새 아이콘 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  URL *
                </label>
                <div className="flex items-center">
                  <LinkIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="/greenhouse-gas"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  아이콘 이미지 URL *
                </label>
                <div className="flex items-center">
                  <PhotoIcon className="w-5 h-5 text-gray-600 mr-2" />
                  <input
                    type="text"
                    value={formData.icon_image}
                    onChange={(e) => setFormData({ ...formData, icon_image: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                    placeholder="/img/icons/greenhouse-gas.png"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  순서
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {editingIcon ? '수정' : '추가'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingIcon(null);
                  }}
                  className="bg-gray-300 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 아이콘 목록 */}
        {loading ? (
          <div className="text-center py-8 text-gray-900">로딩중...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    순서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    아이콘
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {icons.map((icon) => (
                  <tr key={icon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {icon.order_index}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={icon.icon_image}
                        alt={icon.title}
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          // 이미 placeholder를 로드하려고 시도했다면 더 이상 시도하지 않음
                          if (img.src.includes('placeholder.png')) {
                            img.style.display = 'none';
                          } else {
                            img.src = '/img/placeholder.png';
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {icon.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {icon.url}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(icon)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          icon.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {icon.is_active ? '활성' : '비활성'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(icon)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(icon.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}