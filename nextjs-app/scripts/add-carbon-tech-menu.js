#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addCarbonTechMenu() {
  console.log('🔍 carbon-tech 메뉴 확인 및 추가...\n');
  
  const client = await pool.connect();
  
  try {
    // 기존 메뉴 확인
    const existing = await client.query(`
      SELECT * FROM menus 
      WHERE url = '/carbon-tech' OR name = '탄소중립기술'
    `);
    
    if (existing.rows.length > 0) {
      console.log('✅ carbon-tech 메뉴가 이미 존재합니다:', existing.rows[0]);
    } else {
      // 메뉴 추가
      console.log('📋 carbon-tech 메뉴 추가 중...');
      
      // 최대 sort_order 확인
      const maxOrder = await client.query(`
        SELECT MAX(sort_order) as max_order 
        FROM menus 
        WHERE parent_id IS NULL
      `);
      
      const nextOrder = (maxOrder.rows[0].max_order || 0) + 1;
      
      const result = await client.query(`
        INSERT INTO menus (name, url, type, parent_id, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, ['탄소중립기술', '/carbon-tech', 'page', null, nextOrder, true]);
      
      console.log('✅ 메뉴 추가 완료:', result.rows[0]);
    }
    
    // 모든 메뉴 확인
    const allMenus = await client.query(`
      SELECT id, name, url, type, sort_order, is_active 
      FROM menus 
      WHERE parent_id IS NULL
      ORDER BY sort_order
    `);
    
    console.log('\n📊 현재 메인 메뉴 목록:');
    allMenus.rows.forEach(menu => {
      console.log(`  ${menu.sort_order}. ${menu.name} (${menu.url}) - ${menu.is_active ? '활성' : '비활성'}`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCarbonTechMenu().catch(console.error);