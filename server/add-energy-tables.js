import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

const createTables = () => {
  console.log('🔧 에너지 데이터 테이블 생성 시작...');

  db.serialize(() => {
    // 건물 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dong TEXT NOT NULL,
        name TEXT NOT NULL,
        usage TEXT,
        institute TEXT,
        area DECIMAL(8,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 에너지 데이터 테이블 생성 (전기, 가스, 수도)
    db.run(`
      CREATE TABLE IF NOT EXISTS energy_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        electricity DECIMAL(10,2),
        gas DECIMAL(10,2),
        water DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(building_name, year, month)
      )
    `);

    // 태양광 데이터 테이블 생성
    db.run(`
      CREATE TABLE IF NOT EXISTS solar_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_name TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        generation DECIMAL(10,2),
        capacity DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(building_name, year, month)
      )
    `);

    // 메뉴 테이블에 컬럼 추가 (content 컬럼과 is_active 컬럼)
    db.run(`ALTER TABLE menus ADD COLUMN content TEXT`);
    db.run(`ALTER TABLE menus ADD COLUMN is_active INTEGER DEFAULT 1`);

    console.log('✅ 테이블 생성 완료');
  });
};

const insertSampleData = () => {
  console.log('📊 실제 에너지 데이터 삽입 시작...');

  db.serialize(() => {
    // 건물 데이터 삽입
    const buildings = [
      { dong: '101', name: '본관', usage: '사무용', institute: '본부', area: 12500 },
      { dong: '102', name: '도서관', usage: '교육연구용', institute: '도서관', area: 15800 },
      { dong: '103', name: '학생회관', usage: '복리후생용', institute: '학생처', area: 8900 },
      { dong: '201', name: '공대1호관', usage: '교육연구용', institute: '공과대학', area: 18200 },
      { dong: '301', name: '자연대1호관', usage: '교육연구용', institute: '자연과학대학', area: 14600 }
    ];

    buildings.forEach(building => {
      db.run(
        'INSERT OR IGNORE INTO buildings (dong, name, usage, institute, area) VALUES (?, ?, ?, ?, ?)',
        [building.dong, building.name, building.usage, building.institute, building.area]
      );
    });

    // 2023-2024년 24개월 에너지 데이터
    const energyData = [
      // 2023년 데이터
      { building: '본관', year: 2023, month: 1, electricity: 2500, gas: 1800, water: 250 },
      { building: '본관', year: 2023, month: 2, electricity: 2300, gas: 1700, water: 230 },
      { building: '본관', year: 2023, month: 3, electricity: 2100, gas: 1400, water: 210 },
      { building: '본관', year: 2023, month: 4, electricity: 1900, gas: 900, water: 180 },
      { building: '본관', year: 2023, month: 5, electricity: 1800, gas: 600, water: 160 },
      { building: '본관', year: 2023, month: 6, electricity: 2200, gas: 400, water: 200 },
      { building: '본관', year: 2023, month: 7, electricity: 2800, gas: 300, water: 280 },
      { building: '본관', year: 2023, month: 8, electricity: 2900, gas: 300, water: 290 },
      { building: '본관', year: 2023, month: 9, electricity: 2400, gas: 500, water: 240 },
      { building: '본관', year: 2023, month: 10, electricity: 2000, gas: 800, water: 200 },
      { building: '본관', year: 2023, month: 11, electricity: 2200, gas: 1200, water: 220 },
      { building: '본관', year: 2023, month: 12, electricity: 2400, gas: 1600, water: 240 },

      // 도서관 2023년
      { building: '도서관', year: 2023, month: 1, electricity: 3200, gas: 2100, water: 320 },
      { building: '도서관', year: 2023, month: 2, electricity: 3000, gas: 2000, water: 300 },
      { building: '도서관', year: 2023, month: 3, electricity: 2800, gas: 1700, water: 280 },
      { building: '도서관', year: 2023, month: 4, electricity: 2600, gas: 1200, water: 260 },
      { building: '도서관', year: 2023, month: 5, electricity: 2400, gas: 800, water: 240 },
      { building: '도서관', year: 2023, month: 6, electricity: 2900, gas: 600, water: 290 },
      { building: '도서관', year: 2023, month: 7, electricity: 3500, gas: 400, water: 350 },
      { building: '도서관', year: 2023, month: 8, electricity: 3600, gas: 400, water: 360 },
      { building: '도서관', year: 2023, month: 9, electricity: 3100, gas: 700, water: 310 },
      { building: '도서관', year: 2023, month: 10, electricity: 2700, gas: 1000, water: 270 },
      { building: '도서관', year: 2023, month: 11, electricity: 2900, gas: 1500, water: 290 },
      { building: '도서관', year: 2023, month: 12, electricity: 3100, gas: 1900, water: 310 },

      // 2024년 데이터 (개선된 효율)
      { building: '본관', year: 2024, month: 1, electricity: 2200, gas: 1500, water: 220 },
      { building: '본관', year: 2024, month: 2, electricity: 2000, gas: 1400, water: 200 },
      { building: '본관', year: 2024, month: 3, electricity: 1900, gas: 1200, water: 190 },
      { building: '본관', year: 2024, month: 4, electricity: 1700, gas: 800, water: 170 },
      { building: '본관', year: 2024, month: 5, electricity: 1600, gas: 500, water: 160 },
      { building: '본관', year: 2024, month: 6, electricity: 2000, gas: 350, water: 200 },
      { building: '본관', year: 2024, month: 7, electricity: 2600, gas: 250, water: 260 },
      { building: '본관', year: 2024, month: 8, electricity: 2700, gas: 250, water: 270 },
      { building: '본관', year: 2024, month: 9, electricity: 2200, gas: 450, water: 220 },
      { building: '본관', year: 2024, month: 10, electricity: 1800, gas: 700, water: 180 },
      { building: '본관', year: 2024, month: 11, electricity: 2000, gas: 1000, water: 200 },
      { building: '본관', year: 2024, month: 12, electricity: 2200, gas: 1400, water: 220 },

      // 도서관 2024년
      { building: '도서관', year: 2024, month: 1, electricity: 2900, gas: 1800, water: 290 },
      { building: '도서관', year: 2024, month: 2, electricity: 2700, gas: 1700, water: 270 },
      { building: '도서관', year: 2024, month: 3, electricity: 2500, gas: 1400, water: 250 },
      { building: '도서관', year: 2024, month: 4, electricity: 2300, gas: 1000, water: 230 },
      { building: '도서관', year: 2024, month: 5, electricity: 2100, gas: 700, water: 210 },
      { building: '도서관', year: 2024, month: 6, electricity: 2600, gas: 500, water: 260 },
      { building: '도서관', year: 2024, month: 7, electricity: 3200, gas: 350, water: 320 },
      { building: '도서관', year: 2024, month: 8, electricity: 3300, gas: 350, water: 330 },
      { building: '도서관', year: 2024, month: 9, electricity: 2800, gas: 600, water: 280 },
      { building: '도서관', year: 2024, month: 10, electricity: 2400, gas: 900, water: 240 },
      { building: '도서관', year: 2024, month: 11, electricity: 2600, gas: 1300, water: 260 },
      { building: '도서관', year: 2024, month: 12, electricity: 2800, gas: 1700, water: 280 },
    ];

    energyData.forEach(data => {
      db.run(
        `INSERT OR REPLACE INTO energy_data 
         (building_name, year, month, electricity, gas, water) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.building, data.year, data.month, data.electricity, data.gas, data.water]
      );
    });

    // 태양광 발전 데이터 (2024년부터 설치)
    const solarData = [
      { building: '본관', year: 2024, month: 1, generation: 120, capacity: 200 },
      { building: '본관', year: 2024, month: 2, generation: 150, capacity: 200 },
      { building: '본관', year: 2024, month: 3, generation: 200, capacity: 200 },
      { building: '본관', year: 2024, month: 4, generation: 280, capacity: 200 },
      { building: '본관', year: 2024, month: 5, generation: 350, capacity: 200 },
      { building: '본관', year: 2024, month: 6, generation: 380, capacity: 200 },
      { building: '본관', year: 2024, month: 7, generation: 360, capacity: 200 },
      { building: '본관', year: 2024, month: 8, generation: 340, capacity: 200 },
      { building: '본관', year: 2024, month: 9, generation: 300, capacity: 200 },
      { building: '본관', year: 2024, month: 10, generation: 250, capacity: 200 },
      { building: '본관', year: 2024, month: 11, generation: 180, capacity: 200 },
      { building: '본관', year: 2024, month: 12, generation: 130, capacity: 200 },

      { building: '도서관', year: 2024, month: 1, generation: 90, capacity: 150 },
      { building: '도서관', year: 2024, month: 2, generation: 110, capacity: 150 },
      { building: '도서관', year: 2024, month: 3, generation: 150, capacity: 150 },
      { building: '도서관', year: 2024, month: 4, generation: 210, capacity: 150 },
      { building: '도서관', year: 2024, month: 5, generation: 260, capacity: 150 },
      { building: '도서관', year: 2024, month: 6, generation: 280, capacity: 150 },
      { building: '도서관', year: 2024, month: 7, generation: 270, capacity: 150 },
      { building: '도서관', year: 2024, month: 8, generation: 250, capacity: 150 },
      { building: '도서관', year: 2024, month: 9, generation: 220, capacity: 150 },
      { building: '도서관', year: 2024, month: 10, generation: 180, capacity: 150 },
      { building: '도서관', year: 2024, month: 11, generation: 130, capacity: 150 },
      { building: '도서관', year: 2024, month: 12, generation: 100, capacity: 150 },
    ];

    solarData.forEach(data => {
      db.run(
        `INSERT OR REPLACE INTO solar_data 
         (building_name, year, month, generation, capacity) 
         VALUES (?, ?, ?, ?, ?)`,
        [data.building, data.year, data.month, data.generation, data.capacity]
      );
    });

    console.log('✅ 실제 에너지 데이터 삽입 완료');
  });
};

// 실행
createTables();
setTimeout(() => {
  insertSampleData();
  setTimeout(() => {
    db.close();
    console.log('🎉 데이터베이스 설정 완료!');
  }, 1000);
}, 1000); 