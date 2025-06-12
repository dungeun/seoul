const { Pool } = require('pg');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// PostgreSQL 연결 설정
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/seoul',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function generateThumbnailsForExisting() {
  try {
    console.log('Generating thumbnails for existing posts...');
    
    // Get posts with featured_image but no thumbnail_url
    const posts = await pool.query(`
      SELECT id, featured_image
      FROM posts 
      WHERE featured_image IS NOT NULL 
      AND (thumbnail_url IS NULL OR thumbnail_url = '')
    `);
    
    console.log(`Found ${posts.rows.length} posts needing thumbnails`);
    
    const publicDir = path.join(process.cwd(), 'public');
    const thumbDir = path.join(publicDir, 'uploads', 'thumbnails');
    
    // Ensure thumbnails directory exists
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }
    
    for (const post of posts.rows) {
      try {
        const imagePath = path.join(publicDir, post.featured_image);
        
        // Check if original image exists
        if (!fs.existsSync(imagePath)) {
          console.log(`⚠️  Original image not found: ${imagePath}`);
          continue;
        }
        
        // Generate thumbnail filename
        const originalFilename = path.basename(post.featured_image);
        const thumbFilename = `thumb_${originalFilename}`;
        const thumbPath = path.join(thumbDir, thumbFilename);
        const thumbUrl = `/uploads/thumbnails/${thumbFilename}`;
        
        // Skip if thumbnail already exists
        if (fs.existsSync(thumbPath)) {
          console.log(`✅ Thumbnail already exists: ${thumbFilename}`);
          
          // Update database
          await pool.query(
            'UPDATE posts SET thumbnail_url = $1 WHERE id = $2',
            [thumbUrl, post.id]
          );
          continue;
        }
        
        // Generate thumbnail
        await sharp(imagePath)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toFile(thumbPath);
        
        // Update database
        await pool.query(
          'UPDATE posts SET thumbnail_url = $1 WHERE id = $2',
          [thumbUrl, post.id]
        );
        
        console.log(`✅ Generated thumbnail for post ${post.id}: ${thumbFilename}`);
        
      } catch (error) {
        console.error(`❌ Failed to generate thumbnail for post ${post.id}:`, error.message);
      }
    }
    
    console.log('Thumbnail generation completed!');
    
  } catch (error) {
    console.error('❌ Error generating thumbnails:', error);
  } finally {
    await pool.end();
    console.log('Database connection closed');
  }
}

generateThumbnailsForExisting();