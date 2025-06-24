-- 탄소중립 기술 연구진 스크린샷 관리 테이블
CREATE TABLE IF NOT EXISTS researcher_screenshots (
    id SERIAL PRIMARY KEY,
    researcher_name VARCHAR(200) NOT NULL,
    screenshot_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500),
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_researcher_screenshots_updated_at BEFORE UPDATE
    ON researcher_screenshots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_researcher_screenshots_active ON researcher_screenshots(is_active);
CREATE INDEX idx_researcher_screenshots_order ON researcher_screenshots(order_index);

-- 초기 데이터 (예시)
-- INSERT INTO researcher_screenshots (researcher_name, screenshot_url, original_url, description, order_index) VALUES
-- ('김철수 교수', '/uploads/screenshots/researcher1.jpg', 'https://example.com/researcher1', '서울대학교 환경공학과', 1),
-- ('이영희 박사', '/uploads/screenshots/researcher2.jpg', 'https://example.com/researcher2', 'KAIST 에너지과학과', 2);