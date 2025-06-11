-- PostgreSQL Schema for Seoul National University Green Campus Portal

-- Session table for express-session
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK(type IN ('post', 'file', 'both')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    slug VARCHAR(255)
);

-- Pages table
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards table
CREATE TABLE boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) DEFAULT 'list'
);

-- Posts table
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    category_id INTEGER REFERENCES categories(id),
    board_id INTEGER REFERENCES boards(id),
    board_slug VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    featured_image VARCHAR(500),
    image_url VARCHAR(500),
    attachment_url VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    slug VARCHAR(255),
    excerpt TEXT,
    status VARCHAR(50) DEFAULT 'published',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attachment_filename VARCHAR(255),
    attachment_filepath VARCHAR(500),
    attachment_filesize INTEGER,
    meta_description TEXT
);

-- Files table
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    filename VARCHAR(255),
    filepath VARCHAR(500),
    filesize INTEGER,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Images table
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255),
    filepath VARCHAR(500),
    post_id INTEGER REFERENCES posts(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buildings table
CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    dong VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    usage VARCHAR(255),
    institute VARCHAR(255),
    area DECIMAL(8,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Energy data table
CREATE TABLE energy_data (
    id SERIAL PRIMARY KEY,
    building_name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    electricity DECIMAL(10,2),
    gas DECIMAL(10,2),
    water DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(building_name, year, month)
);

-- Solar data table
CREATE TABLE solar_data (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    building_name VARCHAR(255),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    generation DECIMAL(10,2),
    efficiency DECIMAL(5,2),
    capacity DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location, year, month)
);

-- Hero slides table
CREATE TABLE hero_slides (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    button_text VARCHAR(100),
    link_url VARCHAR(500),
    background_image VARCHAR(500),
    background_color VARCHAR(50),
    text_color VARCHAR(50) DEFAULT 'white',
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Greenhouse data table
CREATE TABLE greenhouse_data (
    id SERIAL PRIMARY KEY,
    building_name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    scope1_emission REAL DEFAULT 0,
    scope2_emission REAL DEFAULT 0,
    total_emission REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menus table
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('page', 'board', 'link')),
    menu_type VARCHAR(50) DEFAULT 'main',
    page_id INTEGER REFERENCES pages(id) ON DELETE SET NULL,
    board_id INTEGER REFERENCES boards(id) ON DELETE SET NULL,
    parent_id INTEGER DEFAULT NULL,
    order_index INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- History table
CREATE TABLE history (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NULL,
    day INTEGER NULL,
    date_text VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link posts table
CREATE TABLE link_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    link_url VARCHAR(1000) NOT NULL,
    image_url VARCHAR(500),
    main_category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('published', 'draft')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_menus_sort_order ON menus(sort_order);
CREATE INDEX idx_menus_is_active ON menus(is_active);
CREATE INDEX idx_history_year ON history(year);
CREATE INDEX idx_history_sort ON history(year, sort_order);
CREATE INDEX idx_posts_view_count ON posts(view_count DESC);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_board_id ON posts(board_id);
CREATE INDEX idx_energy_data_year_month ON energy_data(year, month);
CREATE INDEX idx_solar_data_year_month ON solar_data(year, month);
CREATE INDEX idx_greenhouse_data_year_month ON greenhouse_data(year, month);