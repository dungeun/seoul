import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  Bars3BottomLeftIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  LinkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const editorRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'page',
    page_id: null,
    board_id: null,
    sort_order: 0,
    is_active: true,
    content: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menusRes, boardsRes] = await Promise.all([
        axios.get('/api/menus'),
        axios.get('/api/boards')
      ]);

      setMenus(menusRes.data || []);
      setBoards(boardsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[가-힣]/g, '') // Remove Korean characters
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
  };

  const handleAdd = () => {
    setIsAdding(true);
    setExpandedId('new');
    setFormData({
      name: '',
      url: '',
      type: 'page',
      page_id: null,
      board_id: null,
      sort_order: menus.length,
      is_active: true,
      content: ''
    });
  };

  const handleEdit = (menu) => {
    setEditingId(menu.id);
    setExpandedId(menu.id);
    setFormData({
      name: menu.name,
      url: menu.url,
      type: menu.type,
      page_id: menu.page_id,
      board_id: menu.board_id,
      sort_order: menu.sort_order,
      is_active: menu.is_active === 1,
      content: menu.content || ''
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setExpandedId(null);
    setFormData({
      name: '',
      url: '',
      type: 'page',
      page_id: null,
      board_id: null,
      sort_order: 0,
      is_active: true,
      content: ''
    });
  };

  const handleTypeChange = (type) => {
    const newData = { ...formData, type };
    
    // Auto-generate URL based on type and name
    if (formData.name) {
      const slug = generateSlug(formData.name) || formData.name.toLowerCase().replace(/\s+/g, '-');
      if (type === 'page') {
        newData.url = `/page/${slug}`;
        newData.board_id = null;
      } else if (type === 'board') {
        newData.url = `/board/${slug}`;
        newData.page_id = null;
        newData.content = '';
      } else if (type === 'link') {
        newData.url = '';
        newData.page_id = null;
        newData.board_id = null;
        newData.content = '';
      }
    }
    
    setFormData(newData);
  };

  const handleNameChange = (name) => {
    const slug = generateSlug(name) || name.toLowerCase().replace(/\s+/g, '-');
    const newData = { ...formData, name };
    
    // Auto-generate URL based on type
    if (formData.type === 'page') {
      newData.url = `/page/${slug}`;
    } else if (formData.type === 'board') {
      newData.url = `/board/${slug}`;
    }
    
    setFormData(newData);
  };

  const handleToggleActive = async (menu) => {
    try {
      await axios.put(`/api/menus/${menu.id}`, {
        ...menu,
        is_active: menu.is_active === 1 ? 0 : 1
      });
      toast.success(menu.is_active === 1 ? '메뉴가 비활성화되었습니다' : '메뉴가 활성화되었습니다');
      fetchData();
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      toast.error('메뉴 이름과 URL은 필수입니다');
      return;
    }

    const saveData = { ...formData };
    
    // Get content from editor if it's a page type
    if (formData.type === 'page' && editorRef.current) {
      saveData.content = editorRef.current.getInstance().getHTML();
    }

    // Convert boolean to integer for SQLite
    saveData.is_active = saveData.is_active ? 1 : 0;

    try {
      if (editingId) {
        await axios.put(`/api/menus/${editingId}`, saveData);
        toast.success('메뉴가 수정되었습니다');
      } else {
        await axios.post('/api/menus', saveData);
        toast.success('메뉴가 생성되었습니다');
      }
      handleCancel();
      fetchData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.error || '메뉴 저장에 실패했습니다');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/menus/${id}`);
      toast.success('메뉴가 삭제되었습니다');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || '메뉴 삭제에 실패했습니다');
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    
    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[index - 1];
    newMenus[index - 1] = temp;
    
    // Update sort orders
    try {
      await Promise.all([
        axios.put(`/api/menus/${newMenus[index].id}`, { ...newMenus[index], sort_order: index }),
        axios.put(`/api/menus/${newMenus[index - 1].id}`, { ...newMenus[index - 1], sort_order: index - 1 })
      ]);
      fetchData();
    } catch (error) {
      toast.error('순서 변경에 실패했습니다');
    }
  };

  const handleMoveDown = async (index) => {
    if (index === menus.length - 1) return;
    
    const newMenus = [...menus];
    const temp = newMenus[index];
    newMenus[index] = newMenus[index + 1];
    newMenus[index + 1] = temp;
    
    // Update sort orders
    try {
      await Promise.all([
        axios.put(`/api/menus/${newMenus[index].id}`, { ...newMenus[index], sort_order: index }),
        axios.put(`/api/menus/${newMenus[index + 1].id}`, { ...newMenus[index + 1], sort_order: index + 1 })
      ]);
      fetchData();
    } catch (error) {
      toast.error('순서 변경에 실패했습니다');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'page':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'board':
        return <RectangleStackIcon className="h-5 w-5 text-green-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      page: '페이지',
      board: '게시판',
      link: '외부 링크'
    };
    return labels[type] || type;
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메뉴/페이지 관리</h1>
          <p className="mt-1 text-sm text-gray-600">메뉴를 생성하고 페이지 콘텐츠를 직접 편집할 수 있습니다</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          새 메뉴
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Add new menu */}
        {isAdding && (
          <div className="border-b border-gray-200 bg-blue-50">
            <div className="p-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="메뉴 이름"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="page">페이지</option>
                    <option value="board">게시판</option>
                    <option value="link">외부 링크</option>
                  </select>
                </div>
                <div className="col-span-3">
                  {formData.type === 'link' ? (
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="/page/slug 또는 /board/slug"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      readOnly
                    />
                  )}
                </div>
                <div className="col-span-2">
                  <div className="flex items-center h-full">
                    <Switch
                      checked={formData.is_active}
                      onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      className={classNames(
                        formData.is_active ? 'bg-blue-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          formData.is_active ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                      />
                    </Switch>
                    <span className="ml-2 text-sm text-gray-600">
                      {formData.is_active ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleSave}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content editor for page type */}
              {expandedId === 'new' && formData.type === 'page' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    페이지 내용
                  </label>
                  <div className="border border-gray-300 rounded-lg">
                    <Editor
                      ref={editorRef}
                      initialValue={formData.content || ''}
                      previewStyle="tab"
                      height="400px"
                      initialEditType="wysiwyg"
                      useCommandShortcut={true}
                      toolbarItems={[
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock']
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Board selection for board type */}
              {formData.type === 'board' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    게시판 선택
                  </label>
                  <select
                    value={formData.board_id || ''}
                    onChange={(e) => setFormData({ ...formData, board_id: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">새 게시판 생성</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>{board.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing menus */}
        <div className="divide-y divide-gray-200">
          {menus.map((menu, index) => (
            <div key={menu.id} className="hover:bg-gray-50">
              <div className="p-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="flex flex-col mr-2">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className={`p-0.5 ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          <ChevronUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === menus.length - 1}
                          className={`p-0.5 ${index === menus.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          <ChevronDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                      {getTypeIcon(menu.type)}
                      {editingId === menu.id ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className="ml-2 font-medium text-gray-900">{menu.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    {editingId === menu.id ? (
                      <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="page">페이지</option>
                        <option value="board">게시판</option>
                        <option value="link">외부 링크</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600">{getTypeLabel(menu.type)}</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    {editingId === menu.id ? (
                      formData.type === 'link' ? (
                        <input
                          type="text"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          placeholder="https://example.com"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formData.url}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                      )
                    ) : (
                      <span className="text-sm text-gray-600">{menu.url}</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Switch
                      checked={menu.is_active === 1}
                      onChange={() => handleToggleActive(menu)}
                      className={classNames(
                        menu.is_active === 1 ? 'bg-blue-600' : 'bg-gray-200',
                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          menu.is_active === 1 ? 'translate-x-5' : 'translate-x-0',
                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                        )}
                      />
                    </Switch>
                    <span className="ml-2 text-sm text-gray-600">
                      {menu.is_active === 1 ? '활성' : '비활성'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    {editingId === menu.id ? (
                      <div className="flex justify-end space-x-2">
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
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(menu)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content editor for editing page */}
                {expandedId === menu.id && editingId === menu.id && formData.type === 'page' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      페이지 내용
                    </label>
                    <div className="border border-gray-300 rounded-lg">
                      <Editor
                        ref={editorRef}
                        initialValue={formData.content || ''}
                        previewStyle="tab"
                        height="400px"
                        initialEditType="wysiwyg"
                        useCommandShortcut={true}
                        toolbarItems={[
                          ['heading', 'bold', 'italic', 'strike'],
                          ['hr', 'quote'],
                          ['ul', 'ol', 'task'],
                          ['table', 'image', 'link'],
                          ['code', 'codeblock']
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* Board selection for editing board type */}
                {editingId === menu.id && formData.type === 'board' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      게시판 선택
                    </label>
                    <select
                      value={formData.board_id || ''}
                      onChange={(e) => setFormData({ ...formData, board_id: e.target.value ? parseInt(e.target.value) : null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">새 게시판 생성</option>
                      {boards.map(board => (
                        <option key={board.id} value={board.id}>{board.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {menus.length === 0 && !isAdding && (
          <div className="text-center py-12">
            <Bars3BottomLeftIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">메뉴가 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">새 메뉴를 추가하여 시작하세요</p>
          </div>
        )}
      </div>
    </div>
  );
}