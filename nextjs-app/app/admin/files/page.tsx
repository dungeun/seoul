'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CloudArrowUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface FileItem {
  id: number;
  name: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  uploaded_at: string;
  url: string;
}

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/files/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFiles(data.results || []);
      } else {
        // Sample files for demo
        setFiles([
          {
            id: 1,
            name: 'hero-banner.jpg',
            file_type: 'image',
            size: 1024 * 1024 * 2.5, // 2.5 MB
            uploaded_at: '2024-01-15T10:30:00Z',
            url: '/media/hero-banner.jpg'
          },
          {
            id: 2,
            name: 'product-guide.pdf',
            file_type: 'document',
            size: 1024 * 1024 * 1.2, // 1.2 MB
            uploaded_at: '2024-01-14T14:20:00Z',
            url: '/media/product-guide.pdf'
          },
          {
            id: 3,
            name: 'intro-video.mp4',
            file_type: 'video',
            size: 1024 * 1024 * 25, // 25 MB
            uploaded_at: '2024-01-13T09:15:00Z',
            url: '/media/intro-video.mp4'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
      alert('파일을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    setSelectedFiles(filesArray);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem('token');

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        const response = await fetch('http://localhost:8000/api/files/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      alert('파일이 업로드되었습니다');
      setSelectedFiles([]);
      fetchFiles();
    } catch (error: any) {
      alert(error.message || '업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/files/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('파일이 삭제되었습니다');
        fetchFiles();
      } else {
        alert('파일 삭제에 실패했습니다');
      }
    } catch (error) {
      alert('네트워크 오류');
    }
  };

  const getFileIcon = (fileType: string) => {
    const icons: { [key: string]: typeof PhotoIcon } = {
      image: PhotoIcon,
      video: FilmIcon,
      audio: MusicalNoteIcon,
      document: DocumentIcon
    };
    const Icon = icons[fileType] || DocumentIcon;
    return <Icon className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">파일 관리</h1>

      {/* Upload Area */}
      <div
        className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          파일을 여기에 드래그 앤 드롭하거나 클릭하여 선택하세요
        </p>
        <input
          type="file"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          파일 선택
        </label>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              선택된 파일 ({selectedFiles.length})
            </h3>
            <button
              onClick={() => setSelectedFiles([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <ul className="space-y-2 mb-4">
            {selectedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name} ({formatFileSize(file.size)})
              </li>
            ))}
          </ul>
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? '업로드 중...' : '파일 업로드'}
          </button>
        </div>
      )}

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
          >
            <div className="flex items-center justify-center h-20 mb-3 text-gray-400">
              {getFileIcon(file.file_type)}
            </div>
            <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
              {file.name}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {formatFileSize(file.size)} • {formatDate(file.uploaded_at)}
            </p>
            <div className="flex space-x-2">
              <a
                href={file.url}
                download
                className="flex-1 inline-flex items-center justify-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                다운로드
              </a>
              <button
                onClick={() => handleDelete(file.id)}
                className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {files.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">업로드된 파일이 없습니다</p>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}