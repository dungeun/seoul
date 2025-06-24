#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addCollectionLogsTable() {
  console.log('🚀 energy_collection_logs 테이블 추가...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. energy_collection_logs 테이블 생성
    console.log('📋 energy_collection_logs 테이블 생성');
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
    console.log('\n📋 인덱스 생성');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collection_logs_collected_at 
      ON energy_collection_logs(collected_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_collection_logs_status 
      ON energy_collection_logs(status)
    `);
    console.log('  ✅ 인덱스 생성 완료');
    
    await client.query('COMMIT');
    
    // 3. 확인
    const check = await client.query(`
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'energy_collection_logs') as column_count
      FROM information_schema.tables 
      WHERE table_name = 'energy_collection_logs'
    `);
    
    if (check.rows.length > 0) {
      console.log(`\n✅ energy_collection_logs 테이블 생성 확인!`);
      console.log(`  - 컬럼 수: ${check.rows[0].column_count}개`);
    }
    
    // 4. 전체 마이그레이션 상태 확인
    console.log('\n📊 전체 마이그레이션 상태:');
    
    const finalCheck = await client.query(`
      SELECT 
        'buildings' as table_name, 
        COUNT(*) as record_count,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'buildings') as column_count
      FROM buildings
      UNION ALL
      SELECT 
        'energy_data', 
        COUNT(*),
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'energy_data')
      FROM energy_data
      UNION ALL
      SELECT 
        'solar_data', 
        COUNT(*),
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'solar_data')
      FROM solar_data
      UNION ALL
      SELECT 
        'energy_collection_logs', 
        COUNT(*),
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'energy_collection_logs')
      FROM energy_collection_logs
      ORDER BY table_name
    `);
    
    console.log('테이블명 | 레코드 수 | 컬럼 수');
    console.log('-'.repeat(40));
    finalCheck.rows.forEach(row => {
      console.log(`${row.table_name.padEnd(25)} | ${row.record_count.toString().padEnd(10)} | ${row.column_count}`);
    });
    
    // 5. 관계 확인
    console.log('\n✅ 데이터 관계:');
    const relationCheck = await client.query(`
      SELECT 
        COUNT(DISTINCT e.building_id) as connected_buildings,
        COUNT(*) as total_energy_records
      FROM energy_data e
      WHERE e.building_id IS NOT NULL
    `);
    
    console.log(`  - ${relationCheck.rows[0].connected_buildings}개 건물이 에너지 데이터와 연결됨`);
    console.log(`  - 총 ${relationCheck.rows[0].total_energy_records}개 에너지 레코드가 building_id를 가짐`);
    
    console.log('\n🎉 모든 마이그레이션이 성공적으로 완료되었습니다!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCollectionLogsTable().catch(console.error);