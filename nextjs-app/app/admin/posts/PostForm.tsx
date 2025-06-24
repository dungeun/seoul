'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AdminLayout from '@/components/admin/AdminLayout';
import { PhotoIcon, XMarkIcon, PaperClipIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), { ssr: false });

interface Board {
  id: number;
  name: string;
  slug?: string;
}

interface Category {
  id: number;
  name: string;
}

interface PostFormProps {
  postId?: string;
}

export default function PostForm({ postId }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image: '',
    thumbnail_url: '',
    board_id: '',
    category_id: '',
    status: 'published',
    attachment_filename: '',
    attachment_filepath: '',
    attachment_filesize: 0
  });

  useEffect(() => {
    fetchBoards();
    fetchCategories();
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards');
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSlug = (title: string) => {
    // Generate a timestamp-based slug
    const timestamp = Date.now();
    const titlePart = title
      .toLowerCase()
      .replace(/[가-힣ㄱ-ㅎㅏ-ㅣ]/g, '') // Remove Korean characters
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
    
    return titlePart ? `${titlePart}-${timestamp}` : `post-${timestamp}`;
  };

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          featured_image: data.featured_image || '',
          thumbnail_url: data.thumbnail_url || '',
          board_id: data.board_id?.toString() || '',
          category_id: data.category_id?.toString() || '',
          status: data.status || 'published',
          attachment_filename: data.attachment_filename || '',
          attachment_filepath: data.attachment_filepath || '',
          attachment_filesize: data.attachment_filesize || 0
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    // info 게시판인 경우 thumbnailType 추가
    const selectedBoard = boards.find(b => b.id.toString() === formData.board_id);
    if (selectedBoard && selectedBoard.slug === 'info') {
      formDataUpload.append('thumbnailType', 'info');
    }

    setUploadingImage(true);
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formDataUpload
      });
      
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ 
          ...prev, 
          featured_image: data.filepath || data.file_path,
          thumbnail_url: data.thumbnail || ''
        }));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      alert(`이미지 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size based on file type
    const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const maxSize = fileExt === '.pdf' ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxSizeMB = fileExt === '.pdf' ? 50 : 10;
    
    if (file.size > maxSize) {
      alert(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      e.target.value = ''; // Reset file input
      return;
    }
    
    setAttachmentFile(file);
    setFormData(prev => ({
      ...prev,
      attachment_filename: file.name,
      attachment_filesize: file.size
    }));
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setFormData(prev => ({
      ...prev,
      attachment_filename: '',
      attachment_filepath: '',
      attachment_filesize: 0
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 폼 검증
    if (!formData.title?.trim()) {
      toast.error('제목을 입력해주세요.');
      return;
    }
    
    if (!formData.content?.trim()) {
      toast.error('내용을 입력해주세요.');
      return;
    }
    
    setLoading(true);

    try {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';

      // If there's a file attachment, use FormData
      if (attachmentFile) {
        console.log('Form data before sending:', {
          title: formData.title,
          content: formData.content,
          titleLength: formData.title.length,
          contentLength: formData.content.length
        });
        console.log('Attachment file:', attachmentFile);
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title || '');
        formDataToSend.append('slug', postId ? formData.slug : generateSlug(formData.title));
        formDataToSend.append('content', formData.content || '');
        formDataToSend.append('excerpt', formData.excerpt || '');
        formDataToSend.append('featured_image', formData.featured_image || '');
        formDataToSend.append('thumbnail_url', formData.thumbnail_url || '');
        formDataToSend.append('board_id', formData.board_id || '');
        formDataToSend.append('category_id', formData.category_id || '');
        formDataToSend.append('status', formData.status || 'published');
        formDataToSend.append('attachment', attachmentFile);

        const response = await fetch(url, {
          method,
          body: formDataToSend
        });

        if (response.ok) {
          toast.success(postId ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');
          router.push('/admin/posts');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save post');
        }
      } else {
        // No file attachment, use JSON
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            slug: postId ? formData.slug : generateSlug(formData.title),
            board_id: formData.board_id ? parseInt(formData.board_id) : null,
            category_id: formData.category_id ? parseInt(formData.category_id) : null
          })
        });

        if (response.ok) {
          toast.success(postId ? '게시글이 수정되었습니다.' : '게시글이 작성되었습니다.');
          router.push('/admin/posts');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save post');
        }
      }
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(`게시글 저장에 실패했습니다: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {postId ? '게시글 수정' : '새 게시글 작성'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                title: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                게시판
              </label>
              <select
                value={formData.board_id}
                onChange={(e) => setFormData(prev => ({ ...prev, board_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {boards.map(board => (
                  <option key={board.id} value={board.id}>{board.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">선택하세요</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              대표 이미지
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">클릭하여 업로드</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 10MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>
              
              {uploadingImage && (
                <div className="text-center text-sm text-gray-500">업로드 중...</div>
              )}

              {formData.featured_image && (
                <div className="relative">
                  <img
                    src={formData.featured_image}
                    alt="Featured"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              첨부파일
            </label>
            <div className="space-y-4">
              {!formData.attachment_filename && !attachmentFile ? (
                <div className="flex items-center justify-center w-full">
                  <label className="w-full flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PaperClipIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">파일 첨부하기</span>
                      </p>
                      <p className="text-xs text-gray-500">PDF (최대 50MB), DOC, DOCX, XLS, XLSX, HWP (최대 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.hwp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="w-10 h-10 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formData.attachment_filename || attachmentFile?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(formData.attachment_filesize || attachmentFile?.size || 0)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              요약
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="게시글 요약 (선택사항)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용 <span className="text-red-500">*</span>
            </label>
            <div className="bg-white">
              <TiptapEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="게시글 내용을 입력하세요..."
                className="min-h-[400px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              상태
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="published">게시</option>
              <option value="draft">임시저장</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/posts')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '저장 중...' : (postId ? '수정' : '작성')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}