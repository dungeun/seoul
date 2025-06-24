#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 Buildings 테이블 수정 및 마이그레이션 완료...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. buildings 테이블의 dong 컬럼을 nullable로 변경
    console.log('📋 buildings 테이블 구조 수정...');
    await client.query(`
      ALTER TABLE buildings 
      ALTER COLUMN dong DROP NOT NULL
    `);
    console.log('  ✅ dong 컬럼 NOT NULL 제약 제거');
    
    // 2. buildings 테이블에 데이터 추가
    console.log('\n📋 buildings 테이블에 건물 추가...');
    const result = await client.query(`
      INSERT INTO buildings (name, dong)
      SELECT DISTINCT building_name, building_name
      FROM energy_data 
      WHERE building_name IS NOT NULL
        AND building_name NOT IN (SELECT name FROM buildings)
      ON CONFLICT (name) DO NOTHING
      RETURNING name
    `);
    console.log(`  ✅ ${result.rowCount}개 건물 추가됨`);
    
    // 3. building_id 컬럼 추가 및 업데이트
    console.log('\n📋 energy_data에 building_id 연결...');
    
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
    
    // 4. solar_data에도 building_id 추가
    console.log('\n📋 solar_data에 building_id 연결...');
    
    await client.query(`
      ALTER TABLE solar_data 
      ADD COLUMN IF NOT EXISTS building_id INTEGER REFERENCES buildings(id)
    `);
    
    const solarResult = await client.query(`
      UPDATE solar_data sd
      SET building_id = b.id
      FROM buildings b
      WHERE sd.building_name = b.name
        AND sd.building_id IS NULL
    `);
    console.log(`  ✅ ${solarResult.rowCount}개 태양광 레코드 업데이트됨`);
    
    await client.query('COMMIT');
    console.log('\n✅ 모든 마이그레이션 완료!');
    
    // 최종 확인
    console.log('\n📊 최종 데이터 확인:');
    
    const tables = [
      'energy_collection_logs',
      'buildings',
      'energy_data',
      'solar_data'
    ];
    
    for (const table of tables) {
      const count = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`  - ${table}: ${count.rows[0].count}개`);
    }
    
    // building_id가 연결된 데이터 확인
    const connectedEnergy = await client.query(`
      SELECT COUNT(*) as count 
      FROM energy_data 
      WHERE building_id IS NOT NULL
    `);
    console.log(`\n✅ energy_data 중 building_id 연결됨: ${connectedEnergy.rows[0].count}개`);
    
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