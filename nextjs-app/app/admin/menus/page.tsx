'use client';

import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import Switch from '@/components/ui/Switch';
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
  ChevronDownIcon,
  Bars4Icon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon as ChevronDownSolid } from '@heroicons/react/24/solid';
// 간단한 텍스트에디터로 대체

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface Menu {
  id: number;
  name: string;
  url: string;
  type: 'page' | 'board' | 'link';
  page_id: number | null;
  board_id: number | null;
  parent_id: number | null;
  sort_order: number;
  is_active: number;
  content?: string;
  children?: Menu[];
  expanded?: boolean;
}

interface Board {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  url: string;
  type: 'page' | 'board' | 'link';
  page_id: number | null;
  board_id: number | null;
  parent_id: number | null;
  sort_order: number;
  is_active: boolean;
  content: string;
}

interface PageFile {
  name: string;
  path: string;
}

interface DropTarget {
  targetId: number | null;
  position: 'before' | 'after' | 'inside';
}

export default function Menus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [flatMenus, setFlatMenus] = useState<Menu[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [pageFiles, setPageFiles] = useState<PageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [draggedMenu, setDraggedMenu] = useState<Menu | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    url: '',
    type: 'page',
    page_id: null,
    board_id: null,
    parent_id: null,
    sort_order: 0,
    is_active: true,
    content: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPageSelector) {
        const target = event.target as HTMLElement;
        if (!target.closest('.page-selector-dropdown')) {
          setShowPageSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPageSelector]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menusRes, boardsRes, pagesRes] = await Promise.all([
        fetch('/api/menus'),
        fetch('/api/boards'),
        fetch('/api/pages')
      ]);

      if (!menusRes.ok || !boardsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const menusData = await menusRes.json();
      const boardsData = await boardsRes.json();
      const pagesData = pagesRes.ok ? await pagesRes.json() : [];

      setFlatMenus(menusData || []);
      setMenus(buildMenuTree(menusData || []));
      setBoards(boardsData || []);
      setPageFiles(pagesData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const buildMenuTree = (flatMenus: Menu[]): Menu[] => {
    const menuMap = new Map<number, Menu>();
    const rootMenus: Menu[] = [];

    // Create menu map
    flatMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [], expanded: expandedMenus.has(menu.id) });
    });

    // Build tree
    flatMenus.forEach(menu => {
      const menuNode = menuMap.get(menu.id)!;
      if (menu.parent_id) {
        const parent = menuMap.get(menu.parent_id);
        if (parent) {
          parent.children!.push(menuNode);
        } else {
          rootMenus.push(menuNode);
        }
      } else {
        rootMenus.push(menuNode);
      }
    });

    // Sort children by sort_order
    const sortMenus = (menus: Menu[]) => {
      menus.sort((a, b) => a.sort_order - b.sort_order);
      menus.forEach(menu => {
        if (menu.children) {
          sortMenus(menu.children);
        }
      });
    };

    sortMenus(rootMenus);
    return rootMenus;
  };

  const toggleMenuExpansion = (menuId: number) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
    setMenus(buildMenuTree(flatMenus));
  };

  const handleAdd = (parentId: number | null = null) => {
    setIsAdding(true);
    setExpandedId('new');
    setFormData({
      name: '',
      url: '',
      type: 'page',
      page_id: null,
      board_id: null,
      parent_id: parentId,
      sort_order: flatMenus.filter(m => m.parent_id === parentId).length,
      is_active: true,
      content: ''
    });
  };

  const loadExistingPage = async (pagePath: string) => {
    try {
      const pageName = pagePath.split('/').pop() || '';
      const response = await fetch(`/api/pages/content?path=${encodeURIComponent(pagePath)}`);
      let content = '';
      
      if (response.ok) {
        const data = await response.json();
        content = data.content || '';
      }
      
      setFormData(prev => ({
        ...prev,
        name: pageName.charAt(0).toUpperCase() + pageName.slice(1),
        url: pagePath,
        content: content
      }));
      
      alert(`페이지 "${pagePath}"를 불러왔습니다.`);
    } catch (error) {
      console.error('Error loading page:', error);
      alert('페이지를 불러오는데 실패했습니다.');
    }
  };

  const handleEdit = (menu: Menu) => {
    setEditingId(menu.id);
    setExpandedId(menu.id);
    setFormData({
      name: menu.name,
      url: menu.url,
      type: menu.type,
      page_id: menu.page_id,
      board_id: menu.board_id,
      parent_id: menu.parent_id,
      sort_order: menu.sort_order,
      is_active: Boolean(menu.is_active),
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
      parent_id: null,
      sort_order: 0,
      is_active: true,
      content: ''
    });
  };

  const handleTypeChange = (type: 'page' | 'board' | 'link') => {
    const newData = { ...formData, type };
    
    if (type === 'page') {
      newData.url = formData.url || '/';
      newData.board_id = null;
    } else if (type === 'board') {
      newData.url = formData.url || '/board/';
      newData.page_id = null;
      newData.content = '';
    } else if (type === 'link') {
      newData.url = '';
      newData.page_id = null;
      newData.board_id = null;
      newData.content = '';
    }
    
    setFormData(newData);
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
  };

  const handlePageSelect = (pagePath: string) => {
    setFormData(prev => ({ ...prev, url: pagePath }));
    setShowPageSelector(false);
  };

  const handleToggleActive = async (menu: Menu) => {
    try {
      const newIsActive = menu.is_active === 1 ? 0 : 1;
      const response = await fetch(`/api/menus/${menu.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...menu,
          is_active: newIsActive
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle');
      }

      alert(newIsActive === 1 ? '메뉴가 활성화되었습니다' : '메뉴가 비활성화되었습니다');
      fetchData();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('상태 변경에 실패했습니다');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.url) {
      alert('메뉴 이름과 URL은 필수입니다');
      return;
    }

    const saveData: any = { ...formData };
    
    if (formData.type === 'page') {
      saveData.content = formData.content;
    }

    saveData.is_active = saveData.is_active ? 1 : 0;

    try {
      const url = editingId ? `/api/menus/${editingId}` : '/api/menus';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save');
      }

      alert(editingId ? '메뉴가 수정되었습니다' : '메뉴가 생성되었습니다');
      handleCancel();
      fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || '메뉴 저장에 실패했습니다');
    }
  };

  const handleDelete = async (id: number) => {
    const menuToDelete = flatMenus.find(m => m.id === id);
    const hasChildren = flatMenus.some(m => m.parent_id === id);
    
    if (hasChildren) {
      alert('하위 메뉴가 있는 메뉴는 삭제할 수 없습니다. 먼저 하위 메뉴를 삭제하거나 이동하세요.');
      return;
    }

    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/menus/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }

      alert('메뉴가 삭제되었습니다');
      fetchData();
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.message || '메뉴 삭제에 실패했습니다');
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, menu: Menu) => {
    setDraggedMenu(menu);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, targetMenu: Menu, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedMenu && draggedMenu.id !== targetMenu.id) {
      // Prevent dropping a parent into its own child
      if (!isDescendant(targetMenu, draggedMenu)) {
        setDropTarget({ targetId: targetMenu.id, position });
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropTarget(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetMenu: Menu, position: 'before' | 'after' | 'inside') => {
    e.preventDefault();
    
    if (!draggedMenu || !dropTarget || draggedMenu.id === targetMenu.id) {
      setDraggedMenu(null);
      setDropTarget(null);
      return;
    }

    try {
      let newParentId: number | null;
      let newSortOrder: number;

      if (position === 'inside') {
        newParentId = targetMenu.id;
        newSortOrder = flatMenus.filter(m => m.parent_id === targetMenu.id).length;
      } else {
        newParentId = targetMenu.parent_id;
        const siblings = flatMenus.filter(m => m.parent_id === newParentId);
        const targetIndex = siblings.findIndex(m => m.id === targetMenu.id);
        newSortOrder = position === 'before' ? targetIndex : targetIndex + 1;

        // Update sort orders for affected siblings
        siblings.forEach((sibling, index) => {
          if (index >= newSortOrder && sibling.id !== draggedMenu.id) {
            updateMenuSortOrder(sibling.id, index + 1);
          }
        });
      }

      const response = await fetch(`/api/menus/${draggedMenu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draggedMenu,
          parent_id: newParentId,
          sort_order: newSortOrder
        })
      });

      if (!response.ok) {
        throw new Error('Failed to move menu');
      }

      fetchData();
    } catch (error) {
      console.error('Move error:', error);
      alert('메뉴 이동에 실패했습니다');
    }

    setDraggedMenu(null);
    setDropTarget(null);
  };

  const updateMenuSortOrder = async (menuId: number, sortOrder: number) => {
    const menu = flatMenus.find(m => m.id === menuId);
    if (!menu) return;

    await fetch(`/api/menus/${menuId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...menu, sort_order: sortOrder })
    });
  };

  const isDescendant = (potential_ancestor: Menu, potential_descendant: Menu): boolean => {
    const checkDescendant = (menuId: number): boolean => {
      const children = flatMenus.filter(m => m.parent_id === menuId);
      return children.some(child => 
        child.id === potential_descendant.id || checkDescendant(child.id)
      );
    };
    return checkDescendant(potential_ancestor.id);
  };

  const getTypeIcon = (type: string) => {
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

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      page: '페이지',
      board: '게시판',
      link: '외부 링크'
    };
    return labels[type] || type;
  };

  const renderMenu = (menu: Menu, level: number = 0): React.ReactNode => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedMenus.has(menu.id);
    const isDragTarget = dropTarget?.targetId === menu.id;
    const isDragging = draggedMenu?.id === menu.id;

    return (
      <div key={menu.id}>
        {/* Drop zone before */}
        {level === 0 && (
          <div
            className={`h-2 ${isDragTarget && dropTarget?.position === 'before' ? 'bg-blue-200 border-t-2 border-blue-500' : ''}`}
            onDragOver={(e) => handleDragOver(e, menu, 'before')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, menu, 'before')}
          />
        )}

        <div 
          className={`hover:bg-gray-50 transition-colors border-l-4 ${
            level > 0 ? 'border-gray-200 ml-6' : 'border-transparent'
          } ${isDragging ? 'opacity-50' : ''} ${
            isDragTarget && dropTarget?.position === 'inside' ? 'bg-blue-50 border-blue-300' : ''
          }`}
          draggable={editingId !== menu.id}
          onDragStart={(e) => handleDragStart(e, menu)}
          onDragOver={(e) => handleDragOver(e, menu, 'inside')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, menu, 'inside')}
        >
          <div className="p-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
                  {hasChildren && (
                    <button
                      onClick={() => toggleMenuExpansion(menu.id)}
                      className="mr-2 p-1 hover:bg-gray-200 rounded transition-all duration-200"
                    >
                      {isExpanded ? (
                        <ChevronDownSolid className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  )}
                  {!hasChildren && <div className="w-6 mr-2" />}
                  
                  {editingId !== menu.id && (
                    <div className="mr-3 cursor-move text-gray-400 hover:text-gray-600">
                      <Bars4Icon className="h-5 w-5" />
                    </div>
                  )}
                  
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
                  
                  {level === 0 && (
                    <button
                      onClick={() => handleAdd(menu.id)}
                      className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                      title="하위 메뉴 추가"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                {editingId === menu.id ? (
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value as 'page' | 'board' | 'link')}
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
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder={formData.type === 'link' ? 'https://example.com' : '/page-url'}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm text-gray-600">{menu.url}</span>
                )}
              </div>
              <div className="col-span-1">
                <Switch
                  checked={Boolean(menu.is_active)}
                  onChange={() => handleToggleActive(menu)}
                  className={classNames(
                    Boolean(menu.is_active) ? 'bg-green-600' : 'bg-gray-200',
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={classNames(
                      Boolean(menu.is_active) ? 'translate-x-5' : 'translate-x-0',
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
                    )}
                  />
                </Switch>
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
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {menu.children!.map(child => renderMenu(child, level + 1))}
          </div>
        )}

        {/* Drop zone after */}
        {level === 0 && (
          <div
            className={`h-2 ${isDragTarget && dropTarget?.position === 'after' ? 'bg-blue-200 border-b-2 border-blue-500' : ''}`}
            onDragOver={(e) => handleDragOver(e, menu, 'after')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, menu, 'after')}
          />
        )}
      </div>
    );
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">계층형 메뉴 관리</h1>
            <p className="mt-1 text-sm text-gray-600">드래그 앤 드롭으로 계층구조를 변경하고 메뉴를 관리할 수 있습니다</p>
          </div>
          <button
            onClick={() => handleAdd(null)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            새 대분류 메뉴
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Add new menu form */}
          {isAdding && (
            <div className="border-b border-gray-200 bg-blue-50">
              <div className="p-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
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
                      onChange={(e) => handleTypeChange(e.target.value as 'page' | 'board' | 'link')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="page">페이지</option>
                      <option value="board">게시판</option>
                      <option value="link">외부 링크</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder={formData.type === 'link' ? 'https://example.com' : '/page-url'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="col-span-1">
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

                {/* Parent menu info */}
                {formData.parent_id && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      📁 하위 메뉴로 추가됩니다: {flatMenus.find(m => m.id === formData.parent_id)?.name}
                    </p>
                  </div>
                )}

                {/* Content editor for page type */}
                {formData.type === 'page' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      페이지 내용 (선택사항)
                    </label>
                    <div className="border border-gray-300 rounded-lg">
                      <textarea
                        value={formData.content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border-0 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="페이지 내용을 입력하세요..."
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

          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
              <div className="col-span-4">메뉴명</div>
              <div className="col-span-2">유형</div>
              <div className="col-span-3">URL</div>
              <div className="col-span-1">활성</div>
              <div className="col-span-2">작업</div>
            </div>
          </div>

          {/* Menu Tree */}
          <div className="divide-y divide-gray-200">
            {menus.map(menu => renderMenu(menu))}
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
    </AdminLayout>
  );
}