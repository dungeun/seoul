import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';

const sqlite = sqlite3.verbose();

// 데이터베이스 연결
const db = new sqlite.Database('./database.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

async function createAdmin() {
  const username = 'admin';
  const password = 'admin123'; // 기본 비밀번호
  
  try {
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 기존 admin 사용자가 있는지 확인
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return;
      }
      
      if (user) {
        console.log('Admin user already exists. Updating password...');
        // 기존 사용자 업데이트
        db.run('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username], (err) => {
          if (err) {
            console.error('Error updating admin user:', err);
          } else {
            console.log('Admin user password updated successfully');
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
          }
          db.close();
        });
      } else {
        console.log('Creating new admin user...');
        // 새 사용자 생성
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created successfully');
            console.log(`Username: ${username}`);
            console.log(`Password: ${password}`);
          }
          db.close();
        });
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    db.close();
  }
}

createAdmin();