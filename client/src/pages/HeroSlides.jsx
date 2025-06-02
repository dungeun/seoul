import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    button_text: '',
    background_image: '',
    background_color: '',
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
      const response = await axios.get('/api/admin/hero-slides');
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
      setError('슬라이드를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        await axios.put(`/api/admin/hero-slides/${editingSlide.id}`, formData);
      } else {
        await axios.post('/api/admin/hero-slides', formData);
      }
      
      setShowForm(false);
      setEditingSlide(null);
      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      setError('슬라이드 저장에 실패했습니다.');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      button_text: slide.button_text,
      background_image: slide.background_image || '',
      background_color: slide.background_color || '',
      text_color: slide.text_color,
      order_index: slide.order_index,
      active: slide.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('정말로 이 슬라이드를 삭제하시겠습니까?')) {
      try {
        await axios.delete(`/api/admin/hero-slides/${id}`);
        fetchSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
        setError('슬라이드 삭제에 실패했습니다.');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    setUploadingImage(true);
    try {
      const response = await axios.post('/api/admin/hero-slides/upload-image', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setFormData(prev => ({
        ...prev,
        background_image: response.data.url,
        background_color: '' // 이미지를 선택했으면 색상 초기화
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('이미지 업로드에 실패했습니다.');
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
    return <div className="loading">로딩중...</div>;
  }

  return (
    <div className="hero-slides-admin">
      <div className="admin-header">
        <h1>히어로 슬라이드 관리</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          새 슬라이드 추가
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="slides-grid">
        {slides.map((slide) => (
          <div key={slide.id} className="slide-card">
            <div 
              className="slide-preview"
              style={{
                background: slide.background_image 
                  ? `url(${slide.background_image}) center/cover`
                  : slide.background_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: slide.text_color,
                height: '200px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <h3>{slide.title}</h3>
              <p>{slide.subtitle}</p>
              <small>{slide.description}</small>
            </div>
            
            <div className="slide-info">
              <div className="slide-meta">
                <span className={`status ${slide.active ? 'active' : 'inactive'}`}>
                  {slide.active ? '활성' : '비활성'}
                </span>
                <span className="order">순서: {slide.order_index}</span>
              </div>
              
              <div className="slide-actions">
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(slide)}
                >
                  편집
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(slide.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSlide ? '슬라이드 편집' : '새 슬라이드 추가'}</h2>
              <button className="modal-close" onClick={handleCancel}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="slide-form">
              <div className="form-group">
                <label>제목</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>부제목</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>버튼 텍스트</label>
                <input
                  type="text"
                  value={formData.button_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>배경 이미지</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && <div className="uploading">업로드 중...</div>}
                {formData.background_image && (
                  <div className="image-preview">
                    <img src={formData.background_image} alt="Preview" style={{ maxWidth: '200px', height: 'auto' }} />
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, background_image: '' }))}
                      className="btn btn-sm btn-danger"
                    >
                      제거
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>배경 색상 (이미지가 없을 때)</label>
                <input
                  type="text"
                  value={formData.background_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                  placeholder="예: linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
              </div>

              <div className="form-group">
                <label>텍스트 색상</label>
                <select
                  value={formData.text_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                >
                  <option value="white">흰색</option>
                  <option value="black">검은색</option>
                  <option value="#333">회색</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>순서</label>
                  <input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    />
                    활성화
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingSlide ? '수정' : '추가'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .hero-slides-admin {
          padding: 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 20px;
        }

        .admin-header h1 {
          margin: 0;
          color: #333;
        }

        .slides-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .slide-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .slide-preview {
          position: relative;
          border-radius: 8px 8px 0 0;
        }

        .slide-preview h3 {
          margin: 0 0 10px 0;
          font-size: 1.4rem;
        }

        .slide-preview p {
          margin: 0 0 10px 0;
          opacity: 0.9;
        }

        .slide-preview small {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .slide-info {
          padding: 15px;
        }

        .slide-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }

        .status.active {
          background: #e7f5e7;
          color: #2d7a2d;
        }

        .status.inactive {
          background: #f5e7e7;
          color: #7a2d2d;
        }

        .order {
          font-size: 0.9rem;
          color: #666;
        }

        .slide-actions {
          display: flex;
          gap: 10px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #ddd;
        }

        .modal-header h2 {
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }

        .slide-form {
          padding: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: flex;
          gap: 20px;
        }

        .form-row .form-group {
          flex: 1;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group textarea {
          resize: vertical;
        }

        .image-preview {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .uploading {
          color: #666;
          font-style: italic;
          margin-top: 5px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }

        .alert {
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid transparent;
          border-radius: 4px;
        }

        .alert-danger {
          color: #721c24;
          background-color: #f8d7da;
          border-color: #f5c6cb;
        }

        .loading {
          text-align: center;
          padding: 50px;
          font-size: 18px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default HeroSlides; 