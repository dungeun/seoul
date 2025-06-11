import Database from 'better-sqlite3';
import path from 'path';

// 데이터베이스 연결
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    // 기존 서버의 데이터베이스 파일 경로
    const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), '..', 'server', 'database.db');
    
    try {
      db = new Database(dbPath);
      db.pragma('journal_mode = WAL');
      console.log('✅ Database connected:', dbPath);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return db;
}

// 데이터베이스 쿼리 헬퍼 함수들
export const dbQuery = {
  // SELECT 쿼리 (단일 결과)
  get: <T>(sql: string, params: unknown[] = []): T | null => {
    try {
      const database = getDatabase();
      const stmt = database.prepare(sql);
      const result = stmt.get(...params) as T;
      return result || null;
    } catch (error) {
      console.error('Database query error (get):', error);
      throw error;
    }
  },

  // SELECT 쿼리 (다중 결과)
  all: <T>(sql: string, params: unknown[] = []): T[] => {
    try {
      const database = getDatabase();
      const stmt = database.prepare(sql);
      const results = stmt.all(...params) as T[];
      return results;
    } catch (error) {
      console.error('Database query error (all):', error);
      throw error;
    }
  },

  // INSERT/UPDATE/DELETE 쿼리
  run: (sql: string, params: unknown[] = []) => {
    try {
      const database = getDatabase();
      const stmt = database.prepare(sql);
      const result = stmt.run(...params);
      return result;
    } catch (error) {
      console.error('Database query error (run):', error);
      throw error;
    }
  },

  // 트랜잭션 실행
  transaction: (queries: { sql: string; params: unknown[] }[]) => {
    try {
      const database = getDatabase();
      const transaction = database.transaction(() => {
        for (const query of queries) {
          const stmt = database.prepare(query.sql);
          stmt.run(...query.params);
        }
      });
      return transaction();
    } catch (error) {
      console.error('Database transaction error:', error);
      throw error;
    }
  },
};

// 연결 종료
export function closeDatabaseConnection() {
  if (db) {
    db.close();
    db = null;
    console.log('🔐 Database connection closed');
  }
} 