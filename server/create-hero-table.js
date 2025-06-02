import sqlite3 from 'sqlite3';

const sqlite = sqlite3.verbose();

// 데이터베이스 연결
const db = new sqlite.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

// hero_slides 테이블 생성
db.run(`
  CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    button_text TEXT,
    background_image TEXT,
    background_color TEXT,
    text_color TEXT DEFAULT 'white',
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('Error creating hero_slides table:', err);
  } else {
    console.log('hero_slides table created successfully');
    
    // 기본 슬라이드 데이터 삽입
    const defaultSlides = [
      {
        title: '서울대학교 탄소중립캠퍼스',
        subtitle: 'Carbon Neutral Campus Initiative',
        description: '2050 탄소중립을 향한 지속가능한 미래를 만들어갑니다',
        button_text: '자세히 보기',
        background_color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        text_color: 'white',
        order_index: 1
      },
      {
        title: '그린에너지 혁신',
        subtitle: 'Green Energy Innovation',
        description: '태양광, 풍력 등 재생에너지로 캠퍼스를 운영합니다',
        button_text: '에너지 현황',
        background_color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        text_color: 'white',
        order_index: 2
      },
      {
        title: '지속가능한 연구',
        subtitle: 'Sustainable Research',
        description: '환경 친화적 기술 개발과 연구로 미래를 선도합니다',
        button_text: '연구 네트워크',
        background_color: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
        text_color: 'white',
        order_index: 3
      },
      {
        title: '스마트 그린캠퍼스',
        subtitle: 'Smart Green Campus',
        description: 'AI와 IoT 기술로 효율적인 에너지 관리를 실현합니다',
        button_text: '데이터 플랫폼',
        background_color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        text_color: 'white',
        order_index: 4
      }
    ];
    
    // 기본 데이터가 있는지 확인
    db.get('SELECT COUNT(*) as count FROM hero_slides', (err, row) => {
      if (err) {
        console.error('Error checking existing data:', err);
        db.close();
        return;
      }
      
      if (row.count === 0) {
        console.log('Inserting default hero slides...');
        const insertStmt = db.prepare(`
          INSERT INTO hero_slides (title, subtitle, description, button_text, background_color, text_color, order_index)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        defaultSlides.forEach(slide => {
          insertStmt.run([
            slide.title,
            slide.subtitle,
            slide.description,
            slide.button_text,
            slide.background_color,
            slide.text_color,
            slide.order_index
          ]);
        });
        
        insertStmt.finalize(() => {
          console.log('Default hero slides inserted successfully');
          db.close();
        });
      } else {
        console.log('Hero slides already exist, skipping default data insertion');
        db.close();
      }
    });
  }
}); 