'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Post {
  id: number;
  title: string;
  slug?: string;
  content?: string;
  board_id: number;
  board_name?: string;
  board_slug?: string;
  created_at: string;
  updated_at: string;
}

export default function PostView() {
  const params = useParams();
  const identifier = params.identifier as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [identifier]);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/post/${identifier}`);
      
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else if (response.status === 404) {
        setError('게시글을 찾을 수 없습니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
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

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {post.board_slug && (
          <Link 
            href={`/board/${post.board_slug}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {post.board_name || '목록으로 돌아가기'}
          </Link>
        )}
        
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <span>
              작성일: {new Date(post.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {post.updated_at && post.updated_at !== post.created_at && (
              <span className="ml-4">
                수정일: {new Date(post.updated_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content || '<p>내용이 없습니다.</p>' }} />
          </div>
        </div>
      </div>
    </div>
  );
}