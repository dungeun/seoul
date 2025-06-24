#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkSchema() {
  console.log('🔍 Neon DB 스키마 확인 중...\n');
  
  try {
    // 1. 테이블 목록
    console.log('📋 테이블 목록:');
    const tables = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);
    
    const tableNames = tables.rows.map(r => r.tablename);
    tableNames.forEach(name => console.log(`  ✓ ${name}`));
    
    // 필요한 테이블 체크
    const requiredTables = [
      'buildings', 'categories', 'files', 'users', 
      'energy_collection_logs', 'energy_data', 'solar_data',
      'posts', 'boards', 'menus', 'hero_slides'
    ];
    
    console.log('\n📌 필수 테이블 체크:');
    requiredTables.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`  ✅ ${table}`);
      } else {
        console.log(`  ❌ ${table} (누락)`);
      }
    });
    
    // 2. energy_data 테이블 상세 정보
    console.log('\n📊 energy_data 테이블 구조:');
    const energyColumns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'energy_data' 
      ORDER BY ordinal_position;
    `);
    
    console.log('  컬럼명 | 타입 | NULL 허용 | 기본값');
    console.log('  ' + '-'.repeat(50));
    energyColumns.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(20)} | ${col.data_type.padEnd(15)} | ${col.is_nullable.padEnd(10)} | ${col.column_default || 'null'}`);
    });
    
    // 3. 인덱스 확인
    console.log('\n🔍 인덱스 목록:');
    const indexes = await pool.query(`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('energy_data', 'solar_data', 'posts')
      ORDER BY tablename, indexname;
    `);
    
    let currentTable = '';
    indexes.rows.forEach(idx => {
      if (currentTable !== idx.tablename) {
        currentTable = idx.tablename;
        console.log(`\n  ${currentTable}:`);
      }
      console.log(`    - ${idx.indexname}`);
    });
    
    // 4. 외래키 확인
    console.log('\n🔗 외래키 관계:');
    const foreignKeys = await pool.query(`
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
      ORDER BY tc.table_name;
    `);
    
    foreignKeys.rows.forEach(fk => {
      console.log(`  ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
    });
    
    // 5. 최근 데이터 확인
    console.log('\n📈 데이터 현황:');
    const dataCounts = await pool.query(`
      SELECT 
        'energy_data' as table_name, COUNT(*) as count FROM energy_data
      UNION ALL
      SELECT 'solar_data', COUNT(*) FROM solar_data
      UNION ALL
      SELECT 'posts', COUNT(*) FROM posts
      UNION ALL
      SELECT 'buildings', COUNT(*) FROM buildings;
    `);
    
    dataCounts.rows.forEach(row => {
      console.log(`  ${row.table_name}: ${row.count}개`);
    });
    
    console.log('\n✅ 스키마 확인 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await pool.end();
  }
}

checkSchema();