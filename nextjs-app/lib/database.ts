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
        connectionTimeoutMillis: 10000, // 연결 타임아웃을 10초로 증가
        query_timeout: 30000, // 쿼리 타임아웃 30초
        statement_timeout: 30000,
      });
      
      // 연결 오류 처리
      pool.on('error', (err) => {
        console.error('Unexpected database pool error:', err);
        // 연결 풀 재설정
        pool = null;
      });
      
      console.log('✅ PostgreSQL Database connected');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      pool = null;
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
    let retries = 3;
    let lastError: any;
    
    while (retries > 0) {
      try {
        const database = getDatabase();
        const result = await database.query(sql, params);
        return result.rows as T[];
      } catch (error: any) {
        lastError = error;
        console.error(`Database query error (all) - Attempt ${4 - retries}:`, error);
        
        // DNS 오류나 연결 오류인 경우 재시도
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
          retries--;
          if (retries > 0) {
            console.log(`Retrying database connection... (${retries} attempts left)`);
            // 연결 풀 재설정
            pool = null;
            // 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }
        throw error;
      }
    }
    throw lastError;
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