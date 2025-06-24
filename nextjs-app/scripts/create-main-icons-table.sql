-- 메인 페이지 아이콘 관리 테이블
CREATE TABLE IF NOT EXISTS main_page_icons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon_image VARCHAR(500) NOT NULL,
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

CREATE TRIGGER update_main_page_icons_updated_at BEFORE UPDATE
    ON main_page_icons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 초기 데이터 삽입
INSERT INTO main_page_icons (title, url, icon_image, order_index) VALUES
('온실가스 배출량', '/greenhouse-gas', '/img/icons/greenhouse-gas.png', 1),
('온실가스 감축활동', '/greenhouse-reduction', '/img/icons/greenhouse-reduction.png', 2),
('온실가스 맵', '/greenhouse-map', '/img/icons/greenhouse-map.png', 3),
('에너지', '/energy', '/img/icons/energy.png', 4),
('태양광 발전', '/solar-power', '/img/icons/solar-power.png', 5),
('전력사용량', '/electricity-usage', '/img/icons/electricity-usage.png', 6),
('친환경 학생 활동', '/eco-student', '/img/icons/eco-student.png', 7),
('그린리더십', '/green-leadership', '/img/icons/green-leadership.png', 8),
('그린레포트', '/green-report', '/img/icons/green-report.png', 9),
('인포그래픽', '/infographic', '/img/icons/infographic.png', 10),
('자료실', '/archive', '/img/icons/archive.png', 11),
('지속가능성 보고서', '/sustainability-report', '/img/icons/sustainability-report.png', 12);