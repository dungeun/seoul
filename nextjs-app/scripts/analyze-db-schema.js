#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function analyzeSchema() {
  console.log('🔍 데이터베이스 스키마 상세 분석...\n');
  
  const client = await pool.connect();
  
  try {
    // 1. buildings 테이블 구조 확인
    console.log('📋 buildings 테이블 구조:');
    const buildingsColumns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'buildings' 
      ORDER BY ordinal_position
    `);
    
    console.log('컬럼명 | 타입 | NULL허용 | 기본값 | 최대길이');
    console.log('-'.repeat(60));
    buildingsColumns.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(15)} | ${col.data_type.padEnd(20)} | ${col.is_nullable.padEnd(8)} | ${(col.column_default || 'null').padEnd(30)} | ${col.character_maximum_length || ''}`);
    });
    
    // 2. buildings 테이블 제약조건 확인
    console.log('\n📋 buildings 테이블 제약조건:');
    const buildingsConstraints = await client.query(`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_name = 'buildings'
    `);
    
    buildingsConstraints.rows.forEach(con => {
      console.log(`  - ${con.constraint_name}: ${con.constraint_type}`);
    });
    
    // 3. buildings 테이블 유니크 제약 확인
    console.log('\n📋 buildings 테이블 UNIQUE 제약:');
    const uniqueConstraints = await client.query(`
      SELECT 
        tc.constraint_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_name = 'buildings'
        AND tc.constraint_type = 'UNIQUE'
    `);
    
    if (uniqueConstraints.rows.length === 0) {
      console.log('  ❌ UNIQUE 제약이 없습니다!');
    } else {
      uniqueConstraints.rows.forEach(uc => {
        console.log(`  - ${uc.constraint_name} on ${uc.column_name}`);
      });
    }
    
    // 4. energy_data 테이블 구조 확인
    console.log('\n📋 energy_data 테이블 구조:');
    const energyColumns = await client.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'energy_data' 
      ORDER BY ordinal_position
    `);
    
    console.log('컬럼명 | 타입 | NULL허용');
    console.log('-'.repeat(40));
    energyColumns.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(20)} | ${col.data_type.padEnd(20)} | ${col.is_nullable}`);
    });
    
    // 5. building_id 컬럼 존재 여부 확인
    const hasBuildingId = energyColumns.rows.some(col => col.column_name === 'building_id');
    console.log(`\n🔍 energy_data.building_id 존재: ${hasBuildingId ? '✅ 있음' : '❌ 없음'}`);
    
    // 6. 외래키 확인
    console.log('\n📋 외래키 관계:');
    const foreignKeys = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND (tc.table_name IN ('energy_data', 'solar_data', 'buildings'))
      ORDER BY tc.table_name
    `);
    
    foreignKeys.rows.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // 7. 데이터 샘플 확인
    console.log('\n📋 energy_data 샘플 (5개):');
    const energySample = await client.query(`
      SELECT building_name, year, month, electricity 
      FROM energy_data 
      LIMIT 5
    `);
    
    energySample.rows.forEach(row => {
      console.log(`  - ${row.building_name}: ${row.year}년 ${row.month}월, 전기: ${row.electricity}`);
    });
    
    // 8. 중복 건물명 확인
    console.log('\n📋 energy_data의 고유 건물명:');
    const uniqueBuildings = await client.query(`
      SELECT DISTINCT building_name, COUNT(*) as count
      FROM energy_data
      WHERE building_name IS NOT NULL
      GROUP BY building_name
      ORDER BY building_name
    `);
    
    uniqueBuildings.rows.forEach(row => {
      console.log(`  - ${row.building_name}: ${row.count}개 레코드`);
    });
    
    // 9. 문제 진단
    console.log('\n🔍 문제 진단:');
    console.log('1. buildings 테이블에 name 컬럼의 UNIQUE 제약이 없어서 ON CONFLICT가 실패함');
    console.log('2. energy_data 테이블에 building_id 컬럼이 없음');
    console.log('3. buildings 테이블의 dong 컬럼이 NOT NULL이지만 기본값이 없음');
    
  } catch (error) {
    console.error('❌ 분석 실패:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

analyzeSchema();