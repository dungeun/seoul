'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface CarbonTechPost {
  id: number;
  name: string;
  department: string;
  url: string;
  screenshot_url?: string;
  main_category: string;
  sub_category: string;
  order_index: number;
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
    main: '탄소중립 기술개발',
    subs: [
      '수소 분야 (생산, 운반, 저장 등)',
      '탄소 포집, 전환 활용 및 저장 분야 (CCUS 및 DAC 등)',
      '무탄소 전력공급 (태양광, 풍력, 지열, 원자력, ESS, 에너지 하베스팅 등)',
      '저탄소 열공급 및 전기화 (히트펌프, 전기화, 에너지저장, 고효율 에너지 기술 등)',
      '바이오매스 및 친환경 연료 (바이오연료, SAF, E-fuel, 암모니아, 폐기물 재활용 등)',
      '스마트 에너지 시스템 (에너지 거래, V2G, 스마트그리드, 에너지 관리기술 등)',
      '친환경 모빌리티 기술 (배터리, 친환경 자동차, 철도 전기화, 친환경 선박, UAM 등)',
      '친환경 건설시스템 (친환경 건축물, 탈탄소 시멘트/철강/화학/조선 등)'
    ]
  },
  {
    main: '탄소중립 정책연구',
    subs: [
      '탄소중립 정책 및 제도',
      '국제협력 및 탄소시장',
      '산업별 전환전략',
      '기후변화 영향평가',
      '탄소중립 경제성 분석'
    ]
  },
  {
    main: '기후과학 연구',
    subs: [
      '기후변화 과학',
      '탄소순환 연구',
      '기후모델링',
      '극한기후 연구',
      '해양기후 연구'
    ]
  },
  {
    main: '기타대분류',
    subs: [
      '융합연구',
      '교육프로그램',
      '국제협력사업',
      '기타연구'
    ]
  }
];

