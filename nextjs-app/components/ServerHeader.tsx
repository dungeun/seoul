import React from 'react';
import { dbQuery } from '@/lib/database';
import ClientHeader from './ClientHeader';

interface MenuItem {
  id: number;
  name: string;
  url: string;
  type: 'page' | 'board' | 'link';
  page_id?: number | null;
  board_id?: number | null;
  parent_id: number | null;
  sort_order: number;
  is_active: number;
  content?: string;
  children?: MenuItem[];
}

async function getMenus(): Promise<MenuItem[]> {
  try {
    const allMenus = await dbQuery.all<MenuItem>(
      `SELECT * FROM menus WHERE is_active = 1 ORDER BY sort_order ASC`
    );
    
    // 계층 구조로 변환
    const menuMap = new Map<number, MenuItem>();
    const rootMenus: MenuItem[] = [];
    
    // 먼저 모든 메뉴를 맵에 저장
    allMenus.forEach(menu => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });
    
    // 부모-자식 관계 설정
    allMenus.forEach(menu => {
      const menuItem = menuMap.get(menu.id)!;
      if (menu.parent_id === null || menu.parent_id === 0) {
        rootMenus.push(menuItem);
      } else {
        const parent = menuMap.get(menu.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      }
    });
    
    return rootMenus;
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    // 기본 메뉴 반환
    return [
      { id: 1, name: '온실가스', url: '/greenhouse-gas', type: 'page', parent_id: null, sort_order: 1, is_active: 1 },
      { id: 2, name: '에너지', url: '/energy', type: 'page', parent_id: null, sort_order: 2, is_active: 1 },
      { id: 3, name: '태양광 발전', url: '/solar-power', type: 'page', parent_id: null, sort_order: 3, is_active: 1 },
    ];
  }
}

interface HeaderProps {
  currentPage?: string;
}

export default async function ServerHeader({ currentPage = '' }: HeaderProps) {
  const menus = await getMenus();
  
  return <ClientHeader menus={menus} currentPage={currentPage} />;
}