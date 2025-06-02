-- 에너지 데이터 테이블
CREATE TABLE IF NOT EXISTS energy_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  electricity_usage REAL DEFAULT 0,
  gas_usage REAL DEFAULT 0,
  water_usage REAL DEFAULT 0,
  greenhouse_gas_emission REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_name, year, month)
);

-- 태양광 발전 데이터
CREATE TABLE IF NOT EXISTS solar_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_name TEXT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  generation REAL DEFAULT 0,
  capacity REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_name, year, month)
);

-- 온실가스 감축활동
CREATE TABLE IF NOT EXISTS reduction_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  reduction_amount REAL DEFAULT 0,
  activity_date DATE,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 건물 마스터 데이터
CREATE TABLE IF NOT EXISTS buildings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE,
  type TEXT,
  area REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 샘플 건물 데이터 삽입
INSERT OR IGNORE INTO buildings (name, code, type) VALUES 
  ('본관', '001', '행정'),
  ('공과대학', '039', '교육'),
  ('자연과학대학', '025', '교육'),
  ('중앙도서관', '062', '도서관'),
  ('학생회관', '063', '복지');