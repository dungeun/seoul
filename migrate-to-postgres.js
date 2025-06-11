import Database from 'better-sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// SQLite connection
const sqliteDb = new Database(path.join(__dirname, 'server/database.db'));

async function migrateData() {
  console.log('Starting data migration from SQLite to PostgreSQL...');

  try {
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    client.release();

    // Read and execute schema
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'postgres-schema.sql'), 'utf8');
    await pool.query(schemaSQL);
    console.log('PostgreSQL schema created successfully');

    // Migrate users
    console.log('Migrating users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const user of users) {
      await pool.query(
        'INSERT INTO users (id, username, password, email, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET username = $2, password = $3, email = $4',
        [user.id, user.username, user.password, user.email, user.created_at]
      );
    }
    console.log(`Migrated ${users.length} users`);

    // Migrate boards
    console.log('Migrating boards...');
    const boards = sqliteDb.prepare('SELECT * FROM boards').all();
    for (const board of boards) {
      await pool.query(
        'INSERT INTO boards (id, name, slug, description, type, created_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4, type = $5',
        [board.id, board.name, board.slug, board.description, board.type, board.created_at]
      );
    }
    console.log(`Migrated ${boards.length} boards`);

    // Migrate posts
    console.log('Migrating posts...');
    const posts = sqliteDb.prepare('SELECT * FROM posts').all();
    for (const post of posts) {
      await pool.query(
        'INSERT INTO posts (id, title, content, board_slug, slug, image_url, attachment_url, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET title = $2, content = $3, board_slug = $4, slug = $5, image_url = $6, attachment_url = $7',
        [post.id, post.title, post.content, post.board_slug, post.slug, post.image_url, post.attachment_url, post.created_at]
      );
    }
    console.log(`Migrated ${posts.length} posts`);

    // Migrate energy_data
    console.log('Migrating energy data...');
    const energyData = sqliteDb.prepare('SELECT * FROM energy_data').all();
    for (const data of energyData) {
      await pool.query(
        'INSERT INTO energy_data (id, building_name, year, month, electricity, gas, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET building_name = $2, year = $3, month = $4, electricity = $5, gas = $6',
        [data.id, data.building_name, data.year, data.month, data.electricity, data.gas, data.created_at]
      );
    }
    console.log(`Migrated ${energyData.length} energy data records`);

    // Migrate solar_data
    console.log('Migrating solar data...');
    const solarData = sqliteDb.prepare('SELECT * FROM solar_data').all();
    for (const data of solarData) {
      const location = data.location || data.building_name || 'Unknown Location';
      await pool.query(
        'INSERT INTO solar_data (id, location, year, month, generation, efficiency, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO UPDATE SET location = $2, year = $3, month = $4, generation = $5, efficiency = $6',
        [data.id, location, data.year, data.month, data.generation, data.efficiency, data.created_at]
      );
    }
    console.log(`Migrated ${solarData.length} solar data records`);

    // Migrate menus if exists
    try {
      const menus = sqliteDb.prepare('SELECT * FROM menus').all();
      console.log('Migrating menus...');
      for (const menu of menus) {
        await pool.query(
          'INSERT INTO menus (id, name, slug, url, parent_id, order_index, menu_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, url = $4, parent_id = $5, order_index = $6, menu_type = $7',
          [menu.id, menu.name, menu.slug, menu.url, menu.parent_id, menu.order_index, menu.menu_type, menu.created_at]
        );
      }
      console.log(`Migrated ${menus.length} menus`);
    } catch (error) {
      console.log('No menus table found, skipping...');
    }

    // Migrate pages if exists
    try {
      const pages = sqliteDb.prepare('SELECT * FROM pages').all();
      console.log('Migrating pages...');
      for (const page of pages) {
        await pool.query(
          'INSERT INTO pages (id, title, slug, content, created_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET title = $2, slug = $3, content = $4',
          [page.id, page.title, page.slug, page.content, page.created_at]
        );
      }
      console.log(`Migrated ${pages.length} pages`);
    } catch (error) {
      console.log('No pages table found, skipping...');
    }

    // Migrate hero_slides if exists
    try {
      const heroSlides = sqliteDb.prepare('SELECT * FROM hero_slides').all();
      console.log('Migrating hero slides...');
      for (const slide of heroSlides) {
        await pool.query(
          'INSERT INTO hero_slides (id, title, subtitle, background_image, link_url, order_index, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO UPDATE SET title = $2, subtitle = $3, background_image = $4, link_url = $5, order_index = $6, is_active = $7',
          [slide.id, slide.title, slide.subtitle, slide.background_image, slide.link_url, slide.order_index, slide.is_active, slide.created_at]
        );
      }
      console.log(`Migrated ${heroSlides.length} hero slides`);
    } catch (error) {
      console.log('No hero_slides table found, skipping...');
    }

    console.log('Data migration completed successfully!');

  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pool.end();
  }
}

// Run migration
migrateData();