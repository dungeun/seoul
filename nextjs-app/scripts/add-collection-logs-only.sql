-- energy_collection_logs 테이블만 추가
CREATE TABLE IF NOT EXISTS energy_collection_logs (
  id SERIAL PRIMARY KEY,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL,
  data_count INTEGER DEFAULT 0,
  error_message TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_collection_logs_collected_at ON energy_collection_logs(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_collection_logs_status ON energy_collection_logs(status);

-- energy_data 테이블에 updated_at 컬럼 추가 (없는 경우)
ALTER TABLE energy_data 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- updated_at 자동 업데이트 트리거 (이미 있으면 덮어쓰기)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- energy_data 테이블 트리거
DROP TRIGGER IF EXISTS update_energy_data_updated_at ON energy_data;
CREATE TRIGGER update_energy_data_updated_at 
BEFORE UPDATE ON energy_data 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- buildings 테이블에 데이터 추가 (없는 경우만)
INSERT INTO buildings (name)
SELECT DISTINCT building_name 
FROM energy_data 
WHERE building_name IS NOT NULL
  AND building_name NOT IN (SELECT name FROM buildings)
ON CONFLICT DO NOTHING;