const CarbonTechAdminPage = () => {
  const [posts, setPosts] = useState<CarbonTechPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<CarbonTechPost | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    url: '',
    screenshot_url: '',
    main_category: '',
    sub_category: '',
    order_index: 0,
    status: 'published' as 'published' | 'draft'
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [autoScreenshot, setAutoScreenshot] = useState(true);
  const [csvMode, setCsvMode] = useState<'bulk' | 'single'>('bulk');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/carbon-tech', {
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
      const url = editingPost ? `/api/carbon-tech/${editingPost.id}` : '/api/carbon-tech';
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

  const handleEdit = (post: CarbonTechPost) => {
    setEditingPost(post);
    setFormData({
      name: post.name,
      department: post.department,
      url: post.url,
      screenshot_url: post.screenshot_url || '',
      main_category: post.main_category,
      sub_category: post.sub_category,
      order_index: post.order_index,
      status: post.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 연구자를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/carbon-tech/${id}`, {
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
          screenshot_url: data.filepath || data.file_path
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
      name: '',
      department: '',
      url: '',
      screenshot_url: '',
      main_category: '',
      sub_category: '',
      order_index: 0,
      status: 'published'
    });
  };

  // 개별 데이터 업로드 처리
  const handleSingleUpload = async () => {
    const mainCategory = (document.getElementById('csv-main-category') as HTMLInputElement)?.value;
    const subCategory = (document.getElementById('csv-sub-category') as HTMLInputElement)?.value;
    const professor = (document.getElementById('csv-professor') as HTMLInputElement)?.value;
    const department = (document.getElementById('csv-department') as HTMLInputElement)?.value;
    const url = (document.getElementById('csv-url') as HTMLInputElement)?.value;
    const order = (document.getElementById('csv-order') as HTMLInputElement)?.value;

    if (!mainCategory || !subCategory || !professor || !department || !url) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    setCsvUploading(true);
    try {
      const response = await fetch('/api/carbon-tech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: professor,
          department: department,
          url: url,
          main_category: mainCategory,
          sub_category: subCategory,
          status: 'published',
          order_index: parseInt(order) || 0
        })
      });

      if (response.ok) {
        alert('데이터가 추가되었습니다.');
        // 입력 필드 초기화
        (document.getElementById('csv-main-category') as HTMLInputElement).value = '';
        (document.getElementById('csv-sub-category') as HTMLInputElement).value = '';
        (document.getElementById('csv-professor') as HTMLInputElement).value = '';
        (document.getElementById('csv-department') as HTMLInputElement).value = '';
        (document.getElementById('csv-url') as HTMLInputElement).value = '';
        (document.getElementById('csv-order') as HTMLInputElement).value = '';
        fetchPosts();
        
        // 스크린샷 생성 요청
        if (autoScreenshot) {
          fetch('/api/screenshot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            credentials: 'include'
          }).then(async (res) => {
            if (res.ok) {
              const data = await res.json();
              // 스크린샷 URL 업데이트
              await fetch(`/api/carbon-tech/update-screenshot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ url, screenshot_url: data.screenshot_url })
              });
              fetchPosts();
            }
          }).catch(console.error);
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || '데이터 추가 실패');
      }
    } catch (error: any) {
      alert(`오류: ${error.message}`);
    } finally {
      setCsvUploading(false);
    }
  };

  // CSV 업로드 처리
  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setCsvUploading(true);
    try {
      const response = await fetch('/api/carbon-tech/import-csv', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`CSV 업로드 완료!\n성공: ${result.successCount}개\n실패: ${result.errorCount}개${result.errors ? '\n\n오류:\n' + result.errors.join('\n') : ''}`);
        fetchPosts();
        setShowCSVUpload(false);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'CSV 업로드 실패');
      }
    } catch (error: any) {
      console.error('CSV upload error:', error);
      alert(`CSV 업로드 실패: ${error.message}`);
    } finally {
      setCsvUploading(false);
    }
  };

  // URL 입력 시 자동 스크린샷 생성
  const handleURLChange = async (url: string) => {
    setFormData(prev => ({ ...prev, url }));
    
    if (autoScreenshot && url && (url.startsWith('http://') || url.startsWith('https://'))) {
      try {
        const response = await fetch('/api/screenshot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setFormData(prev => ({ ...prev, screenshot_url: data.screenshot_url }));
        }
      } catch (error) {
        console.error('Screenshot error:', error);
      }
    }
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
            <h1 className="text-2xl font-bold text-gray-900">탄소중립 기술개발 연구자 관리</h1>
            <div className="flex gap-2">
              <button 
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => setShowCSVUpload(true)}
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                CSV 업로드
              </button>
              <button 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowForm(true)}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                새 연구자 추가
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 카테고리 필터 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">대분류별 필터</label>
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

          {/* 연구자 목록 */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연구자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    소속
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대분류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    중분류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    순서
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
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
                        {post.screenshot_url && (
                          <img
                            src={post.screenshot_url}
                            alt=""
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.name}</div>
                          {post.url && (
                            <div className="text-sm text-gray-500 flex items-center">
                              <LinkIcon className="h-3 w-3 mr-1" />
                              <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                                {post.url.length > 30 ? post.url.substring(0, 30) + '...' : post.url}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.main_category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.sub_category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.order_index}
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
                <p className="text-gray-500 mb-4">등록된 연구자가 없습니다</p>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowForm(true)}
                >
                  첫 번째 연구자 추가
                </button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      {/* 연구자 추가/편집 폼 */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">
                {editingPost ? '연구자 정보 편집' : '새 연구자 추가'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">연구자명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소속</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트 URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleURLChange(e.target.value)}
                  onBlur={(e) => handleURLChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={autoScreenshot}
                      onChange={(e) => setAutoScreenshot(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">URL 입력 시 자동 스크린샷 생성</span>
                  </label>
                </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">스크린샷</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {uploadingImage && <p className="text-sm text-gray-500 mt-1">업로드 중...</p>}
                {formData.screenshot_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={formData.screenshot_url} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, screenshot_url: '' }))}
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
                  {editingPost ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV 업로드 모달 */}
      {showCSVUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">CSV 파일 업로드</h2>
              <button 
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                onClick={() => setShowCSVUpload(false)}
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* CSV 모드 선택 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업로드 모드
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="bulk"
                      checked={csvMode === 'bulk'}
                      onChange={(e) => setCsvMode(e.target.value as 'bulk' | 'single')}
                      className="mr-2"
                    />
                    <span>대량 업로드 (전체 CSV)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="single"
                      checked={csvMode === 'single'}
                      onChange={(e) => setCsvMode(e.target.value as 'bulk' | 'single')}
                      className="mr-2"
                    />
                    <span>개별 업로드 (한 줄씩)</span>
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {csvMode === 'bulk' ? 'CSV 파일 형식:' : '개별 데이터 입력:'}
                </p>
                {csvMode === 'bulk' ? (
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`대분류,중분류,교수명,학과,웹사이트URL,순번
탄소중립 기술개발,수소 분야 (생산, 운반, 저장 등),홍길동,공과대학,https://example.com,1`}
                  </pre>
                ) : (
                  <div className="space-y-3">
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="csv-main-category"
                      onChange={(e) => {
                        const subSelect = document.getElementById('csv-sub-category') as HTMLSelectElement;
                        subSelect.innerHTML = '<option value="">중분류 선택</option>';
                        const subs = getSubCategories(e.target.value);
                        subs.forEach(sub => {
                          const option = document.createElement('option');
                          option.value = sub;
                          option.textContent = sub;
                          subSelect.appendChild(option);
                        });
                      }}
                    >
                      <option value="">대분류 선택</option>
                      {categories.map((category) => (
                        <option key={category.main} value={category.main}>
                          {category.main}
                        </option>
                      ))}
                    </select>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="csv-sub-category"
                    >
                      <option value="">중분류 선택</option>
                    </select>
                    <input
                      type="text"
                      placeholder="교수명 (예: 홍길동)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="csv-professor"
                    />
                    <input
                      type="text"
                      placeholder="학과 (예: 공과대학)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="csv-department"
                    />
                    <input
                      type="url"
                      placeholder="웹사이트 URL (예: https://example.com)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="csv-url"
                    />
                    <input
                      type="number"
                      placeholder="순번 (선택사항)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      id="csv-order"
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {csvMode === 'bulk' ? 'CSV 파일 선택' : '개별 데이터 업로드'}
                </label>
                {csvMode === 'bulk' ? (
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    disabled={csvUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <button
                    onClick={handleSingleUpload}
                    disabled={csvUploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    데이터 추가
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={autoScreenshot}
                    onChange={(e) => setAutoScreenshot(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">자동 스크린샷 생성</span>
                </label>
              </div>
              
              {csvUploading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">CSV 파일 처리 중...</p>
                  <p className="text-xs text-gray-500 mt-1">스크린샷 생성에 시간이 걸릴 수 있습니다.</p>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">주의사항</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• CSV 파일은 UTF-8 인코딩이어야 합니다</li>
                  <li>• URL은 http:// 또는 https://로 시작해야 합니다</li>
                  <li>• 중복된 URL은 무시됩니다</li>
                  <li>• 스크린샷은 백그라운드에서 자동 생성됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CarbonTechAdminPage;