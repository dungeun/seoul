const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const PROGRESS_FILE = path.join(__dirname, 'screenshot-progress.json');
const LOG_FILE = path.join(__dirname, 'screenshot-generation.log');

async function checkProgress() {
  console.log('=== Screenshot Generation Progress ===\n');
  
  try {
    // Load progress file
    const progressData = await fs.readFile(PROGRESS_FILE, 'utf-8');
    const progress = JSON.parse(progressData);
    
    console.log(`Start time: ${progress.startTime}`);
    console.log(`Last processed ID: ${progress.lastProcessedId}`);
    console.log(`Total processed: ${progress.totalProcessed}`);
    console.log(`Total failed: ${progress.totalFailed}`);
    console.log(`Failed URLs: ${Object.keys(progress.failedUrls).length}`);
    
    // Get database stats
    const client = await pool.connect();
    try {
      const totalResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts WHERE status = \'published\'');
      const withScreenshotResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts WHERE screenshot_url IS NOT NULL');
      const withoutScreenshotResult = await client.query('SELECT COUNT(*) FROM carbon_tech_posts WHERE status = \'published\' AND screenshot_url IS NULL');
      
      console.log(`\n=== Database Stats ===`);
      console.log(`Total posts: ${totalResult.rows[0].count}`);
      console.log(`With screenshots: ${withScreenshotResult.rows[0].count}`);
      console.log(`Without screenshots: ${withoutScreenshotResult.rows[0].count}`);
      
      // Calculate completion percentage
      const total = parseInt(totalResult.rows[0].count);
      const completed = parseInt(withScreenshotResult.rows[0].count);
      const percentage = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;
      
      console.log(`Completion: ${percentage}%`);
      
      // Show failed URLs if any
      if (Object.keys(progress.failedUrls).length > 0) {
        console.log('\n=== Failed URLs ===');
        for (const [url, info] of Object.entries(progress.failedUrls)) {
          console.log(`\n${info.name}`);
          console.log(`  URL: ${url}`);
          console.log(`  Attempts: ${info.attempts}`);
          console.log(`  Last error: ${info.lastError}`);
        }
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No progress file found. Screenshot generation has not been started yet.');
    } else {
      console.error('Error checking progress:', error.message);
    }
  }
}

async function resetProgress() {
  console.log('Resetting screenshot generation progress...');
  
  try {
    // Delete progress file
    await fs.unlink(PROGRESS_FILE).catch(() => {});
    
    // Clear screenshot URLs in database
    const client = await pool.connect();
    try {
      const result = await client.query('UPDATE carbon_tech_posts SET screenshot_url = NULL');
      console.log(`Reset ${result.rowCount} screenshot URLs in database`);
    } finally {
      client.release();
    }
    
    console.log('Progress reset complete!');
  } catch (error) {
    console.error('Error resetting progress:', error.message);
  }
}

async function showRecentLogs(lines = 50) {
  console.log(`=== Last ${lines} Log Entries ===\n`);
  
  try {
    const logContent = await fs.readFile(LOG_FILE, 'utf-8');
    const logLines = logContent.trim().split('\n');
    const recentLines = logLines.slice(-lines);
    
    recentLines.forEach(line => console.log(line));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No log file found. Screenshot generation has not been started yet.');
    } else {
      console.error('Error reading logs:', error.message);
    }
  }
}

async function retryFailed() {
  console.log('=== Retrying Failed Screenshots ===\n');
  
  try {
    // Load progress file
    const progressData = await fs.readFile(PROGRESS_FILE, 'utf-8');
    const progress = JSON.parse(progressData);
    
    if (Object.keys(progress.failedUrls).length === 0) {
      console.log('No failed URLs to retry');
      return;
    }
    
    // Clear failed URLs from progress
    console.log(`Found ${Object.keys(progress.failedUrls).length} failed URLs`);
    console.log('Clearing failed URLs to allow retry...');
    
    progress.failedUrls = {};
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
    
    console.log('Failed URLs cleared. Run the screenshot generation script again to retry.');
  } catch (error) {
    console.error('Error preparing retry:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'progress':
      await checkProgress();
      break;
    case 'reset':
      await resetProgress();
      break;
    case 'logs':
      const lines = parseInt(process.argv[3]) || 50;
      await showRecentLogs(lines);
      break;
    case 'retry':
      await retryFailed();
      break;
    default:
      console.log('Screenshot Utility Commands:');
      console.log('  node screenshot-utils.js progress  - Check generation progress');
      console.log('  node screenshot-utils.js reset     - Reset all progress');
      console.log('  node screenshot-utils.js logs [n]  - Show last n log entries (default: 50)');
      console.log('  node screenshot-utils.js retry     - Prepare to retry failed URLs');
  }
  
  await pool.end();
}

main().catch(console.error);