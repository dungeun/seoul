-- menus 테이블에 is_active와 content 컬럼 추가
ALTER TABLE menus ADD COLUMN is_active INTEGER DEFAULT 1;
ALTER TABLE menus ADD COLUMN content TEXT DEFAULT NULL;