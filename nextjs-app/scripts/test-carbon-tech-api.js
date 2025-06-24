const fetch = require('node-fetch');

async function testCarbonTechAPI() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔄 Testing Carbon Tech API endpoints...\n');
  
  // Test GET endpoint
  try {
    console.log('1. Testing GET /api/carbon-tech');
    const getResponse = await fetch(`${baseUrl}/api/carbon-tech`);
    const getData = await getResponse.json();
    console.log(`   Status: ${getResponse.status}`);
    console.log(`   Response:`, getData);
    console.log(`   ✅ GET endpoint working\n`);
  } catch (error) {
    console.error(`   ❌ GET endpoint error:`, error.message, '\n');
  }
  
  // Test POST endpoint (without auth - should fail)
  try {
    console.log('2. Testing POST /api/carbon-tech (without auth)');
    const postResponse = await fetch(`${baseUrl}/api/carbon-tech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '테스트 교수',
        department: '테스트 학과',
        url: 'https://example.com/test',
        main_category: '탄소중립 기술개발',
        sub_category: '수소 분야 (생산, 운반, 저장 등)',
        order_index: 1,
        status: 'published'
      })
    });
    const postData = await postResponse.json();
    console.log(`   Status: ${postResponse.status}`);
    console.log(`   Response:`, postData);
    console.log(`   ${postResponse.status === 401 ? '✅ Auth check working correctly' : '❌ Auth check not working'}\n`);
  } catch (error) {
    console.error(`   ❌ POST endpoint error:`, error.message, '\n');
  }
  
  // Test database connection through direct query
  console.log('3. Testing direct database connection');
  const { Pool } = require('pg');
  require('dotenv').config({ path: '.env.local' });
  
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('   ❌ No database connection string found');
    return;
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const result = await pool.query('SELECT NOW()');
    console.log(`   ✅ Database connected at:`, result.rows[0].now);
    
    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'carbon_tech_posts'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n4. Table structure:');
    console.table(columns.rows);
    
  } catch (error) {
    console.error(`   ❌ Database error:`, error.message);
  } finally {
    await pool.end();
  }
}

// Check if server is running
fetch('http://localhost:3000/api/health')
  .then(() => {
    console.log('✅ Server is running\n');
    testCarbonTechAPI();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start the Next.js development server first.');
    console.log('   Run: npm run dev');
  });