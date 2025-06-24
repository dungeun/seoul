-- 게시판 배너 관리 테이블
CREATE TABLE IF NOT EXISTS board_banners (
    id SERIAL PRIMARY KEY,
    board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200),
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_board_banners_updated_at BEFORE UPDATE
    ON board_banners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성
CREATE INDEX idx_board_banners_board_id ON board_banners(board_id);
CREATE INDEX idx_board_banners_order ON board_banners(board_id, order_index);