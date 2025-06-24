-- link_posts 테이블 생성
CREATE TABLE IF NOT EXISTS link_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  link_url VARCHAR(500) NOT NULL,
  image_url VARCHAR(500),
  main_category VARCHAR(100) NOT NULL,
  sub_category VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'published',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_link_posts_category ON link_posts(main_category, sub_category);
CREATE INDEX IF NOT EXISTS idx_link_posts_status ON link_posts(status);
CREATE INDEX IF NOT EXISTS idx_link_posts_order ON link_posts(order_index);
CREATE UNIQUE INDEX IF NOT EXISTS idx_link_posts_url ON link_posts(link_url);

-- updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_link_posts_updated_at ON link_posts;
CREATE TRIGGER update_link_posts_updated_at 
BEFORE UPDATE ON link_posts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();