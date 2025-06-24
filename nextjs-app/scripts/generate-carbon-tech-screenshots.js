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
const BATCH_SIZE = 10; // Process in batches to prevent memory issues
const TIMEOUT = 30000; // 30 seconds timeout per screenshot
const MAX_RETRIES = 3;

// Logging function
async function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}\n`;
  
  console.log(logMessage.trim());
  await fs.appendFile(LOG_FILE, logMessage);
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
async function generateScreenshot(page, url, retryCount = 0) {
  try {
    await log(`Attempting to capture screenshot for: ${url}`);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `screenshot-${timestamp}-${randomStr}.jpg`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);
    
    // Set timeout for page
    page.setDefaultNavigationTimeout(TIMEOUT);
    page.setDefaultTimeout(TIMEOUT);
    
    // Navigate to URL with timeout
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: TIMEOUT
      });
    } catch (navError) {
      // Try with less strict settings
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: TIMEOUT
      });
    }
    
    // Wait a bit for any dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take screenshot
    await page.screenshot({
      path: filepath,
      type: 'jpeg',
      quality: 80,
      fullPage: false // Just capture viewport
    });
    
    await log(`✓ Screenshot saved: ${filename}`);
    
    return `/uploads/screenshots/${filename}`;
  } catch (error) {
    if (retryCount < MAX_RETRIES && !error.message.includes('detached Frame')) {
      await log(`Retry ${retryCount + 1}/${MAX_RETRIES} for ${url}`, 'WARN');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait before retry
      return generateScreenshot(page, url, retryCount + 1);
    }
    
    await log(`✗ Failed to capture screenshot for ${url}: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Process a batch of posts
async function processBatch(browser, posts, progress) {
  const results = [];
  
  for (const post of posts) {
    // Skip if already processed
    if (progress.processedIds.includes(post.id)) {
      await log(`Skipping already processed post: ${post.name} (ID: ${post.id})`);
      continue;
    }
    
    let page;
    try {
      page = await browser.newPage();
      
      // Set viewport
      await page.setViewport({
        width: 1280,
        height: 800,
        deviceScaleFactor: 1
      });
      
      // Block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        try {
          const resourceType = request.resourceType();
          if (['font', 'media', 'image'].includes(resourceType)) {
            request.abort();
          } else {
            request.continue();
          }
        } catch (e) {
          // Ignore interception errors
        }
      });
      
      // Generate screenshot
      const screenshotUrl = await generateScreenshot(page, post.url);
      
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
      
      results.push({
        id: post.id,
        name: post.name,
        url: post.url,
        screenshot: screenshotUrl,
        status: 'success'
      });
      
    } catch (error) {
      await log(`Failed to process ${post.name}: ${error.message}`, 'ERROR');
      
      // Track failed URLs
      if (!progress.failedUrls[post.url]) {
        progress.failedUrls[post.url] = {
          id: post.id,
          name: post.name,
          attempts: 0,
          lastError: ''
        };
      }
      progress.failedUrls[post.url].attempts++;
      progress.failedUrls[post.url].lastError = error.message;
      progress.totalFailed++;
      await saveProgress(progress);
      
      results.push({
        id: post.id,
        name: post.name,
        url: post.url,
        status: 'failed',
        error: error.message
      });
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Page might already be closed
        }
      }
    }
  }
  
  return results;
}

// Main function
async function generateAllScreenshots() {
  let browser;
  
  try {
    await log('=== Starting Screenshot Generation ===');
    
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
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    
    // Process in batches
    const totalBatches = Math.ceil(posts.length / BATCH_SIZE);
    
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, posts.length);
      const batch = posts.slice(start, end);
      
      await log(`Processing batch ${i + 1}/${totalBatches} (${batch.length} posts)`);
      
      const results = await processBatch(browser, batch, progress);
      
      // Log batch summary
      const successful = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'failed').length;
      
      await log(`Batch ${i + 1} complete: ${successful} successful, ${failed} failed`);
      
      // Small delay between batches
      if (i < totalBatches - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Final summary
    await log('=== Screenshot Generation Complete ===');
    await log(`Total processed: ${progress.totalProcessed}`);
    await log(`Total failed: ${progress.totalFailed}`);
    
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