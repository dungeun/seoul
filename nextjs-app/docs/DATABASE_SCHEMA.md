# 데이터베이스 스키마 문서

## 1. 데이터베이스 개요

### 1.1 기본 정보
- **데이터베이스**: PostgreSQL
- **호스팅**: Neon (https://neon.tech)
- **문자 인코딩**: UTF-8
- **타임존**: Asia/Seoul

### 1.2 명명 규칙
- 테이블명: 소문자, 복수형, 언더스코어 구분 (예: `energy_data`)
- 컬럼명: 소문자, 언더스코어 구분 (예: `measurement_date`)
- 인덱스명: `idx_테이블명_컬럼명` (예: `idx_energy_data_date`)
- 외래키명: `fk_테이블명_참조테이블명` (예: `fk_posts_users`)

## 2. 테이블 구조

### 2.1 사용자 관리

#### users (사용자)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

#### user_sessions (사용자 세션)
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
```

### 2.2 건물 및 시설

#### buildings (건물)
```sql
CREATE TABLE buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  area DECIMAL(10,2),
  floors INTEGER,
  construction_year INTEGER,
  has_solar BOOLEAN DEFAULT false,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buildings_code ON buildings(code);
CREATE INDEX idx_buildings_has_solar ON buildings(has_solar);
```

#### building_areas (건물 구역)
```sql
CREATE TABLE building_areas (
  id SERIAL PRIMARY KEY,
  building_id INTEGER NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  floor INTEGER,
  area DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_building_areas_building ON building_areas(building_id);
```

### 2.3 에너지 데이터

#### energy_data (전력 사용량)
```sql
CREATE TABLE energy_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  usage_amount DECIMAL(10,2) NOT NULL,
  cost INTEGER,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, measurement_date)
);

CREATE INDEX idx_energy_data_date ON energy_data(measurement_date);
CREATE INDEX idx_energy_data_building ON energy_data(building_id);
```

#### gas_data (가스 사용량)
```sql
CREATE TABLE gas_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  usage_amount DECIMAL(10,2) NOT NULL,
  cost INTEGER,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, measurement_date)
);

CREATE INDEX idx_gas_data_date ON gas_data(measurement_date);
CREATE INDEX idx_gas_data_building ON gas_data(building_id);
```

#### water_data (수도 사용량)
```sql
CREATE TABLE water_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  usage_amount DECIMAL(10,2) NOT NULL,
  cost INTEGER,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, measurement_date)
);

CREATE INDEX idx_water_data_date ON water_data(measurement_date);
CREATE INDEX idx_water_data_building ON water_data(building_id);
```

### 2.4 온실가스 데이터

#### ghg_data (온실가스 배출량)
```sql
CREATE TABLE ghg_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  scope1 DECIMAL(10,2) DEFAULT 0,
  scope2 DECIMAL(10,2) DEFAULT 0,
  total_emissions DECIMAL(10,2) NOT NULL,
  emissions_year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, emissions_year)
);

CREATE INDEX idx_ghg_data_year ON ghg_data(emissions_year);
CREATE INDEX idx_ghg_data_building ON ghg_data(building_id);
```

### 2.5 태양광 발전

#### solar_data (태양광 발전량)
```sql
CREATE TABLE solar_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  generation_amount DECIMAL(10,2) NOT NULL,
  measurement_datetime TIMESTAMP NOT NULL,
  weather VARCHAR(50),
  temperature DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_id, measurement_datetime)
);

CREATE INDEX idx_solar_data_datetime ON solar_data(measurement_datetime);
CREATE INDEX idx_solar_data_building ON solar_data(building_id);
```

### 2.6 콘텐츠 관리

#### boards (게시판)
```sql
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'list' CHECK (type IN ('list', 'gallery', 'gallery-02', 'gallery-03', 'archive', 'banner')),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_boards_slug ON boards(slug);
CREATE INDEX idx_boards_type ON boards(type);
```

#### categories (카테고리)
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

#### posts (게시물)
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  featured_image VARCHAR(500),
  thumbnail_url VARCHAR(500),
  board_id INTEGER REFERENCES boards(id),
  category_id INTEGER REFERENCES categories(id),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'draft')),
  view_count INTEGER DEFAULT 0,
  attachment_filename VARCHAR(255),
  attachment_filepath VARCHAR(500),
  attachment_filesize INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_board ON posts(board_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_slug ON posts(slug);
```

#### pages (페이지)
```sql
CREATE TABLE pages (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_published ON pages(is_published);
```

### 2.7 미디어 관리

