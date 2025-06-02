import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

export default function PageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/pages/${slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setPage(data);
      } else if (response.status === 404) {
        setError('페이지를 찾을 수 없습니다.');
      } else {
        setError('페이지를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">오류</h2>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{page.title}</h1>
        
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content || '<p>내용이 없습니다.</p>' }} />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            최종 수정: {new Date(page.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}