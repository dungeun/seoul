#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkData() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT id, title, attachment_filepath, attachment_filename, featured_image 
      FROM posts 
      WHERE board_id = (SELECT id FROM boards WHERE slug = 'green-report') 
      ORDER BY id
    `);
    
    console.log('green-report 게시판 데이터:');
    console.log('='.repeat(100));
    
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`제목: ${row.title}`);
      console.log(`첨부파일 경로: ${row.attachment_filepath}`);
      console.log(`첨부파일명: ${row.attachment_filename}`);
      console.log(`이미지: ${row.featured_image}`);
      console.log('-'.repeat(100));
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();