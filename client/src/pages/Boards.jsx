import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  TableCellsIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/boards', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBoards(data || []);
      } else {
        throw new Error('Failed to fetch boards');
      }
    } catch (error) {
      console.error('Failed to fetch boards:', error);
      toast.error('게시판을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[가-힣]/g, '') // Remove Korean characters
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim() || name.toLowerCase().replace(/\s+/g, '-');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setFormData({
      name: '',
      slug: '',
      description: ''
    });
  };

  const handleEdit = (board) => {
    setEditingId(board.id);
    setFormData({
      name: board.name,
      slug: board.slug,
      description: board.description || ''
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '',
      slug: '',
      description: ''
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error('게시판 이름과 URL은 필수입니다');
      return;
    }

    try {
      const url = editingId ? `/api/boards/${editingId}` : '/api/boards';
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingId ? '게시판이 수정되었습니다' : '게시판이 생성되었습니다');
        handleCancel();
        fetchBoards();
      } else {
        const error = await response.json();
        toast.error(error.error || '게시판 저장에 실패했습니다');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('게시판 저장에 실패했습니다');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 게시판을 삭제하시겠습니까? 게시판의 모든 게시글도 함께 삭제됩니다.')) return;

    try {
      const response = await fetch(`/api/boards/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('게시판이 삭제되었습니다');
        fetchBoards();
      } else {
        const error = await response.json();
        toast.error(error.error || '게시판 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('게시판 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">게시판 관리</h1>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          새 게시판
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-blue-800">
            💡 게시판을 생성하면 자동으로 <code className="bg-blue-100 px-1 py-0.5 rounded">/board/[slug]</code> 경로로 접근할 수 있습니다.
          </p>
        </div>
        
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  이름
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL (Slug)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Add new board row */}
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      })}
                      placeholder="게시판 이름"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-gray-500 text-sm mr-1">/board/</span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="board-slug"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="게시판 설명 (선택)"
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">-</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-900"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Existing boards */}
              {boards.map((board) => (
                <tr key={board.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingId === board.id ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          name: e.target.value,
                          slug: generateSlug(e.target.value)
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center">
                        <TableCellsIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{board.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === board.id ? (
                      <div className="flex items-center">
                        <span className="text-gray-500 text-sm mr-1">/board/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <a 
                        href={`/board/${board.slug}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        /board/{board.slug}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === board.id ? (
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{board.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(board.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === board.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(board)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(board.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {boards.length === 0 && !isAdding && (
            <div className="text-center py-12">
              <TableCellsIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">게시판이 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}