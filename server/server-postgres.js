import express from 'express';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const { Pool } = pg;
const PgSession = pgSession(session);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.connect()
  .then(client => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Development에서는 CORS 활성화
if (isDevelopment) {
  app.use(cors({
    origin: function(origin, callback) {
      console.log('CORS origin check:', origin);
      if (!origin || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['set-cookie']
  }));
  
  app.options('*', cors());
}

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 세션 설정 - PostgreSQL 사용
const sessionConfig = {
  store: new PgSession({
    pool: pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'mini-cms-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: !isDevelopment,
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    sameSite: 'lax',
    path: '/'
  }
};

if (!isDevelopment) {
  app.set('trust proxy', 1);
  sessionConfig.cookie.domain = process.env.COOKIE_DOMAIN;
}

console.log('Session config:', sessionConfig);
app.use(session(sessionConfig));

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeFilename = `file-${uniqueSuffix}${ext}`;
    cb(null, safeFilename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDF files are allowed.'));
    }
  }
});

// 인증 미들웨어
const authMiddleware = (req, res, next) => {
  const publicPaths = [
    '/api/pages/',
    '/api/boards/',
    '/api/menus/public',
    '/api/public/greenhouse-gas-stats',
    '/api/public/energy-stats',
    '/api/post/',
    '/api/public/link-posts'
  ];
  
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  console.log('Auth middleware check:', {
    path: req.path,
    method: req.method,
    sessionId: req.sessionID,
    userId: req.session?.userId,
    isPublicPath,
    cookies: req.headers.cookie
  });
  
  if (req.session && req.session.userId) {
    req.session.touch();
    next();
  } else if (isPublicPath) {
    next();
  } else {
    console.log('Auth failed - no session or userId');
    res.status(401).json({ error: 'Unauthorized', message: '로그인이 필요합니다' });
  }
};

// Helper function for database queries
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// 세션 상태 확인 API
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      authenticated: true, 
      username: req.session.username,
      expiresAt: new Date(Date.now() + req.session.cookie.maxAge)
    });
  } else {
    res.json({ authenticated: false });
  }
});

