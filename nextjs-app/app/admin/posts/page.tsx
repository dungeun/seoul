'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

interface Post {
  id: number;
  title: string;
  slug: string;
  category_name?: string;
  board_name?: string;
  status?: string;
  created_at: string;
}

interface Board {
  id: number;
  name: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const postsPerPage = 10;

  useEffect(() => {
    fetchBoards();
    fetchPosts();
  }, [currentPage, searchTerm, selectedBoard]);

  const fetchBoards = async () => {
    try {
      const response = await fetch('/api/boards', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/posts?page=${currentPage}&search=${searchTerm}&board=${selectedBoard}`,
        {
          credentials: 'include'
        }
      );

      console.log('Posts API Response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Posts data:', data);
        
        // 서버 응답 형식에 맞게 수정
        setPosts(data.results || data.posts || []);
        
        // 페이지네이션 정보 처리
        const total = data.count || data.pagination?.total || 0;
        const calculatedPages = Math.ceil(total / postsPerPage);
        setTotalPages(data.totalPages || data.pagination?.totalPages || calculatedPages || 1);
      } else {
        console.error('Posts API failed:', response.status);
        // Use sample data for demo
        setPosts([
          {
            id: 1,
            title: 'React 시작하기',
            slug: 'getting-started-with-react',
            category_name: '공지사항',
            board_name: '공지사항',
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            title: '웹 개발 모범 사례',
            slug: 'best-practices-web-development',
            category_name: '일반',
            board_name: '일반 게시판',
            created_at: '2024-01-14T14:20:00Z'
          },
          {
            id: 3,
            title: '최신 CSS 이해하기',
            slug: 'understanding-modern-css',
            category_name: '자료',
            board_name: '일반 게시판',
            created_at: '2024-01-13T09:15:00Z'
          }
        ]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      alert('게시글을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이 게시글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('게시글이 삭제되었습니다');
        fetchPosts();
      } else {
        alert('게시글 삭제에 실패했습니다');
      }
    } catch (error) {
      alert('네트워크 오류');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status?: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800'
    };
    const labels: Record<string, string> = {
      published: '게시됨',
      draft: '임시저장'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status || ''] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status || ''] || status}
      </span>
    );
  };

  if (loading && posts.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">게시글 관리</h1>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          새 게시글
        </Link>
      </div>

      {/* Search Bar and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="게시글 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
          <select
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">모든 게시판</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                게시판
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">/{post.slug}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {post.board_name || '미지정'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {post.category_name || '미분류'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(post.created_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/posts/edit/${post.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">게시글이 없습니다</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            이전
          </button>
          
          <span className="text-sm text-gray-700">
            {currentPage} / {totalPages} 페이지
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
            <ChevronRightIcon className="h-5 w-5 ml-1" />
          </button>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}