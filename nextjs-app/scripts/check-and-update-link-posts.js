#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkAndUpdate() {
  console.log('🔍 link_posts 테이블 확인 및 업데이트...\n');
  
  const client = await pool.connect();
  
  try {
    // 테이블 존재 확인
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'link_posts'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      // 테이블 생성
      console.log('📋 link_posts 테이블 생성 중...');
      await client.query(`
        CREATE TABLE link_posts (
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
        )
      `);
      console.log('✅ 테이블 생성 완료');
    } else {
      console.log('✅ link_posts 테이블이 이미 존재합니다');
      
      // order_index 컬럼 추가 (없는 경우)
      try {
        await client.query(`
          ALTER TABLE link_posts 
          ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0
        `);
        console.log('✅ order_index 컬럼 확인/추가 완료');
      } catch (err) {
        console.log('ℹ️  order_index 컬럼 이미 존재');
      }
    }
    
    // 인덱스 생성
    console.log('\n📋 인덱스 생성 중...');
    const indexes = [
      { name: 'idx_link_posts_category', columns: '(main_category, sub_category)' },
      { name: 'idx_link_posts_status', columns: '(status)' },
      { name: 'idx_link_posts_order', columns: '(order_index)' }
    ];
    
    for (const idx of indexes) {
      try {
        await client.query(`CREATE INDEX IF NOT EXISTS ${idx.name} ON link_posts ${idx.columns}`);
        console.log(`  ✅ ${idx.name} 생성됨`);
      } catch (err) {
        console.log(`  ℹ️  ${idx.name} 이미 존재`);
      }
    }
    
    // URL 유니크 인덱스
    try {
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_link_posts_url ON link_posts(link_url)`);
      console.log('  ✅ idx_link_posts_url (UNIQUE) 생성됨');
    } catch (err) {
      console.log('  ℹ️  idx_link_posts_url 이미 존재');
    }
    
    // 현재 구조 확인
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'link_posts'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 link_posts 테이블 최종 구조:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });
    
    // 데이터 수 확인
    const count = await client.query('SELECT COUNT(*) FROM link_posts');
    console.log(`\n📈 현재 데이터: ${count.rows[0].count}개`);
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndUpdate().catch(console.error);