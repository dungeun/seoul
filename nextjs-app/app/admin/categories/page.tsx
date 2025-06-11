'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Category {
  id: number;
  name: string;
  type?: string;
  sort_order?: number;
}

interface FormData {
  name: string;
  type: string;
  sort_order: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'post',
    sort_order: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('카테고리를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({ name: '', type: 'post', sort_order: 0 });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      type: category.type || 'post',
      sort_order: category.sort_order || 0
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', type: 'post', sort_order: 0 });
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('카테고리 이름은 필수입니다');
      return;
    }

    try {
      const url = editingId ? `/api/categories/${editingId}` : '/api/categories';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingId ? '카테고리가 수정되었습니다' : '카테고리가 생성되었습니다');
        handleCancel();
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || '카테고리 저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('카테고리 저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 카테고리를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('카테고리가 삭제되었습니다');
        fetchCategories();
      } else {
        const error = await response.json();
        alert(error.error || '카테고리 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('카테고리 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">카테고리 관리</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          새 카테고리
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                타입
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                정렬 순서
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add new category row */}
            {isAdding && (
              <tr className="bg-blue-50">
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="카테고리 이름"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </td>
                <td className="px-6 py-4">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="post">게시글</option>
                    <option value="file">파일</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="정렬 순서"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-900"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-600 hover:text-red-900"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {/* Existing categories */}
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center">
                      <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="post">게시글</option>
                      <option value="file">파일</option>
                    </select>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {category.type === 'file' ? '파일' : '게시글'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{category.sort_order || 0}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === category.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <TagIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">카테고리가 없습니다</p>
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}