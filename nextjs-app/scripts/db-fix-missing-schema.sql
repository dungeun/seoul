-- 누락된 테이블 및 컬럼 추가 스크립트

-- 1. buildings 테이블 생성
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(50),
  type VARCHAR(50),
  area DECIMAL(10, 2),
  floors INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. categories 테이블 생성
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  board_id INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. files 테이블 생성
CREATE TABLE IF NOT EXISTS files (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  filepath VARCHAR(500) NOT NULL,
  filesize INTEGER,
  mimetype VARCHAR(100),
  uploaded_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. energy_data 테이블 수정 (컬럼명 통일 및 누락 컬럼 추가)
-- 기존 컬럼명 변경
ALTER TABLE energy_data 
RENAME COLUMN electricity_kwh TO electricity;

ALTER TABLE energy_data 
RENAME COLUMN gas_m3 TO gas;

-- water 컬럼 추가
ALTER TABLE energy_data 
ADD COLUMN IF NOT EXISTS water DECIMAL(10, 2) DEFAULT 0;

-- building_id 추가 (향후 정규화용)
ALTER TABLE energy_data 
ADD COLUMN IF NOT EXISTS building_id INTEGER REFERENCES buildings(id);

-- 5. posts 테이블 누락 컬럼 추가
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS attachment_filename VARCHAR(255);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS attachment_filepath VARCHAR(500);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS attachment_filesize INTEGER;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);

-- 6. boards 테이블 누락 컬럼 추가
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 7. menus 테이블 누락 컬럼 추가
ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS target VARCHAR(20) DEFAULT '_self';

ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

ALTER TABLE menus 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 8. solar_data 테이블 수정
ALTER TABLE solar_data 
ADD COLUMN IF NOT EXISTS building_id INTEGER REFERENCES buildings(id);

-- 9. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_energy_data_building ON energy_data(building_name);
CREATE INDEX IF NOT EXISTS idx_energy_data_date ON energy_data(year, month);
CREATE INDEX IF NOT EXISTS idx_solar_data_building ON solar_data(building_name);
CREATE INDEX IF NOT EXISTS idx_solar_data_date ON solar_data(year, month);

-- 10. updated_at 자동 업데이트 트리거 추가
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- posts 테이블 트리거
CREATE OR REPLACE TRIGGER update_posts_updated_at 
BEFORE UPDATE ON posts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- boards 테이블 트리거
CREATE OR REPLACE TRIGGER update_boards_updated_at 
BEFORE UPDATE ON boards 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- menus 테이블 트리거
CREATE OR REPLACE TRIGGER update_menus_updated_at 
BEFORE UPDATE ON menus 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 11. 기존 건물 데이터를 buildings 테이블로 마이그레이션
INSERT INTO buildings (name)
SELECT DISTINCT building_name 
FROM energy_data 
WHERE building_name IS NOT NULL
ON CONFLICT (name) DO NOTHING;

-- 12. building_id 업데이트
UPDATE energy_data ed
SET building_id = b.id
FROM buildings b
WHERE ed.building_name = b.name;

UPDATE solar_data sd
SET building_id = b.id
FROM buildings b
WHERE sd.building_name = b.name;