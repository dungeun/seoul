import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

// 메뉴 데이터
const menus = [
  { name: '온실가스', url: '/page/greenhouse-gas', type: 'page', sort_order: 1 },
  { name: '에너지', url: '/page/energy', type: 'page', sort_order: 2 },
  { name: '그린캠퍼스', url: '/page/green-campus', type: 'page', sort_order: 3 },
  { name: '그린아카이브', url: '/board/green-archive', type: 'board', sort_order: 4 },
  { name: '탄소중립연구자 네트워크', url: '/board/carbon-neutral-network', type: 'board', sort_order: 5 },
  { name: '에너지 데이터 플랫폼', url: '/page/energy-data-platform', type: 'page', sort_order: 6 }
];

// 게시판 데이터
const boards = [
  { name: '공지사항', slug: 'notice', description: '공지사항 게시판입니다.' },
  { name: '일반 게시판', slug: 'general', description: '일반 게시판입니다.' },
  { name: '그린아카이브', slug: 'green-archive', description: '그린캠퍼스 관련 자료를 공유하는 게시판입니다.' },
  { name: '탄소중립연구자 네트워크', slug: 'carbon-neutral-network', description: '탄소중립 연구자들의 네트워크 게시판입니다.' }
];

// 페이지 데이터
const pages = [
  { title: '온실가스', slug: 'greenhouse-gas', content: '<h1>온실가스</h1><p>온실가스 관련 정보를 제공합니다.</p>' },
  { title: '에너지', slug: 'energy', content: '<h1>에너지</h1><p>에너지 관련 정보를 제공합니다.</p>' },
  { title: '그린캠퍼스', slug: 'green-campus', content: '<h1>그린캠퍼스</h1><p>그린캠퍼스 프로젝트 소개</p>' },
  { title: '에너지 데이터 플랫폼', slug: 'energy-data-platform', content: '<h1>에너지 데이터 플랫폼</h1><p>에너지 데이터 분석 플랫폼입니다.</p>' }
];

async function setupData() {
  console.log('Setting up menus, boards, and pages...');
  
  // 게시판 생성
  for (const board of boards) {
    db.run(
      'INSERT OR IGNORE INTO boards (name, slug, description) VALUES (?, ?, ?)',
      [board.name, board.slug, board.description],
      (err) => {
        if (err) console.error('Error creating board:', err);
        else console.log(`Board created: ${board.name}`);
      }
    );
  }
  
  // 페이지 생성
  setTimeout(() => {
    for (const page of pages) {
      db.run(
        'INSERT OR IGNORE INTO pages (title, slug, content) VALUES (?, ?, ?)',
        [page.title, page.slug, page.content],
        (err) => {
          if (err) console.error('Error creating page:', err);
          else console.log(`Page created: ${page.title}`);
        }
      );
    }
  }, 500);
  
  // 메뉴 생성
  setTimeout(() => {
    for (const menu of menus) {
      if (menu.type === 'board') {
        // 게시판 메뉴인 경우 board_id 찾기
        db.get('SELECT id FROM boards WHERE slug = ?', [menu.url.replace('/board/', '')], (err, board) => {
          if (board) {
            db.run(
              'INSERT OR IGNORE INTO menus (name, url, type, board_id, sort_order) VALUES (?, ?, ?, ?, ?)',
              [menu.name, menu.url, menu.type, board.id, menu.sort_order],
              (err) => {
                if (err) console.error('Error creating menu:', err);
                else console.log(`Menu created: ${menu.name}`);
              }
            );
          }
        });
      } else {
        // 페이지 메뉴인 경우 page_id 찾기
        db.get('SELECT id FROM pages WHERE slug = ?', [menu.url.replace('/page/', '')], (err, page) => {
          if (page) {
            db.run(
              'INSERT OR IGNORE INTO menus (name, url, type, page_id, sort_order) VALUES (?, ?, ?, ?, ?)',
              [menu.name, menu.url, menu.type, page.id, menu.sort_order],
              (err) => {
                if (err) console.error('Error creating menu:', err);
                else console.log(`Menu created: ${menu.name}`);
              }
            );
          }
        });
      }
    }
  }, 1000);
  
  setTimeout(() => {
    console.log('Setup complete!');
    db.close();
  }, 2000);
}

setupData();