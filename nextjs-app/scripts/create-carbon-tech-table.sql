-- Create carbon_tech_posts table
CREATE TABLE IF NOT EXISTS carbon_tech_posts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  screenshot_url TEXT,
  main_category VARCHAR(255) NOT NULL,
  sub_category VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'published',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_carbon_tech_main_category ON carbon_tech_posts(main_category);
CREATE INDEX idx_carbon_tech_sub_category ON carbon_tech_posts(sub_category);
CREATE INDEX idx_carbon_tech_status ON carbon_tech_posts(status);
CREATE INDEX idx_carbon_tech_order ON carbon_tech_posts(order_index);

-- Add unique constraint for URL to prevent duplicates
ALTER TABLE carbon_tech_posts ADD CONSTRAINT unique_carbon_tech_url UNIQUE (url);