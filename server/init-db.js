import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const db = new sqlite3.Database('./database.db');

const initDatabase = async () => {
  console.log('Initializing database...');
  
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('post', 'file', 'both')),
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS menus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        type TEXT CHECK(type IN ('page', 'board')),
        page_id INTEGER,
        board_id INTEGER,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id),
        FOREIGN KEY (board_id) REFERENCES boards(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        category_id INTEGER,
        board_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id),
        FOREIGN KEY (board_id) REFERENCES boards(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        filename TEXT,
        filepath TEXT,
        filesize INTEGER,
        category_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT,
        filepath TEXT,
        post_id INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id)
      )
    `);
    
    // admin 사용자 생성을 동기적으로 처리
    setTimeout(async () => {
      db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
        if (!err && row && row.count === 0) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          db.run(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            ['admin', hashedPassword],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err);
              } else {
                console.log('Default admin user created (username: admin, password: admin123)');
              }
            }
          );
        } else {
          console.log('Admin user already exists');
        }
      });
    }, 500);
    
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (!err && row && row.count === 0) {
        const defaultCategories = [
          { name: '공지사항', type: 'post', sort_order: 1 },
          { name: '일반', type: 'post', sort_order: 2 },
          { name: '자료', type: 'file', sort_order: 3 },
          { name: '기타', type: 'both', sort_order: 4 }
        ];
        
        defaultCategories.forEach(cat => {
          db.run(
            'INSERT INTO categories (name, type, sort_order) VALUES (?, ?, ?)',
            [cat.name, cat.type, cat.sort_order]
          );
        });
        
        console.log('Default categories created');
      }
    });
    
    // Create default pages first
    db.get('SELECT COUNT(*) as count FROM pages', (err, row) => {
      if (!err && row && row.count === 0) {
        db.run(
          'INSERT INTO pages (title, slug, content) VALUES (?, ?, ?)',
          ['소개', 'about', '<h1>서울대학교 탄소중립포털 소개</h1><p>환영합니다!</p>'],
          (err) => {
            if (!err) {
              console.log('Default page created');
            }
          }
        );
      }
    });
    
    // Then create menus
    setTimeout(() => {
      db.get('SELECT COUNT(*) as count FROM menus', (err, row) => {
        if (!err && row && row.count === 0) {
          db.get('SELECT id FROM pages WHERE slug = ?', ['about'], (err, page) => {
            db.get('SELECT id FROM boards WHERE slug = ?', ['notice'], (err, board) => {
              const defaultMenus = [
                { name: '소개', url: '/page/about', type: 'page', page_id: page?.id, board_id: null, sort_order: 1 },
                { name: '공지사항', url: '/board/notice', type: 'board', page_id: null, board_id: board?.id, sort_order: 2 }
              ];
              
              defaultMenus.forEach(menu => {
                db.run(
                  'INSERT INTO menus (name, url, type, page_id, board_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                  [menu.name, menu.url, menu.type, menu.page_id, menu.board_id, menu.sort_order]
                );
              });
              
              console.log('Default menus created');
            });
          });
        }
      });
    }, 1000);
    
    db.get('SELECT COUNT(*) as count FROM boards', (err, row) => {
      if (!err && row && row.count === 0) {
        const defaultBoards = [
          { name: '공지사항', slug: 'notice', description: '중요 공지사항을 게시합니다' },
          { name: '일반 게시판', slug: 'general', description: '일반 게시글을 작성합니다' }
        ];
        
        defaultBoards.forEach(board => {
          db.run(
            'INSERT INTO boards (name, slug, description) VALUES (?, ?, ?)',
            [board.name, board.slug, board.description]
          );
        });
        
        console.log('Default boards created');
      }
    });
  });
  
  console.log('Database initialized successfully');
};

initDatabase().then(() => {
  db.close();
});