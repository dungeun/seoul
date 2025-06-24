'use client';

import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, LinkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface Board {
  id: number;
  name: string;
  slug: string;
  type: string;
}

interface BoardBanner {
  id: number;
  board_id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function BoardBannersPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [banners, setBanners] = useState<BoardBanner[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BoardBanner | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    board_id: 0,
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    order_index: 0
  });

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoardId) {
      fetchBanners(selectedBoardId);
    }
  }, [selectedBoardId]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      const data = await response.json();
      setBoards(data.filter((board: Board) => board.type === 'banner'));
      if (data.length > 0) {
        setSelectedBoardId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      toast.error('게시판을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const fetchBanners = async (boardId: number) => {
    try {
      const response = await fetch(`/api/board-banners?board_id=${boardId}`);
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('배너를 불러오는데 실패했습니다');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/board-banners';
      const method = editingBanner ? 'PUT' : 'POST';
      
      const body = editingBanner 
        ? { ...formData, id: editingBanner.id }
        : { ...formData, board_id: selectedBoardId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to save banner');

      toast.success(editingBanner ? '배너가 수정되었습니다' : '배너가 추가되었습니다');
      setShowForm(false);
      setEditingBanner(null);
      setFormData({ board_id: 0, title: '', subtitle: '', image_url: '', link_url: '', order_index: 0 });
      if (selectedBoardId) fetchBanners(selectedBoardId);
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  const handleEdit = (banner: BoardBanner) => {
    setEditingBanner(banner);
    setFormData({
      board_id: banner.board_id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      order_index: banner.order_index
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/board-banners?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete banner');

      toast.success('배너가 삭제되었습니다');
      if (selectedBoardId) fetchBanners(selectedBoardId);
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('삭제에 실패했습니다');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('파일 크기는 5MB 이하여야 합니다');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload image');

      const data = await response.json();
      setFormData(prev => ({ ...prev, image_url: data.url }));
      toast.success('이미지가 업로드되었습니다');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('이미지 업로드에 실패했습니다');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleActive = async (banner: BoardBanner) => {
    try {
      const response = await fetch('/api/board-banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          is_active: !banner.is_active
        }),
      });

      if (!response.ok) throw new Error('Failed to toggle banner');

      toast.success(banner.is_active ? '비활성화되었습니다' : '활성화되었습니다');
      if (selectedBoardId) fetchBanners(selectedBoardId);
    } catch (error) {
      console.error('Error toggling banner:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">게시판 배너 관리</h1>
        </div>

        {/* 게시판 선택 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            게시판 선택
          </label>
          <select
            value={selectedBoardId || ''}
            onChange={(e) => setSelectedBoardId(Number(e.target.value))}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
          >
            <option value="">게시판을 선택하세요</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>

        {selectedBoardId && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingBanner(null);
                  setFormData({ board_id: selectedBoardId, title: '', subtitle: '', image_url: '', link_url: '', order_index: 0 });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                새 배너 추가
              </button>
            </div>

            {/* 배너 폼 */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  {editingBanner ? '배너 수정' : '새 배너 추가'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        제목 *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        부제목
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      배너 이미지 *
                    </label>
                    <div className="space-y-2">
                      {/* Image preview */}
                      {formData.image_url && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={formData.image_url}
                            alt="배너 미리보기"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = '/img/placeholder.png';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Upload button */}
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                          {uploadingImage ? '업로드 중...' : '이미지 업로드'}
                        </button>
                        
                        {/* Direct URL input */}
                        <input
                          type="text"
                          value={formData.image_url}
                          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                          placeholder="또는 이미지 URL 직접 입력"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      링크 URL
                    </label>
                    <div className="flex items-center">
                      <LinkIcon className="w-5 h-5 text-gray-600 mr-2" />
                      <input
                        type="text"
                        value={formData.link_url}
                        onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                        placeholder="https://example.com"
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
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      {editingBanner ? '수정' : '추가'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingBanner(null);
                      }}
                      className="bg-gray-300 text-gray-900 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 배너 목록 */}
            {loading ? (
              <div className="text-center py-8 text-gray-900">로딩중...</div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {banners.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    등록된 배너가 없습니다
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {banners.map((banner) => (
                      <div key={banner.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="aspect-w-16 aspect-h-9 mb-3">
                          <img
                            src={banner.image_url}
                            alt={banner.title}
                            className="w-full h-32 object-cover rounded"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              if (!img.src.includes('placeholder.png')) {
                                img.src = '/img/placeholder.png';
                              }
                            }}
                          />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">순서: {banner.order_index}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(banner)}
                              className={`px-2 py-1 text-xs rounded-full ${
                                banner.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {banner.is_active ? '활성' : '비활성'}
                            </button>
                            <button
                              onClick={() => handleEdit(banner)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(banner.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}