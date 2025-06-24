#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 최종 마이그레이션 실행 중...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. energy_collection_logs 테이블 생성
    console.log('📋 energy_collection_logs 테이블 생성...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS energy_collection_logs (
        id SERIAL PRIMARY KEY,
        collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) NOT NULL,
        data_count INTEGER DEFAULT 0,
        error_message TEXT,
        details JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ 테이블 생성 완료');
    
    // 2. 인덱스 생성
    console.log('\n📋 인덱스 생성...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collection_logs_collected_at 
      ON energy_collection_logs(collected_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collection_logs_status 
      ON energy_collection_logs(status)
    `);
    console.log('  ✅ 인덱스 생성 완료');
    
    // 3. updated_at 컬럼 추가
    console.log('\n📋 updated_at 컬럼 추가...');
    await client.query(`
      ALTER TABLE energy_data 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    console.log('  ✅ 컬럼 추가 완료');
    
    // 4. 트리거 함수 생성
    console.log('\n📋 트리거 함수 생성...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    console.log('  ✅ 함수 생성 완료');
    
    // 5. 트리거 생성
    console.log('\n📋 트리거 생성...');
    await client.query(`DROP TRIGGER IF EXISTS update_energy_data_updated_at ON energy_data`);
    await client.query(`
      CREATE TRIGGER update_energy_data_updated_at 
      BEFORE UPDATE ON energy_data 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `);
    console.log('  ✅ 트리거 생성 완료');
    
    // 6. buildings 테이블에 데이터 추가
    console.log('\n📋 buildings 테이블 업데이트...');
    const result = await client.query(`
      INSERT INTO buildings (name)
      SELECT DISTINCT building_name 
      FROM energy_data 
      WHERE building_name IS NOT NULL
        AND building_name NOT IN (SELECT name FROM buildings)
      ON CONFLICT DO NOTHING
      RETURNING name
    `);
    console.log(`  ✅ ${result.rowCount}개 건물 추가됨`);
    
    // 7. building_id 업데이트
    console.log('\n📋 building_id 연결...');
    
    // building_id 컬럼 추가 (없는 경우)
    await client.query(`
      ALTER TABLE energy_data 
      ADD COLUMN IF NOT EXISTS building_id INTEGER REFERENCES buildings(id)
    `);
    
    const updateResult = await client.query(`
      UPDATE energy_data ed
      SET building_id = b.id
      FROM buildings b
      WHERE ed.building_name = b.name
        AND ed.building_id IS NULL
    `);
    console.log(`  ✅ ${updateResult.rowCount}개 레코드 업데이트됨`);
    
    await client.query('COMMIT');
    console.log('\n✅ 모든 마이그레이션 완료!');
    
    // 최종 확인
    const check = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_name = 'energy_collection_logs'
    `);
    
    if (check.rows[0].count > 0) {
      console.log('✅ energy_collection_logs 테이블 확인됨');
    }
    
    const buildingCount = await client.query(`SELECT COUNT(*) as count FROM buildings`);
    console.log(`✅ buildings 테이블: ${buildingCount.rows[0].count}개 건물`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 마이그레이션 실패:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);