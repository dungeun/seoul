# Carbon Tech Data Import and Screenshot Generation Scripts

## Overview
These scripts handle importing carbon tech data from CSV and generating screenshots for all URLs.

## Prerequisites
- PostgreSQL database with `carbon_tech_posts` table
- Node.js and npm installed
- Required packages: `pg`, `puppeteer`, `csv-parse` (already installed)

## Scripts

### 1. Create Database Table
First, ensure the carbon_tech_posts table exists:
```bash
psql $DATABASE_URL < scripts/create-carbon-tech-table.sql
```

### 2. Import CSV Data
Import data from seoul_link_end.csv:
```bash
node scripts/import-carbon-tech-data.js
```

This script will:
- Read data from `seoul_link_end.csv`
- Map Korean categories to English codes
- Extract department info from names
- Import all data to the database
- Handle duplicates by updating existing records

### 3. Generate Screenshots
Generate screenshots for all imported URLs:
```bash
node scripts/generate-carbon-tech-screenshots.js
```

Features:
- **Resume capability**: Automatically continues from where it left off if interrupted
- **Batch processing**: Processes URLs in batches of 10 to prevent memory issues
- **Retry logic**: Automatically retries failed screenshots up to 3 times
- **Progress tracking**: Saves progress to `screenshot-progress.json`
- **Detailed logging**: Logs all activities to `screenshot-generation.log`

### 4. Monitor Progress
Use the utility script to monitor and manage the screenshot generation:

```bash
# Check current progress
node scripts/screenshot-utils.js progress

# View recent log entries
node scripts/screenshot-utils.js logs
node scripts/screenshot-utils.js logs 100  # Show last 100 entries

# Reset all progress (start over)
node scripts/screenshot-utils.js reset

# Prepare to retry failed URLs
node scripts/screenshot-utils.js retry
```

## Workflow

1. **Initial Setup**:
   ```bash
   # Create table if it doesn't exist
   psql $DATABASE_URL < scripts/create-carbon-tech-table.sql
   
   # Import CSV data
   node scripts/import-carbon-tech-data.js
   ```

2. **Generate Screenshots**:
   ```bash
   # Start screenshot generation
   node scripts/generate-carbon-tech-screenshots.js
   
   # If interrupted, just run again - it will resume
   node scripts/generate-carbon-tech-screenshots.js
   ```

3. **Monitor Progress**:
   ```bash
   # In another terminal, monitor progress
   node scripts/screenshot-utils.js progress
   
   # Check logs for any errors
   node scripts/screenshot-utils.js logs
   ```

4. **Handle Failures**:
   ```bash
   # If some URLs failed, prepare retry
   node scripts/screenshot-utils.js retry
   
   # Then run generation again
   node scripts/generate-carbon-tech-screenshots.js
   ```

## Files Created

- `/public/uploads/screenshots/` - Screenshot images
- `scripts/screenshot-progress.json` - Progress tracking
- `scripts/screenshot-generation.log` - Detailed logs

## Notes

- Screenshots are saved as JPEG with 80% quality
- Viewport size: 1280x800
- Timeout: 30 seconds per URL
- The script blocks fonts and media to speed up loading
- Failed URLs are tracked and can be retried