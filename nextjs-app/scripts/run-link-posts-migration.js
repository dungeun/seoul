#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 link_posts 테이블 생성 중...\n');
  
  const client = await pool.connect();
  
  try {
    // SQL 파일 읽기
    const sqlPath = path.join(__dirname, 'create-link-posts-table.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    // SQL 실행
    await client.query(sql);
    
    console.log('✅ link_posts 테이블 생성 완료!');
    
    // 테이블 확인
    const check = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'link_posts'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 link_posts 테이블 구조:');
    check.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);