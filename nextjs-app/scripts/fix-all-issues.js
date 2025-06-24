#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function fixAllIssues() {
  console.log('🚀 모든 문제 해결 시작...\n');
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. buildings 테이블의 dong 컬럼을 nullable로 변경
    console.log('📋 Step 1: buildings.dong 컬럼 NOT NULL 제약 제거');
    try {
      await client.query(`ALTER TABLE buildings ALTER COLUMN dong DROP NOT NULL`);
      console.log('  ✅ dong 컬럼 수정 완료');
    } catch (err) {
      if (err.code === '42704') { // column does not exist
        console.log('  ⏭️  이미 수정됨');
      } else {
        throw err;
      }
    }
    
    // 2. buildings 테이블의 name 컬럼에 UNIQUE 제약 추가
    console.log('\n📋 Step 2: buildings.name 컬럼에 UNIQUE 제약 추가');
    try {
      await client.query(`ALTER TABLE buildings ADD CONSTRAINT buildings_name_unique UNIQUE (name)`);
      console.log('  ✅ UNIQUE 제약 추가 완료');
    } catch (err) {
      if (err.code === '42710') { // constraint already exists
        console.log('  ⏭️  이미 존재함');
      } else if (err.code === '23505') { // duplicate key
        // 중복 제거 후 다시 시도
        console.log('  🔧 중복 데이터 제거 중...');
        await client.query(`
          DELETE FROM buildings b1
          WHERE b1.id > (
            SELECT MIN(b2.id)
            FROM buildings b2
            WHERE b2.name = b1.name
          )
        `);
        await client.query(`ALTER TABLE buildings ADD CONSTRAINT buildings_name_unique UNIQUE (name)`);
        console.log('  ✅ 중복 제거 후 UNIQUE 제약 추가 완료');
      } else {
        throw err;
      }
    }
    
    // 3. energy_data에 building_id 컬럼 추가
    console.log('\n📋 Step 3: energy_data에 building_id 컬럼 추가');
    try {
      await client.query(`
        ALTER TABLE energy_data 
        ADD COLUMN building_id INTEGER REFERENCES buildings(id)
      `);
      console.log('  ✅ building_id 컬럼 추가 완료');
    } catch (err) {
      if (err.code === '42701') { // column already exists
        console.log('  ⏭️  이미 존재함');
      } else {
        throw err;
      }
    }
    
    // 4. solar_data에 building_id 컬럼 추가
    console.log('\n📋 Step 4: solar_data에 building_id 컬럼 추가');
    try {
      await client.query(`
        ALTER TABLE solar_data 
        ADD COLUMN building_id INTEGER REFERENCES buildings(id)
      `);
      console.log('  ✅ building_id 컬럼 추가 완료');
    } catch (err) {
      if (err.code === '42701') { // column already exists
        console.log('  ⏭️  이미 존재함');
      } else {
        throw err;
      }
    }
    
    // 5. buildings 테이블에 데이터 추가 (이제 ON CONFLICT 사용 가능)
    console.log('\n📋 Step 5: buildings 테이블에 건물 데이터 추가');
    const insertResult = await client.query(`
      INSERT INTO buildings (name, dong)
      SELECT DISTINCT building_name, building_name
      FROM energy_data 
      WHERE building_name IS NOT NULL
      ON CONFLICT (name) DO NOTHING
      RETURNING name
    `);
    console.log(`  ✅ ${insertResult.rowCount}개 건물 추가됨`);
    
    // solar_data에서도 건물 추가
    const solarInsertResult = await client.query(`
      INSERT INTO buildings (name, dong)
      SELECT DISTINCT building_name, building_name
      FROM solar_data 
      WHERE building_name IS NOT NULL
      ON CONFLICT (name) DO NOTHING
      RETURNING name
    `);
    console.log(`  ✅ solar_data에서 ${solarInsertResult.rowCount}개 건물 추가됨`);
    
    // 6. building_id 연결
    console.log('\n📋 Step 6: building_id 연결');
    
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
    
    // 7. 인덱스 추가
    console.log('\n📋 Step 7: 성능 최적화를 위한 인덱스 추가');
    const indexes = [
      { table: 'energy_data', column: 'building_id', name: 'idx_energy_data_building_id' },
      { table: 'solar_data', column: 'building_id', name: 'idx_solar_data_building_id' },
      { table: 'buildings', column: 'name', name: 'idx_buildings_name' }
    ];
    
    for (const idx of indexes) {
      try {
        await client.query(`CREATE INDEX ${idx.name} ON ${idx.table}(${idx.column})`);
        console.log(`  ✅ ${idx.name} 인덱스 생성됨`);
      } catch (err) {
        if (err.code === '42P07') { // relation already exists
          console.log(`  ⏭️  ${idx.name} 이미 존재함`);
        } else {
          throw err;
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ 모든 문제 해결 완료!');
    
    // 최종 확인
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
    
    // 연결 확인
    const sample = await client.query(`
      SELECT 
        e.building_name,
        b.id as building_id,
        b.name as building_name_from_buildings
      FROM energy_data e
      LEFT JOIN buildings b ON e.building_id = b.id
      LIMIT 5
    `);
    
    console.log('\n📋 연결 샘플:');
    sample.rows.forEach(row => {
      console.log(`  - ${row.building_name} → building_id: ${row.building_id}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 오류 발생:', error.message);
    console.error('상세:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixAllIssues().catch(console.error);