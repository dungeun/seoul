import { readFileSync } from 'fs';
import { join } from 'path';
import { getDatabase } from '../lib/database.js';

async function runMigration() {
  console.log('🚀 Running researcher screenshots table migration...');
  
  try {
    const pool = getDatabase();
    
    // SQL 파일 읽기
    const sqlPath = join(process.cwd(), 'scripts', 'create-researcher-screenshots-table.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // 마이그레이션 실행
    await pool.query(sql);
    
    console.log('✅ Researcher screenshots table created successfully!');
    
    // 테이블 확인
    const checkResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'researcher_screenshots'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table structure:');
    checkResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    // 연결 종료
    await pool.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();