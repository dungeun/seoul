import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.db');

console.log('Starting database migration...');

// Add missing columns to posts table
db.run(`
  ALTER TABLE posts ADD COLUMN slug TEXT;
`, (err) => {
  if (err) {
    console.log('Column slug might already exist:', err.message);
  } else {
    console.log('Added slug column to posts table');
  }
});

db.run(`
  ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'published';
`, (err) => {
  if (err) {
    console.log('Column status might already exist:', err.message);
  } else {
    console.log('Added status column to posts table');
  }
});

db.run(`
  ALTER TABLE posts ADD COLUMN meta_description TEXT;
`, (err) => {
  if (err) {
    console.log('Column meta_description might already exist:', err.message);
  } else {
    console.log('Added meta_description column to posts table');
  }
});

// Update existing posts with slug if they don't have one
db.all('SELECT id, title FROM posts WHERE slug IS NULL', (err, posts) => {
  if (err) {
    console.error('Error fetching posts:', err);
    return;
  }
  
  posts.forEach((post) => {
    const slug = post.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    db.run('UPDATE posts SET slug = ? WHERE id = ?', [slug, post.id], (err) => {
      if (err) {
        console.error(`Error updating post ${post.id}:`, err);
      } else {
        console.log(`Updated slug for post ${post.id}: ${slug}`);
      }
    });
  });
});

// Close database connection after a delay to ensure all operations complete
setTimeout(() => {
  db.close(() => {
    console.log('Database migration completed.');
  });
}, 2000);