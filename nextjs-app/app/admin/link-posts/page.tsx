'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

interface LinkPost {
  id: number;
  title: string;
  content: string;
  link_url: string;
  image_url?: string;
  main_category: string;
  sub_category: string;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

interface Category {
  main: string;
  subs: string[];
}

const categories: Category[] = [
  {
    main: '기타, 환경, 과정 등',
    subs: ['환경 정책', '연구 과정', '기타 분야']
  },
  {
    main: '탄소 포집, 저장 활용 및 처리',
    subs: ['탄소 포집 기술', '탄소 저장 기술', '탄소 활용 기술']
  },
  {
    main: '무탄소 전력 공급',
    subs: ['태양광 발전', '풍력 발전', '수력 발전', '원자력 발전']
  },
  {
    main: '청정 열 및 전기화',
    subs: ['열펌프 기술', '전기화 시설', '청정 난방']
  },
  {
    main: '바이오매스 모빌 건설시스템',
    subs: ['바이오매스 기술', '친환경 건설', '모빌리티']
  },
  {
    main: '화학적 에너지 기술 관리',
    subs: ['수소 에너지', '화학 저장', '에너지 변환']
  }
];

const LinkPostsPage = () => {
  const [posts, setPosts] = useState<LinkPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    link_url: '',
    image_url: '',
    main_category: '',
    sub_category: '',
    status: 'published' as 'published' | 'draft'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/link-posts', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPost ? `/api/link-posts/${editingPost.id}` : '/api/link-posts';
      const method = editingPost ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingPost(null);
        resetForm();
        fetchPosts();
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      setError('게시글 저장에 실패했습니다.');
    }
  };

  const handleEdit = (post: LinkPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      link_url: post.link_url,
      image_url: post.image_url || '',
      main_category: post.main_category,
      sub_category: post.sub_category,
      status: post.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/link-posts/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          fetchPosts();
        } else {
          throw new Error('Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        setError('게시글 삭제에 실패했습니다.');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploadingImage(true);
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          image_url: data.filepath || data.file_path
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(`이미지 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      link_url: '',
      image_url: '',
      main_category: '',
      sub_category: '',
      status: 'published'
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    resetForm();
  };

  const getSubCategories = (mainCategory: string) => {
    const category = categories.find(cat => cat.main === mainCategory);
    return category ? category.subs : [];
  };

  const filteredPosts = filterCategory 
    ? posts.filter(post => post.main_category === filterCategory)
    : posts;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩중...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">링크 게시판 관리</h1>
            <button 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setShowForm(true)}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              새 링크 게시글 작성
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 카테고리 필터 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">카테고리별 필터</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">전체 카테고리</option>
              {categories.map((category) => (
                <option key={category.main} value={category.main}>
                  {category.main}
                </option>
              ))}
            </select>
          </div>

          {/* 게시글 목록 */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대분류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    중분류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작성일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt=""
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          {post.link_url && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              <a href={post.link_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                {post.link_url.length > 30 ? post.link_url.substring(0, 30) + '...' : post.link_url}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.main_category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.sub_category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status === 'published' ? '게시됨' : '임시저장'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">등록된 링크 게시글이 없습니다</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowForm(true)}
                >
                  첫 번째 링크 게시글 작성
                </button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      {/* 게시글 작성/편집 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingPost ? '링크 게시글 편집' : '새 링크 게시글 작성'}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={handleCancel}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">링크 URL</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">대분류</label>
                  <select
                    value={formData.main_category}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      main_category: e.target.value,
                      sub_category: '' // 대분류 변경시 중분류 초기화
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">대분류 선택</option>
                    {categories.map((category) => (
                      <option key={category.main} value={category.main}>
                        {category.main}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">중분류</label>
                  <select
                    value={formData.sub_category}
                    onChange={(e) => setFormData(prev => ({ ...prev, sub_category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={!formData.main_category}
                  >
                    <option value="">중분류 선택</option>
                    {getSubCategories(formData.main_category).map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {uploadingImage && <p className="text-sm text-gray-500 mt-1">업로드 중...</p>}
                {formData.image_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                      className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="published">게시</option>
                  <option value="draft">임시저장</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  onClick={handleCancel}
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPost ? '수정' : '작성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LinkPostsPage;