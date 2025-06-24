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
  console.log('🚀 Collection logs 테이블 추가 중...');
  
  try {
    const sqlPath = path.join(__dirname, 'add-collection-logs-only.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    // SQL 문을 세미콜론으로 분리하여 개별 실행
    const statements = sql
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';');
    
    for (let i = 0; i < statements.length; i++) {
      try {
        await pool.query(statements[i]);
        console.log(`  ✅ Statement ${i + 1}/${statements.length} 완료`);
      } catch (error) {
        console.error(`  ❌ Statement ${i + 1} 실패:`, error.message);
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Collection logs 테이블 추가 완료!');
    
    // 확인
    const check = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'energy_collection_logs'
    `);
    
    if (check.rows[0].count > 0) {
      console.log('✅ energy_collection_logs 테이블이 성공적으로 생성되었습니다!');
    }
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
  } finally {
    await pool.end();
  }
}

runMigration();