#### media (미디어 파일)
```sql
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  mimetype VARCHAR(100),
  filesize INTEGER,
  width INTEGER,
  height INTEGER,
  alt_text VARCHAR(255),
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_filename ON media(filename);
CREATE INDEX idx_media_created ON media(created_at DESC);
```

### 2.8 메뉴 관리

#### menus (메뉴)
```sql
CREATE TABLE menus (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  url VARCHAR(255),
  parent_id INTEGER REFERENCES menus(id),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  open_in_new_tab BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menus_parent ON menus(parent_id);
CREATE INDEX idx_menus_active ON menus(is_active);
```

### 2.9 배너 관리

#### board_banners (게시판 배너)
```sql
CREATE TABLE board_banners (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  link_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_board_banners_board ON board_banners(board_id);
CREATE INDEX idx_board_banners_active ON board_banners(is_active);
```

### 2.10 연구자 네트워크

#### link_posts (링크 게시물)
```sql
CREATE TABLE link_posts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  department VARCHAR(200),
  research_field VARCHAR(200),
  url VARCHAR(500) NOT NULL,
  screenshot_url VARCHAR(500),
  main_category VARCHAR(100),
  sub_category VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(url)
);

CREATE INDEX idx_link_posts_main_category ON link_posts(main_category);
CREATE INDEX idx_link_posts_sub_category ON link_posts(sub_category);
CREATE INDEX idx_link_posts_status ON link_posts(status);
```

### 2.11 설정

#### settings (시스템 설정)
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
```

## 3. 뷰 (Views)

### 3.1 에너지 사용량 요약
```sql
CREATE VIEW v_energy_summary AS
SELECT 
  b.id as building_id,
  b.name as building_name,
  DATE_TRUNC('month', e.measurement_date) as month,
  SUM(e.usage_amount) as electricity_usage,
  SUM(e.cost) as electricity_cost,
  SUM(g.usage_amount) as gas_usage,
  SUM(g.cost) as gas_cost,
  SUM(w.usage_amount) as water_usage,
  SUM(w.cost) as water_cost
FROM buildings b
LEFT JOIN energy_data e ON b.id = e.building_id
LEFT JOIN gas_data g ON b.id = g.building_id AND g.measurement_date = e.measurement_date
LEFT JOIN water_data w ON b.id = w.building_id AND w.measurement_date = e.measurement_date
GROUP BY b.id, b.name, DATE_TRUNC('month', e.measurement_date);
```

### 3.2 온실가스 배출 추이
```sql
CREATE VIEW v_ghg_trend AS
SELECT 
  emissions_year,
  SUM(scope1) as total_scope1,
  SUM(scope2) as total_scope2,
  SUM(total_emissions) as total_emissions,
  COUNT(DISTINCT building_id) as building_count
FROM ghg_data
GROUP BY emissions_year
ORDER BY emissions_year;
```

## 4. 함수 및 트리거

### 4.1 updated_at 자동 업데이트
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기타 테이블에도 동일하게 적용
```

### 4.2 조회수 증가 함수
```sql
CREATE OR REPLACE FUNCTION increment_view_count(post_id INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE 'plpgsql';
```

## 5. 샘플 데이터

### 5.1 기본 사용자
```sql
INSERT INTO users (username, email, password_hash, name, role) VALUES
('admin', 'admin@snu.ac.kr', '$2b$10$...', '관리자', 'admin'),
('user1', 'user1@snu.ac.kr', '$2b$10$...', '일반사용자', 'user');
```

### 5.2 기본 건물
```sql
INSERT INTO buildings (name, code, area, floors, construction_year, has_solar) VALUES
('본관', 'MAIN', 15234.56, 5, 1946, false),
('공학관', 'ENG', 22345.67, 8, 1978, true),
('도서관', 'LIB', 18765.43, 6, 1975, true);
```

### 5.3 기본 게시판
```sql
INSERT INTO boards (name, slug, type, description) VALUES
('공지사항', 'notice', 'list', '중요 공지사항'),
('자료실', 'archive', 'archive', '각종 자료 다운로드'),
('인포그래픽', 'info', 'gallery-03', '탄소중립 인포그래픽'),
('갤러리', 'gallery', 'gallery', '사진 갤러리');
```

## 6. 백업 및 복구

### 6.1 백업 스크립트
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_${DATE}.sql
```

### 6.2 복구 스크립트
```bash
#!/bin/bash
psql $DATABASE_URL < backup_20240624_120000.sql
```

## 7. 성능 최적화

### 7.1 인덱스 사용 통계
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 7.2 느린 쿼리 확인
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
```

---

작성일: 2024년 6월 24일
버전: 1.0.0