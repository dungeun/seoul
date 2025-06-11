'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  background_image: string | null;
  background_color: string | null;
  text_color: string;
  order_index: number;
  active: boolean;
}

interface FormData {
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  background_image: string;
  background_color: string;
  gradient_start: string;
  gradient_end: string;
  gradient_angle: number;
  overlay_opacity: number;
  text_color: string;
  order_index: number;
  active: boolean;
}

const gradientPresets = [
  { name: '보라색', start: '#667eea', end: '#764ba2', angle: 135 },
  { name: '초록색', start: '#11998e', end: '#38ef7d', angle: 135 },
  { name: '파란색', start: '#2193b0', end: '#6dd5ed', angle: 135 },
  { name: '주황색', start: '#f46b45', end: '#eea849', angle: 135 },
  { name: '분홍색', start: '#ee9ca7', end: '#ffdde1', angle: 135 },
  { name: '남색', start: '#4568dc', end: '#b06ab3', angle: 135 },
];

const HeroSlides = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    background_image: '',
    background_color: '',
    gradient_start: '#667eea',
    gradient_end: '#764ba2',
    gradient_angle: 135,
    overlay_opacity: 0,
    text_color: 'white',
    order_index: 0,
    active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/hero-slides');
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      } else {
        throw new Error('Failed to fetch slides');
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      setError('슬라이드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSlide 
        ? '/api/hero-slides'
        : '/api/hero-slides';
      
      // Generate background_color from gradient values
      const submitData = { ...formData };
      if (!submitData.background_image && submitData.gradient_start && submitData.gradient_end) {
        submitData.background_color = `linear-gradient(${submitData.gradient_angle}deg, ${submitData.gradient_start} 0%, ${submitData.gradient_end} 100%)`;
      }
      
      const response = await fetch(url, {
        method: editingSlide ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(editingSlide ? { ...submitData, id: editingSlide.id } : submitData)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingSlide(null);
        resetForm();
        fetchSlides();
      } else {
        throw new Error('Failed to save slide');
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      setError('슬라이드 저장에 실패했습니다.');
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    // Extract gradient colors if exists
    let gradientStart = '#667eea';
    let gradientEnd = '#764ba2';
    let gradientAngle = 135;
    
    if (slide.background_color && slide.background_color.includes('linear-gradient')) {
      const match = slide.background_color.match(/(\d+)deg.*?(#[a-fA-F0-9]{6}).*?(#[a-fA-F0-9]{6})/);
      if (match) {
        gradientAngle = parseInt(match[1]);
        gradientStart = match[2];
        gradientEnd = match[3];
      }
    }
    
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      button_text: slide.button_text,
      background_image: slide.background_image || '',
      background_color: slide.background_color || '',
      gradient_start: gradientStart,
      gradient_end: gradientEnd,
      gradient_angle: gradientAngle,
      overlay_opacity: 0,
      text_color: slide.text_color,
      order_index: slide.order_index,
      active: slide.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말로 이 슬라이드를 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`/api/hero-slides?id=${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchSlides();
        } else {
          throw new Error('Failed to delete slide');
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
        setError('슬라이드 삭제에 실패했습니다.');
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
          background_image: data.filepath || data.file_path,
          background_color: '' // 이미지를 선택했으면 색상 초기화
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
      subtitle: '',
      description: '',
      button_text: '',
      background_image: '',
      background_color: '',
      gradient_start: '#667eea',
      gradient_end: '#764ba2',
      gradient_angle: 135,
      overlay_opacity: 0,
      text_color: 'white',
      order_index: 0,
      active: true
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSlide(null);
    resetForm();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="text-gray-500">로딩중...</div>
    </div>;
  }

  return (
    <>
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">히어로 슬라이드 관리</h1>
          <button 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            새 슬라이드 추가
          </button>
        </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {slides.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 mb-4">등록된 슬라이드가 없습니다</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => setShowForm(true)}
          >
            첫 번째 슬라이드 추가
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div 
              className="h-48 p-6 flex flex-col justify-center text-center relative overflow-hidden"
              style={{
                background: slide.background_image 
                  ? `url(${slide.background_image}) center/cover`
                  : slide.background_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {slide.background_image && (
                <div 
                  className="absolute inset-0" 
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.4)'
                  }}
                />
              )}
              <div className="relative z-10" style={{ color: slide.text_color }}>
                <h3 className="text-xl font-bold mb-2">{slide.title}</h3>
                <p className="text-sm opacity-90 mb-1">{slide.subtitle}</p>
                <p className="text-xs opacity-80">{slide.description}</p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className={`px-2 py-1 text-xs rounded font-semibold ${
                  slide.active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {slide.active ? '활성' : '비활성'}
                </span>
                <span className="text-sm text-gray-500">순서: {slide.order_index}</span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  onClick={() => handleEdit(slide)}
                >
                  편집
                </button>
                <button 
                  className="flex-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  onClick={() => handleDelete(slide.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
      </div>
      </AdminLayout>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-2xl my-8">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">{editingSlide ? '슬라이드 편집' : '새 슬라이드 추가'}</h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">부제목</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">버튼 텍스트</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">배경 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {uploadingImage && <p className="text-sm text-gray-500 mt-1">업로드 중...</p>}
                {formData.background_image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img 
                      src={formData.background_image} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, background_image: '' }))}
                      className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">배경 설정</label>
                
                {!formData.background_image && (
                  <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-600 mb-2">프리셋</label>
                      <div className="flex flex-wrap gap-2">
                        {gradientPresets.map((preset, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setFormData(prev => ({
                              ...prev,
                              gradient_start: preset.start,
                              gradient_end: preset.end,
                              gradient_angle: preset.angle
                            }))}
                            className="px-3 py-1 text-xs rounded-full border border-gray-300 hover:border-gray-400 bg-white transition-all"
                            style={{
                              background: `linear-gradient(${preset.angle}deg, ${preset.start} 0%, ${preset.end} 100%)`,
                              color: 'white',
                              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">시작 색상</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.gradient_start}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradient_start: e.target.value }))}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.gradient_start}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradient_start: e.target.value }))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">끝 색상</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={formData.gradient_end}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradient_end: e.target.value }))}
                            className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={formData.gradient_end}
                            onChange={(e) => setFormData(prev => ({ ...prev, gradient_end: e.target.value }))}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">그라디언트 각도</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={formData.gradient_angle}
                          onChange={(e) => setFormData(prev => ({ ...prev, gradient_angle: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 w-12">{formData.gradient_angle}°</span>
                      </div>
                    </div>
                    
                    <div 
                      className="h-20 rounded-lg"
                      style={{
                        background: `linear-gradient(${formData.gradient_angle}deg, ${formData.gradient_start} 0%, ${formData.gradient_end} 100%)`
                      }}
                    />
                  </div>
                )}
                
                {formData.background_image && (
                  <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">오버레이 투명도</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={formData.overlay_opacity}
                          onChange={(e) => setFormData(prev => ({ ...prev, overlay_opacity: parseInt(e.target.value) }))}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-gray-700 w-12">{formData.overlay_opacity}%</span>
                      </div>
                    </div>
                    
                    <div className="relative h-20 rounded-lg overflow-hidden">
                      <img 
                        src={formData.background_image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundColor: `rgba(0, 0, 0, ${formData.overlay_opacity / 100})`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">텍스트 색상</label>
                <select
                  value={formData.text_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="white">흰색</option>
                  <option value="black">검은색</option>
                  <option value="#333">회색</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">활성화</span>
                  </label>
                </div>
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
                  {editingSlide ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSlides;