require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

async function checkCarbonTechData() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL or POSTGRES_URL not found in environment variables');
    process.exit(1);
  }
  
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('🔄 Connecting to database...');
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'carbon_tech_posts'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table carbon_tech_posts does not exist');
      
      // Create the table
      console.log('📋 Creating carbon_tech_posts table...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS carbon_tech_posts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          department VARCHAR(255) NOT NULL,
          url TEXT NOT NULL,
          screenshot_url TEXT,
          main_category VARCHAR(255) NOT NULL,
          sub_category VARCHAR(255) NOT NULL,
          order_index INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'published',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Create indexes
      await pool.query('CREATE INDEX IF NOT EXISTS idx_carbon_tech_main_category ON carbon_tech_posts(main_category);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_carbon_tech_sub_category ON carbon_tech_posts(sub_category);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_carbon_tech_status ON carbon_tech_posts(status);');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_carbon_tech_order ON carbon_tech_posts(order_index);');
      
      // Add unique constraint
      await pool.query('ALTER TABLE carbon_tech_posts ADD CONSTRAINT unique_carbon_tech_url UNIQUE (url);');
      
      console.log('✅ Table created successfully');
    } else {
      console.log('✅ Table carbon_tech_posts exists');
    }
    
    // Count records
    const countResult = await pool.query('SELECT COUNT(*) FROM carbon_tech_posts');
    console.log(`\n📊 Total records: ${countResult.rows[0].count}`);
    
    // Get sample data
    const sampleData = await pool.query(`
      SELECT id, name, department, main_category, sub_category, status, created_at
      FROM carbon_tech_posts 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    if (sampleData.rows.length > 0) {
      console.log('\n📋 Recent records:');
      console.table(sampleData.rows);
    } else {
      console.log('\n📋 No data found in the table');
    }
    
    // Get category distribution
    const categoryStats = await pool.query(`
      SELECT main_category, COUNT(*) as count 
      FROM carbon_tech_posts 
      GROUP BY main_category 
      ORDER BY count DESC
    `);
    
    if (categoryStats.rows.length > 0) {
      console.log('\n📊 Category distribution:');
      console.table(categoryStats.rows);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    console.log('\n🔐 Database connection closed');
  }
}

checkCarbonTechData();