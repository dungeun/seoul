#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 간단한 마이그레이션 실행...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. 현재 buildings 테이블에 있는 건물 확인
    const existingBuildings = await client.query(`
      SELECT name FROM buildings
    `);
    const existingNames = existingBuildings.rows.map(r => r.name);
    console.log(`📋 기존 buildings: ${existingNames.length}개`);
    
    // 2. energy_data에서 새로운 건물 찾기
    const newBuildings = await client.query(`
      SELECT DISTINCT building_name 
      FROM energy_data 
      WHERE building_name IS NOT NULL
        AND building_name NOT IN (SELECT name FROM buildings WHERE name IS NOT NULL)
      ORDER BY building_name
    `);
    
    console.log(`📋 추가할 새 건물: ${newBuildings.rows.length}개`);
    
    // 3. 각 건물을 개별적으로 추가
    let addedCount = 0;
    for (const building of newBuildings.rows) {
      try {
        await client.query(`
          INSERT INTO buildings (name, dong)
          VALUES ($1, $2)
        `, [building.building_name, building.building_name]);
        addedCount++;
        console.log(`  ✅ ${building.building_name} 추가됨`);
      } catch (err) {
        if (err.code === '23505') { // unique violation
          console.log(`  ⏭️  ${building.building_name} 이미 존재함`);
        } else {
          throw err;
        }
      }
    }
    
    console.log(`\n✅ ${addedCount}개 건물 추가 완료`);
    
    // 4. building_id 연결
    console.log('\n📋 building_id 연결 중...');
    
    // energy_data
    const energyUpdate = await client.query(`
      UPDATE energy_data ed
      SET building_id = b.id
      FROM buildings b
      WHERE ed.building_name = b.name
        AND ed.building_id IS NULL
    `);
    console.log(`  ✅ energy_data: ${energyUpdate.rowCount}개 연결됨`);
    
    // solar_data
    const solarUpdate = await client.query(`
      UPDATE solar_data sd
      SET building_id = b.id
      FROM buildings b
      WHERE sd.building_name = b.name
        AND sd.building_id IS NULL
    `);
    console.log(`  ✅ solar_data: ${solarUpdate.rowCount}개 연결됨`);
    
    // 5. 최종 통계
    console.log('\n📊 최종 데이터 확인:');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM buildings) as buildings_count,
        (SELECT COUNT(*) FROM energy_data) as energy_count,
        (SELECT COUNT(*) FROM energy_data WHERE building_id IS NOT NULL) as energy_connected,
        (SELECT COUNT(*) FROM solar_data) as solar_count,
        (SELECT COUNT(*) FROM solar_data WHERE building_id IS NOT NULL) as solar_connected,
        (SELECT COUNT(*) FROM energy_collection_logs) as logs_count
    `);
    
    const s = stats.rows[0];
    console.log(`  - buildings: ${s.buildings_count}개`);
    console.log(`  - energy_data: ${s.energy_count}개 (연결됨: ${s.energy_connected}개)`);
    console.log(`  - solar_data: ${s.solar_count}개 (연결됨: ${s.solar_connected}개)`);
    console.log(`  - collection_logs: ${s.logs_count}개`);
    
    console.log('\n✅ 마이그레이션 완료!');
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);