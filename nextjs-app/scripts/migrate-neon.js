#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Neon DB 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 Neon DB 마이그레이션 시작...');
  
  try {
    // 마이그레이션 파일들
    const migrations = [
      'db-fix-missing-schema.sql',
      'db-migration-collection-logs.sql'
    ];

    for (const migration of migrations) {
      console.log(`\n📋 ${migration} 실행 중...`);
      
      const sqlPath = path.join(__dirname, migration);
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
          // 이미 존재하는 객체 오류는 무시
          if (!error.message.includes('already exists')) {
            throw error;
          }
        }
      }
      
      console.log(`✅ ${migration} 완료!`);
    }

    // 현재 스키마 상태 확인
    console.log('\n📊 현재 테이블 목록:');
    const tables = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    tables.rows.forEach(row => {
      console.log(`  - ${row.tablename}`);
    });

    // energy_data 테이블 컬럼 확인
    console.log('\n📊 energy_data 테이블 컬럼:');
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'energy_data' 
      ORDER BY ordinal_position;
    `);
    
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

    console.log('\n✅ 모든 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 실행
runMigration();