// 로그인 API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { 
    username, 
    sessionId: req.sessionID,
    headers: req.headers 
  });
  
  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    
    if (!user) {
      return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다' });
    }
    
    req.session.userId = user.id;
    req.session.username = user.username;
    
    console.log('Session before save:', {
      sessionId: req.sessionID,
      userId: req.session.userId,
      username: req.session.username
    });
    
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: '세션 저장 실패' });
      }
      
      console.log('Session after save:', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        cookie: req.session.cookie
      });
      
      res.json({ 
        success: true, 
        username: user.username,
        sessionId: req.sessionID,
        expiresAt: new Date(Date.now() + req.session.cookie.maxAge)
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 로그아웃 API
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: '로그아웃 실패' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// 공개 API 엔드포인트들
app.get('/api/public/greenhouse-gas-stats', async (req, res) => {
  try {
    // 실제 에너지 데이터를 기반으로 온실가스 배출량 계산
    const currentYearResult = await query(`
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        COUNT(*) as record_count
      FROM energy_data 
      WHERE year = 2024
    `);
    
    const previousYearResult = await query(`
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas
      FROM energy_data 
      WHERE year = 2023
    `);
    
    const monthlyEmissionsResult = await query(`
      SELECT 
        month,
        SUM(electricity * 0.4781) + SUM(gas * 2.176) as emission
      FROM energy_data 
      WHERE year = 2024
      GROUP BY month
      ORDER BY month
    `);
    
    const yearlyTrendResult = await query(`
      SELECT 
        year,
        SUM(electricity * 0.4781) + SUM(gas * 2.176) as emission
      FROM energy_data 
      GROUP BY year
      ORDER BY year
    `);
    
    const buildingEmissionsResult = await query(`
      SELECT 
        building_name as name,
        SUM(electricity * 0.4781) + SUM(gas * 2.176) as value
      FROM energy_data 
      WHERE year = 2024
      GROUP BY building_name
      ORDER BY value DESC
    `);

    const currentData = currentYearResult.rows[0];
    const previousData = previousYearResult.rows[0];
    const monthlyData = monthlyEmissionsResult.rows;
    const yearlyData = yearlyTrendResult.rows;
    const buildingData = buildingEmissionsResult.rows;

    // 온실가스 배출량 계산
    const currentEmission = (currentData.total_electricity * 0.4781) + (currentData.total_gas * 2.176);
    const previousEmission = (previousData.total_electricity * 0.4781) + (previousData.total_gas * 2.176);
    const changePercent = ((currentEmission - previousEmission) / previousEmission * 100).toFixed(1);

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                      '7월', '8월', '9월', '10월', '11월', '12월'];

    const stats = {
      currentYear: {
        total: Math.round(currentEmission),
        unit: 'tCO₂eq',
        changePercent: parseFloat(changePercent)
      },
      monthlyEmissions: monthlyData.map(item => ({
        month: monthNames[item.month - 1],
        emission: Math.round(item.emission)
      })),
      yearlyTrend: yearlyData.map(item => ({
        year: item.year.toString(),
        emission: Math.round(item.emission)
      })),
      buildingEmissions: buildingData.map(item => ({
        name: item.name,
        value: Math.round(item.value)
      })),
      reductionTarget: {
        targetYear: 2030,
        targetReduction: 40,
        currentProgress: Math.abs(changePercent) > 0 ? Math.round(Math.abs(changePercent) * 2) : 15
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Greenhouse gas stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/public/energy-stats', async (req, res) => {
  try {
    const currentYearResult = await query(`
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        COUNT(*) as record_count
      FROM energy_data 
      WHERE year = 2024
    `);
    
    const previousYearResult = await query(`
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas
      FROM energy_data 
      WHERE year = 2023
    `);
    
    const monthlyUsageResult = await query(`
      SELECT 
        month,
        SUM(electricity) as electricity,
        SUM(gas) as gas
      FROM energy_data 
      WHERE year = 2024
      GROUP BY month
      ORDER BY month
    `);
    
    const yearlyTrendResult = await query(`
      SELECT 
        year,
        SUM(electricity) as electricity,
        SUM(gas) as gas
      FROM energy_data 
      GROUP BY year
      ORDER BY year
    `);
    
    const buildingUsageResult = await query(`
      SELECT 
        building_name as name,
        SUM(electricity) as electricity,
        SUM(gas) as gas
      FROM energy_data 
      WHERE year = 2024
      GROUP BY building_name
      ORDER BY (electricity + gas) DESC
    `);

    const currentData = currentYearResult.rows[0];
    const previousData = previousYearResult.rows[0];
    const monthlyData = monthlyUsageResult.rows;
    const yearlyData = yearlyTrendResult.rows;
    const buildingData = buildingUsageResult.rows;

    const currentTotal = currentData.total_electricity + currentData.total_gas;
    const previousTotal = previousData.total_electricity + previousData.total_gas;
    const changePercent = ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1);

    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                      '7월', '8월', '9월', '10월', '11월', '12월'];

    const stats = {
      currentYear: {
        total: Math.round(currentTotal),
        unit: 'MWh',
        changePercent: parseFloat(changePercent)
      },
      monthlyUsage: monthlyData.map(item => ({
        month: monthNames[item.month - 1],
        electricity: Math.round(item.electricity),
        gas: Math.round(item.gas)
      })),
      yearlyTrend: yearlyData.map(item => ({
        year: item.year.toString(),
        electricity: Math.round(item.electricity),
        gas: Math.round(item.gas)
      })),
      buildingUsage: buildingData.map(item => ({
        name: item.name,
        electricity: Math.round(item.electricity),
        gas: Math.round(item.gas)
      })),
      efficiency: {
        target: 95,
        current: Math.min(95, 85 + Math.abs(changePercent) * 2)
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Energy stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/public/link-posts', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, title, content, image_url, attachment_url, created_at, slug
      FROM posts 
      WHERE board_slug = 'carbon-tech'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    const posts = result.rows.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      attachment_url: post.attachment_url,
      created_at: post.created_at,
      slug: post.slug
    }));

    res.json(posts);
  } catch (error) {
    console.error('Link posts error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 보드 관리 API
app.get('/api/boards', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT * FROM boards ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Boards error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/boards', authMiddleware, async (req, res) => {
  const { name, slug, description, type } = req.body;
  
  try {
    const result = await query(
      'INSERT INTO boards (name, slug, description, type) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description, type]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 게시글 관리 API
app.get('/api/posts', authMiddleware, async (req, res) => {
  console.log('=== GET /api/posts Debug ===');
  const { page = 1, search = '', board = '' } = req.query;
  console.log('Query params:', { page, search, board });
  console.log('Session:', { userId: req.session?.userId, sessionId: req.sessionID });
  
  const limit = 10;
  const offset = (page - 1) * limit;
  
  try {
    let whereClause = '';
    let params = [limit, offset];
    let paramIndex = 3;
    
    if (search) {
      whereClause += ` AND title LIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (board) {
      whereClause += ` AND board_slug = $${paramIndex}`;
      params.push(board);
    }

    console.log('Executing query with params:', params);
    
    const result = await query(`
      SELECT p.*, b.name as board_name 
      FROM posts p
      LEFT JOIN boards b ON p.board_slug = b.slug
      WHERE 1=1 ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, params);

    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM posts p
      WHERE 1=1 ${whereClause}
    `, params.slice(2));

    const posts = result.rows;
    const total = parseInt(countResult.rows[0].total);
    
    console.log('Posts query returned rows:', posts.length);
    console.log('Sending response:', { resultsCount: posts.length, totalCount: total });
    console.log('=== End GET /api/posts Debug ===');

    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Posts error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/posts', authMiddleware, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'attachment', maxCount: 1 }
]), async (req, res) => {
  const { title, content, board_slug } = req.body;
  
  try {
    const timestamp = Date.now();
    const slug = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '-').toLowerCase()}-${timestamp}`;
    
    let image_url = null;
    let attachment_url = null;
    
    if (req.files?.image) {
      image_url = `/uploads/${req.files.image[0].filename}`;
    }
    
    if (req.files?.attachment) {
      attachment_url = `/uploads/${req.files.attachment[0].filename}`;
    }
    
    const result = await query(
      'INSERT INTO posts (title, content, board_slug, slug, image_url, attachment_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, content, board_slug, slug, image_url, attachment_url]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 공개 게시글 API
app.get('/api/boards/:slug/posts', async (req, res) => {
  const { slug } = req.params;
  const { page = 1 } = req.query;
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    const result = await query(`
      SELECT p.*, b.name as board_name, b.type as board_type
      FROM posts p
      LEFT JOIN boards b ON p.board_slug = b.slug
      WHERE p.board_slug = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `, [slug, limit, offset]);

    const countResult = await query(
      'SELECT COUNT(*) as total FROM posts WHERE board_slug = $1',
      [slug]
    );

    const posts = result.rows;
    const total = parseInt(countResult.rows[0].total);

    res.json({
      posts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Board posts error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/post/:identifier', async (req, res) => {
  const { identifier } = req.params;
  
  try {
    let result;
    
    if (isNaN(identifier)) {
      result = await query(`
        SELECT p.*, b.name as board_name, b.type as board_type
        FROM posts p
        LEFT JOIN boards b ON p.board_slug = b.slug
        WHERE p.slug = $1
      `, [identifier]);
    } else {
      result = await query(`
        SELECT p.*, b.name as board_name, b.type as board_type
        FROM posts p
        LEFT JOIN boards b ON p.board_slug = b.slug
        WHERE p.id = $1
      `, [parseInt(identifier)]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Post detail error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 에너지 데이터 관리
app.get('/api/energy-data', authMiddleware, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM energy_data 
      ORDER BY year DESC, month DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Energy data error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/energy-data', authMiddleware, async (req, res) => {
  const { building_name, year, month, electricity, gas } = req.body;
  
  try {
    const result = await query(
      'INSERT INTO energy_data (building_name, year, month, electricity, gas) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [building_name, year, month, electricity, gas]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create energy data error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// 태양광 데이터 관리
app.get('/api/solar-data', authMiddleware, async (req, res) => {
  try {
    const result = await query(`
      SELECT * FROM solar_data 
      ORDER BY year DESC, month DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Solar data error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/solar-data', authMiddleware, async (req, res) => {
  const { location, year, month, generation, efficiency } = req.body;
  
  try {
    const result = await query(
      'INSERT INTO solar_data (location, year, month, generation, efficiency) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [location, year, month, generation, efficiency]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Create solar data error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default app;

// 서버 시작
if (!isDevelopment) {
  const clientBuildPath = path.join(__dirname, '../nextjs-app/.next/static');
  app.use('/static', express.static(clientBuildPath));
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!isDevelopment) {
    console.log('Serving Next.js app');
  }
});