import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [boards, setBoards] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    board_id: '',
    content: '',
    status: 'draft',
    meta_description: '',
    featured_image: null
  });

  useEffect(() => {
    fetchCategories();
    fetchBoards();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/posts/${id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title,
          slug: data.slug,
          category: data.category_id || '',
          board_id: data.board_id || '',
          content: data.content,
          status: data.status || 'draft',
          meta_description: data.meta_description || '',
          featured_image: null
        });
        
        // Set editor content
        if (editorRef.current) {
          const editorInstance = editorRef.current.getInstance();
          editorInstance.setMarkdown(data.content);
        }
      }
    } catch (error) {
      toast.error('게시글을 불러오는데 실패했습니다');
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const editorInstance = editorRef.current.getInstance();
    const content = editorInstance.getMarkdown();

    const submitData = {
      title: formData.title,
      slug: formData.slug,
      content: content,
      category_id: formData.category || null,
      board_id: formData.board_id || null,
      status: formData.status,
      meta_description: formData.meta_description
    };

    try {
      const url = id 
        ? `/api/posts/${id}`
        : '/api/posts';
      
      const response = await fetch(url, {
        method: id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(id ? '게시글이 수정되었습니다' : '게시글이 생성되었습니다');
        navigate('/posts');
      } else {
        const error = await response.json();
        toast.error(error.error || '게시글 저장에 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {id ? '게시글 수정' : '새 게시글'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="게시글 제목을 입력하세요"
            />
          </div>

          {/* Slug */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="post-url-slug"
            />
          </div>

          {/* Board and Category */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                게시판
              </label>
              <select
                value={formData.board_id}
                onChange={(e) => setFormData({ ...formData, board_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">게시판 선택</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* Content Editor */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <div className="border border-gray-300 rounded-md">
              <Editor
                ref={editorRef}
                initialValue={formData.content || ''}
                previewStyle="vertical"
                height="400px"
                initialEditType="markdown"
                useCommandShortcut={true}
                hideModeSwitch={false}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '저장 중...' : (id ? '수정하기' : '등록하기')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}