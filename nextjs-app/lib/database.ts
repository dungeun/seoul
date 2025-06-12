import { Pool } from 'pg';

// PostgreSQL 연결 풀
let pool: Pool | null = null;

export function getDatabase(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL or POSTGRES_URL environment variable is required');
    }
    
    try {
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      console.log('✅ PostgreSQL Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return pool;
}

// 데이터베이스 쿼리 헬퍼 함수들
export const dbQuery = {
  // SELECT 쿼리 (단일 결과)
  get: async <T>(sql: string, params: unknown[] = []): Promise<T | null> => {
    try {
      const database = getDatabase();
      const result = await database.query(sql, params);
      return result.rows[0] as T || null;
    } catch (error) {
      console.error('Database query error (get):', error);
      throw error;
    }
  },

  // SELECT 쿼리 (다중 결과)
  all: async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
    try {
      const database = getDatabase();
      const result = await database.query(sql, params);
      return result.rows as T[];
    } catch (error) {
      console.error('Database query error (all):', error);
      throw error;
    }
  },

  // INSERT/UPDATE/DELETE 쿼리
  run: async (sql: string, params: unknown[] = []) => {
    try {
      const database = getDatabase();
      const result = await database.query(sql, params);
      return result;
    } catch (error) {
      console.error('Database query error (run):', error);
      throw error;
    }
  },

  // 트랜잭션 실행
  transaction: async (queries: { sql: string; params: unknown[] }[]) => {
    const client = await getDatabase().connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const query of queries) {
        const result = await client.query(query.sql, query.params);
        results.push(result);
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  },
};

// 연결 종료
export async function closeDatabaseConnection() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔐 Database connection closed');
  }
} 