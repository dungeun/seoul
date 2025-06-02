-- 임시 테이블 생성
CREATE TABLE menus_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT CHECK(type IN ('page', 'board', 'link')),
    page_id INTEGER,
    board_id INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    content TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (page_id) REFERENCES pages(id),
    FOREIGN KEY (board_id) REFERENCES boards(id)
);

-- 기존 데이터 복사
INSERT INTO menus_new SELECT * FROM menus;

-- 기존 테이블 삭제
DROP TABLE menus;

-- 새 테이블 이름 변경
ALTER TABLE menus_new RENAME TO menus;