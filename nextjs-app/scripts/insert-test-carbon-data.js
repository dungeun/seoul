require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function insertTestData() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL or POSTGRES_URL not found');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  const testData = [
    {
      name: '김철수',
      department: '공과대학 기계공학과',
      url: 'https://example.com/prof-kim',
      main_category: '탄소중립 기술개발',
      sub_category: '수소 분야 (생산, 운반, 저장 등)',
      order_index: 1,
      status: 'published'
    },
    {
      name: '이영희',
      department: '자연과학대학 화학과',
      url: 'https://example.com/prof-lee',
      main_category: '탄소중립 기술개발',
      sub_category: '탄소 포집, 전환 활용 및 저장 분야 (CCUS 및 DAC 등)',
      order_index: 2,
      status: 'published'
    },
    {
      name: '박민수',
      department: '공과대학 전기전자공학부',
      url: 'https://example.com/prof-park',
      main_category: '탄소중립 기술개발',
      sub_category: '무탄소 전력공급 (태양광, 풍력, 지열, 원자력, ESS, 에너지 하베스팅 등)',
      order_index: 3,
      status: 'published'
    },
    {
      name: '정수진',
      department: '환경대학원',
      url: 'https://example.com/prof-jung',
      main_category: '탄소중립 정책연구',
      sub_category: '탄소중립 정책 및 제도',
      order_index: 1,
      status: 'published'
    },
    {
      name: '최동호',
      department: '경영대학',
      url: 'https://example.com/prof-choi',
      main_category: '탄소중립 정책연구',
      sub_category: '탄소중립 경제성 분석',
      order_index: 2,
      status: 'published'
    }
  ];
  
  try {
    console.log('🔄 Inserting test data...\n');
    
    for (const data of testData) {
      try {
        const result = await pool.query(
          `INSERT INTO carbon_tech_posts 
          (name, department, url, main_category, sub_category, order_index, status) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, name`,
          [data.name, data.department, data.url, data.main_category, data.sub_category, data.order_index, data.status]
        );
        console.log(`✅ Inserted: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
      } catch (error) {
        if (error.code === '23505') { // Unique constraint violation
          console.log(`⚠️  Skipped: ${data.name} (URL already exists)`);
        } else {
          throw error;
        }
      }
    }
    
    // Check total count
    const countResult = await pool.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`\n📊 Total records in database: ${countResult.rows[0].count}`);
    
    // Show all data
    const allData = await pool.query(`
      SELECT id, name, department, main_category, sub_category, url, status
      FROM carbon_tech_posts
      ORDER BY main_category, order_index
    `);
    
    console.log('\n📋 All carbon tech posts:');
    console.table(allData.rows);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed');
  }
}

insertTestData();