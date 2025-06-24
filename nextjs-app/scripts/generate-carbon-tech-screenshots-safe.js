const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Configuration
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'public', 'uploads', 'screenshots');
const LOG_FILE = path.join(__dirname, 'screenshot-generation.log');
const PROGRESS_FILE = path.join(__dirname, 'screenshot-progress.json');
const BATCH_SIZE = 5; // Smaller batch size for safety
const TIMEOUT = 20000; // 20 seconds timeout
const MAX_RETRIES = 2;

// Problematic URLs to skip
const SKIP_URLS = [
  'https://peel.snu.ac.kr/', // Known to cause detached frame errors
];

// Logging function
async function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  console.log(logMessage.trim());
  await fs.appendFile(LOG_FILE, logMessage).catch(() => {});
}

// Load progress
async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return {
      processedIds: [],
      failedUrls: {},
      lastProcessedId: 0,
      totalProcessed: 0,
      totalFailed: 0,
      startTime: new Date().toISOString()
    };
  }
}

// Save progress
async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Generate screenshot for a single URL
async function generateScreenshot(browser, url) {
  let page = null;
  
  try {
    // Create new page for each screenshot
    page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({
      width: 1280,
      height: 800,
      deviceScaleFactor: 1
    });
    
    // Set timeouts
    page.setDefaultNavigationTimeout(TIMEOUT);
    page.setDefaultTimeout(TIMEOUT);
    
    await log(`Navigating to: ${url}`);
    
    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: TIMEOUT
    });
    
    // Wait a bit for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `screenshot-${timestamp}-${randomStr}.jpg`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    // Take screenshot
    await page.screenshot({
      path: filepath,
      type: 'jpeg',
      quality: 80,
      fullPage: false
    });
    
    await log(`✓ Screenshot saved: ${filename}`);
    
    return `/uploads/screenshots/${filename}`;
    
  } catch (error) {
    await log(`✗ Failed to capture screenshot for ${url}: ${error.message}`, 'ERROR');
    throw error;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // Ignore close errors
      }
    }
  }
}

// Process posts one by one
async function processPost(browser, post, progress) {
  try {
    // Skip if already processed
    if (progress.processedIds.includes(post.id)) {
      await log(`Skipping already processed: ${post.name} (ID: ${post.id})`);
      return { status: 'skipped' };
    }
    
    // Skip problematic URLs
    if (SKIP_URLS.includes(post.url)) {
      await log(`Skipping problematic URL: ${post.url}`, 'WARN');
      progress.processedIds.push(post.id);
      progress.lastProcessedId = post.id;
      await saveProgress(progress);
      return { status: 'skipped' };
    }
    
    // Try to generate screenshot
    let attempts = 0;
    let lastError = null;
    
    while (attempts < MAX_RETRIES) {
      try {
        const screenshotUrl = await generateScreenshot(browser, post.url);
        
        // Update database
        const client = await pool.connect();
        try {
          await client.query(
            'UPDATE carbon_tech_posts SET screenshot_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [screenshotUrl, post.id]
          );
        } finally {
          client.release();
        }
        
        // Update progress
        progress.processedIds.push(post.id);
        progress.lastProcessedId = post.id;
        progress.totalProcessed++;
        await saveProgress(progress);
        
        return {
          status: 'success',
          screenshotUrl: screenshotUrl
        };
        
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts < MAX_RETRIES) {
          await log(`Retry ${attempts}/${MAX_RETRIES} for ${post.url}`, 'WARN');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    // Failed after all retries
    if (!progress.failedUrls[post.url]) {
      progress.failedUrls[post.url] = {
        id: post.id,
        name: post.name,
        attempts: 0,
        lastError: ''
      };
    }
    progress.failedUrls[post.url].attempts++;
    progress.failedUrls[post.url].lastError = lastError.message;
    progress.totalFailed++;
    progress.lastProcessedId = post.id;
    await saveProgress(progress);
    
    return {
      status: 'failed',
      error: lastError.message
    };
    
  } catch (error) {
    await log(`Unexpected error processing ${post.name}: ${error.message}`, 'ERROR');
    return { status: 'error', error: error.message };
  }
}

// Main function
async function generateAllScreenshots() {
  let browser;
  
  try {
    await log('=== Starting Safe Screenshot Generation ===');
    
    // Ensure screenshots directory exists
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
    
    // Load progress
    const progress = await loadProgress();
    await log(`Resuming from last processed ID: ${progress.lastProcessedId}`);
    
    // Get posts from database
    const client = await pool.connect();
    let posts;
    try {
      const query = `
        SELECT id, name, department, url, main_category, sub_category 
        FROM carbon_tech_posts 
        WHERE status = 'published' 
          AND id > $1
        ORDER BY id ASC
      `;
      const result = await client.query(query, [progress.lastProcessedId]);
      posts = result.rows;
    } finally {
      client.release();
    }
    
    await log(`Found ${posts.length} posts to process`);
    
    if (posts.length === 0) {
      await log('No new posts to process');
      return;
    }
    
    // Launch browser with safe settings
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    
    // Process posts one by one
    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      await log(`\n[${i + 1}/${posts.length}] Processing: ${post.name}`);
      
      const result = await processPost(browser, post, progress);
      
      if (result.status === 'success') successCount++;
      else if (result.status === 'failed') failedCount++;
      else if (result.status === 'skipped') skippedCount++;
      
      // Small delay between posts
      if (i < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Restart browser every 20 posts to prevent memory issues
      if ((i + 1) % 20 === 0 && i < posts.length - 1) {
        await log('Restarting browser to free memory...');
        await browser.close();
        browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--disable-blink-features=AutomationControlled'
          ]
        });
      }
    }
    
    // Final summary
    await log('\n=== Screenshot Generation Complete ===');
    await log(`Successful: ${successCount}`);
    await log(`Failed: ${failedCount}`);
    await log(`Skipped: ${skippedCount}`);
    await log(`Total processed in this run: ${successCount + failedCount + skippedCount}`);
    await log(`Total processed overall: ${progress.totalProcessed}`);
    await log(`Total failed overall: ${progress.totalFailed}`);
    
    if (Object.keys(progress.failedUrls).length > 0) {
      await log('\n=== Failed URLs ===');
      for (const [url, info] of Object.entries(progress.failedUrls)) {
        await log(`${info.name} (${url}): ${info.attempts} attempts, last error: ${info.lastError}`);
      }
    }
    
  } catch (error) {
    await log(`Fatal error: ${error.message}`, 'ERROR');
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
    await pool.end();
  }
}

// Handle process interruption
process.on('SIGINT', async () => {
  await log('Process interrupted by user', 'WARN');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await log('Process terminated', 'WARN');
  process.exit(0);
});

// Run the script
generateAllScreenshots()
  .then(() => {
    process.exit(0);
  })
  .catch(async (error) => {
    await log(`Script failed: ${error.message}`, 'ERROR');
    process.exit(1);
  });