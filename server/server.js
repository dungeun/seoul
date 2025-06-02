import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import session from 'express-session';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const isDevelopment = process.env.NODE_ENV !== 'production';

// Development에서는 CORS 활성화, Production에서는 같은 origin이므로 불필요
if (isDevelopment) {
  app.use(cors({
    origin: function(origin, callback) {
      console.log('CORS origin check:', origin);
      // 개발 환경에서는 모든 localhost 포트 허용
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
  
  // CORS preflight 요청 처리
  app.options('*', cors());
}

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// 세션 설정 - 환경별로 다르게 설정
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'mini-cms-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  rolling: true, // 활동시마다 세션 갱신
  cookie: {
    secure: false, // HTTPS에서만 true로 설정
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
    sameSite: 'lax', // CSRF 보호
    path: '/'
  }
};

// Production 환경별 설정
if (!isDevelopment) {
  app.set('trust proxy', 1); // 프록시 뒤에 있을 때
  sessionConfig.cookie.domain = process.env.COOKIE_DOMAIN; // 필요시 도메인 설정
}

console.log('Session config:', sessionConfig);

app.use(session(sessionConfig));

// Production에서는 빌드된 React 앱 서빙
if (!isDevelopment) {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
}

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
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const db = new sqlite3.Database('./database.db');

// 인증이 필요한 경로 체크
const authMiddleware = (req, res, next) => {
  // 공개 API 경로는 인증 불필요
  const publicPaths = [
    '/api/pages/',
    '/api/boards/',
    '/api/menus/public',
    '/api/public/greenhouse-gas-stats',
    '/api/public/energy-stats'
  ];
  
  const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
  
  // 디버깅을 위한 로그
  console.log('Auth middleware check:', {
    path: req.path,
    method: req.method,
    sessionId: req.sessionID,
    userId: req.session?.userId,
    isPublicPath,
    cookies: req.headers.cookie
  });
  
  // 세션 체크
  if (req.session && req.session.userId) {
    // 세션 유효시간 갱신
    req.session.touch();
    next();
  } else if (isPublicPath) {
    // 공개 경로는 인증 없이 통과
    next();
  } else {
    console.log('Auth failed - no session or userId');
    res.status(401).json({ error: 'Unauthorized', message: '로그인이 필요합니다' });
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

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { 
    username, 
    sessionId: req.sessionID,
    headers: req.headers 
  });
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      console.error('Login DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: '사용자를 찾을 수 없습니다' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '비밀번호가 일치하지 않습니다' });
    }
    
    // 세션에 사용자 정보 저장
    req.session.userId = user.id;
    req.session.username = user.username;
    
    console.log('Session before save:', {
      sessionId: req.sessionID,
      userId: req.session.userId,
      username: req.session.username
    });
    
    // 세션 저장 확인
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
  });
});

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

// 공개 API 엔드포인트 (인증 불필요)
app.get('/api/public/greenhouse-gas-stats', (req, res) => {
  // 실제 에너지 데이터를 기반으로 온실가스 배출량 계산
  const queries = {
    currentYearData: `
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        COUNT(*) as record_count
      FROM energy_data 
      WHERE year = 2024
    `,
    previousYearData: `
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas
      FROM energy_data 
      WHERE year = 2023
    `,
    monthlyEmissions: `
      SELECT 
        month,
        SUM(electricity * 0.4781) + SUM(gas * 2.176) as emission
      FROM energy_data 
      WHERE year = 2024
      GROUP BY month
      ORDER BY month
    `,
    yearlyTrend: `
      SELECT 
        year,
        SUM(electricity * 0.4781) + SUM(gas * 2.176) as emission
      FROM energy_data 
      GROUP BY year
      ORDER BY year
    `,
    buildingEmissions: `
      SELECT 
        building_name as name,
        SUM(electricity * 0.4781) + SUM(gas * 2.176) as value
      FROM energy_data 
      WHERE year = 2024
      GROUP BY building_name
      ORDER BY value DESC
    `
  };

  // 현재 연도 데이터 조회
  db.get(queries.currentYearData, (err, currentData) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // 이전 연도 데이터 조회
    db.get(queries.previousYearData, (err, previousData) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // 온실가스 배출량 계산 (전기: 0.4781 kgCO2eq/kWh, 가스: 2.176 kgCO2eq/m³)
      const currentEmission = (currentData.total_electricity * 0.4781) + (currentData.total_gas * 2.176);
      const previousEmission = (previousData.total_electricity * 0.4781) + (previousData.total_gas * 2.176);
      const changePercent = ((currentEmission - previousEmission) / previousEmission * 100).toFixed(1);

      // 월별 배출량 조회
      db.all(queries.monthlyEmissions, (err, monthlyData) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // 연도별 추이 조회
        db.all(queries.yearlyTrend, (err, yearlyData) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // 건물별 배출량 조회
          db.all(queries.buildingEmissions, (err, buildingData) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

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
          });
        });
      });
    });
  });
});

app.get('/api/public/energy-stats', (req, res) => {
  // 실제 에너지 데이터 조회
  const queries = {
    currentYearTotals: `
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        SUM(water) as total_water
      FROM energy_data 
      WHERE year = 2024
    `,
    previousYearTotals: `
      SELECT 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        SUM(water) as total_water
      FROM energy_data 
      WHERE year = 2023
    `,
    monthlyUsage: `
      SELECT 
        month,
        SUM(electricity) as electricity,
        SUM(gas) as gas,
        SUM(water) as water
      FROM energy_data 
      WHERE year = 2024
      GROUP BY month
      ORDER BY month
    `,
    solarGeneration: `
      SELECT 
        month,
        SUM(generation) as generation
      FROM solar_data 
      WHERE year = 2024
      GROUP BY month
      ORDER BY month
    `,
    solarTotal: `
      SELECT SUM(generation) as total_solar FROM solar_data WHERE year = 2024
    `
  };

  // 현재 연도 합계
  db.get(queries.currentYearTotals, (err, currentTotals) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // 이전 연도 합계
    db.get(queries.previousYearTotals, (err, previousTotals) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // 태양광 총 발전량
      db.get(queries.solarTotal, (err, solarTotal) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // 월별 사용량
        db.all(queries.monthlyUsage, (err, monthlyData) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // 태양광 월별 발전량
          db.all(queries.solarGeneration, (err, solarData) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }

            const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                              '7월', '8월', '9월', '10월', '11월', '12월'];

            // 증감률 계산
            const electricityChange = ((currentTotals.total_electricity - previousTotals.total_electricity) / previousTotals.total_electricity * 100).toFixed(1);
            const gasChange = ((currentTotals.total_gas - previousTotals.total_gas) / previousTotals.total_gas * 100).toFixed(1);
            const totalChange = (((currentTotals.total_electricity + currentTotals.total_gas) - (previousTotals.total_electricity + previousTotals.total_gas)) / (previousTotals.total_electricity + previousTotals.total_gas) * 100).toFixed(1);

            const stats = {
              currentYear: {
                electricity: Math.round(currentTotals.total_electricity),
                gas: Math.round(currentTotals.total_gas),
                solar: Math.round(solarTotal.total_solar || 0),
                water: Math.round(currentTotals.total_water),
                unit: 'MWh'
              },
              monthlyUsage: monthlyData.map(item => ({
                month: monthNames[item.month - 1],
                electricity: Math.round(item.electricity),
                gas: Math.round(item.gas),
                water: Math.round(item.water)
              })),
              solarGeneration: solarData.map(item => ({
                month: monthNames[item.month - 1],
                generation: Math.round(item.generation)
              })),
              energySourceRatio: [
                { 
                  name: '전기', 
                  value: Math.round((currentTotals.total_electricity / (currentTotals.total_electricity + currentTotals.total_gas + (solarTotal.total_solar || 0))) * 100)
                },
                { 
                  name: '가스', 
                  value: Math.round((currentTotals.total_gas / (currentTotals.total_electricity + currentTotals.total_gas + (solarTotal.total_solar || 0))) * 100)
                },
                { 
                  name: '태양광', 
                  value: Math.round(((solarTotal.total_solar || 0) / (currentTotals.total_electricity + currentTotals.total_gas + (solarTotal.total_solar || 0))) * 100)
                },
                { name: '기타', value: 2 }
              ],
              yearComparison: {
                electricity: parseFloat(electricityChange),
                gas: parseFloat(gasChange),
                solar: 100, // 2024년 신규 설치
                total: parseFloat(totalChange)
              }
            };

            res.json(stats);
          });
        });
      });
    });
  });
});

app.get('/api/posts', authMiddleware, (req, res) => {
  const { page = 1, search = '', category = '', board = '' } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT p.id, p.title, p.slug, p.content, p.category_id, p.board_id, p.status, p.meta_description, p.created_at, p.updated_at,
           c.name as category_name, b.name as board_name 
    FROM posts p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN boards b ON p.board_id = b.id
    WHERE 1=1
  `;
  const params = [];
  
  if (search) {
    query += ' AND p.title LIKE ?';
    params.push(`%${search}%`);
  }
  
  if (category) {
    query += ' AND p.category_id = ?';
    params.push(category);
  }
  
  if (board) {
    query += ' AND p.board_id = ?';
    params.push(board);
  }
  
  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    let countQuery = 'SELECT COUNT(*) as total FROM posts WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND title LIKE ?';
      countParams.push(`%${search}%`);
    }
    
    if (category) {
      countQuery += ' AND category_id = ?';
      countParams.push(category);
    }
    
    if (board) {
      countQuery += ' AND board_id = ?';
      countParams.push(board);
    }
    
    db.get(countQuery, countParams, (err, count) => {
      res.json({
        results: rows,
        count: count.total,
        page: parseInt(page),
        totalPages: Math.ceil(count.total / limit)
      });
    });
  });
});

app.get('/api/posts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.get(`
    SELECT p.*, c.name as category_name, b.name as board_name 
    FROM posts p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN boards b ON p.board_id = b.id
    WHERE p.id = ?
  `, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(row);
  });
});

app.post('/api/posts', authMiddleware, (req, res) => {
  const { title, slug, content, category_id, board_id, status = 'published', meta_description = '' } = req.body;
  
  db.run(
    'INSERT INTO posts (title, slug, content, category_id, board_id, status, meta_description) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, slug, content, category_id, board_id, status, meta_description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/posts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, slug, content, category_id, board_id, status, meta_description } = req.body;
  
  db.run(
    'UPDATE posts SET title = ?, slug = ?, content = ?, category_id = ?, board_id = ?, status = ?, meta_description = ? WHERE id = ?',
    [title, slug, content, category_id, board_id, status, meta_description, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ success: true });
    }
  );
});

app.delete('/api/posts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ success: true });
  });
});

app.get('/api/files', authMiddleware, (req, res) => {
  const { page = 1, category = '' } = req.query;
  const limit = 10;
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT f.*, c.name as category_name 
    FROM files f 
    LEFT JOIN categories c ON f.category_id = c.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (category) {
    query += ' AND f.category_id = ?';
    params.push(category);
  }
  
  query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    db.get('SELECT COUNT(*) as total FROM files', (err, count) => {
      res.json({
        files: rows,
        total: count.total,
        page: parseInt(page),
        totalPages: Math.ceil(count.total / limit)
      });
    });
  });
});

app.post('/api/files/upload', authMiddleware, upload.single('file'), (req, res) => {
  const { title, description, category_id } = req.body;
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  db.run(
    'INSERT INTO files (title, description, filename, filepath, filesize, category_id) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, file.originalname, file.filename, file.size, category_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.get('/api/files/download/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM files WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const filePath = path.join(__dirname, 'uploads', row.filepath);
    res.download(filePath, row.filename);
  });
});

app.delete('/api/files/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT filepath FROM files WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      const filePath = path.join(__dirname, 'uploads', row.filepath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    db.run('DELETE FROM files WHERE id = ?', [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ success: true });
    });
  });
});

app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const queries = {
    totalPosts: 'SELECT COUNT(*) as count FROM posts',
    totalFiles: 'SELECT COUNT(*) as count FROM files',
    recentItems: `
      SELECT 'post' as type, id, title, created_at FROM posts 
      UNION ALL 
      SELECT 'file' as type, id, title, created_at FROM files 
      ORDER BY created_at DESC LIMIT 5
    `,
    monthlyPosts: `
      SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
      FROM posts 
      WHERE created_at >= datetime('now', '-12 months')
      GROUP BY month 
      ORDER BY month
    `,
    categoryStats: `
      SELECT c.name, 
        (SELECT COUNT(*) FROM posts WHERE category_id = c.id) as post_count,
        (SELECT COUNT(*) FROM files WHERE category_id = c.id) as file_count
      FROM categories c
    `
  };
  
  const stats = {};
  
  db.get(queries.totalPosts, (err, row) => {
    stats.totalPosts = row.count;
    
    db.get(queries.totalFiles, (err, row) => {
      stats.totalFiles = row.count;
      
      db.all(queries.recentItems, (err, rows) => {
        stats.recentItems = rows;
        
        db.all(queries.monthlyPosts, (err, rows) => {
          stats.monthlyPosts = rows;
          
          db.all(queries.categoryStats, (err, rows) => {
            stats.categoryStats = rows;
            res.json(stats);
          });
        });
      });
    });
  });
});

app.get('/api/categories', authMiddleware, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY sort_order', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json(rows);
  });
});

app.post('/api/categories', authMiddleware, (req, res) => {
  const { name, type, sort_order = 0 } = req.body;
  
  db.run(
    'INSERT INTO categories (name, type, sort_order) VALUES (?, ?, ?)',
    [name, type, sort_order],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, type, sort_order } = req.body;
  
  db.run(
    'UPDATE categories SET name = ?, type = ?, sort_order = ? WHERE id = ?',
    [name, type, sort_order, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({ success: true });
    }
  );
});

app.delete('/api/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM categories WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ success: true });
  });
});

app.post('/api/upload/image', authMiddleware, upload.single('image'), (req, res) => {
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  const imageUrl = `http://localhost:${PORT}/uploads/${file.filename}`;
  res.json({ url: imageUrl });
});

// Menu API endpoints
app.get('/api/menus', authMiddleware, (req, res) => {
  db.all(`
    SELECT m.*, p.title as page_title, b.name as board_name 
    FROM menus m 
    LEFT JOIN pages p ON m.page_id = p.id 
    LEFT JOIN boards b ON m.board_id = b.id 
    ORDER BY m.sort_order, m.id
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/menus/public', (req, res) => {
  db.all(`
    SELECT m.*, p.title as page_title, b.name as board_name 
    FROM menus m 
    LEFT JOIN pages p ON m.page_id = p.id 
    LEFT JOIN boards b ON m.board_id = b.id 
    WHERE m.is_active = 1
    ORDER BY m.sort_order, m.id
  `, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/menus', authMiddleware, async (req, res) => {
  const { name, url, type, page_id, board_id, sort_order, is_active, content } = req.body;
  
  try {
    // 페이지 타입이고 page_id가 없으면 새 페이지 생성
    let finalPageId = page_id;
    if (type === 'page' && !page_id && url) {
      const slug = url.replace('/page/', '');
      const title = name;
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO pages (title, slug, content) VALUES (?, ?, ?)',
          [title, slug, content || `<h1>${title}</h1>`],
          function(err) {
            if (err) reject(err);
            else {
              finalPageId = this.lastID;
              resolve();
            }
          }
        );
      });
    }
    
    // 게시판 타입이고 board_id가 없으면 새 게시판 생성
    let finalBoardId = board_id;
    if (type === 'board' && !board_id && url) {
      const slug = url.replace('/board/', '');
      const boardName = name;
      
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO boards (name, slug, description) VALUES (?, ?, ?)',
          [boardName, slug, ''],
          function(err) {
            if (err) reject(err);
            else {
              finalBoardId = this.lastID;
              resolve();
            }
          }
        );
      });
    }
    
    db.run(
      'INSERT INTO menus (name, url, type, page_id, board_id, sort_order, is_active, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, url, type, finalPageId, finalBoardId, sort_order || 0, is_active !== undefined ? is_active : 1, content || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ id: this.lastID, success: true });
      }
    );
  } catch (err) {
    return res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/menus/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, url, type, page_id, board_id, sort_order, is_active, content } = req.body;
  
  db.run(
    'UPDATE menus SET name = ?, url = ?, type = ?, page_id = ?, board_id = ?, sort_order = ?, is_active = ?, content = ? WHERE id = ?',
    [name, url, type, page_id, board_id, sort_order, is_active !== undefined ? is_active : 1, content || null, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/menus/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM menus WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Pages API endpoints - 관리자용
app.get('/api/pages', authMiddleware, (req, res) => {
  db.all('SELECT * FROM pages ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// 공개 API - 인증 불필요
app.get('/api/pages/:slug', (req, res) => {
  const { slug } = req.params;
  
  // 먼저 메뉴에서 content가 있는지 확인
  db.get(`
    SELECT m.content, m.name as title, p.* 
    FROM menus m 
    LEFT JOIN pages p ON m.page_id = p.id 
    WHERE m.url = ? AND m.type = 'page' AND m.is_active = 1
  `, [`/page/${slug}`], (err, menuRow) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (menuRow && menuRow.content) {
      // 메뉴에 content가 있으면 그것을 사용
      res.json({
        id: menuRow.id,
        title: menuRow.title,
        slug: slug,
        content: menuRow.content,
        created_at: menuRow.created_at,
        updated_at: menuRow.updated_at
      });
    } else {
      // 메뉴에 content가 없으면 기존 pages 테이블에서 조회
      db.get('SELECT * FROM pages WHERE slug = ?', [slug], (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Page not found' });
        }
        res.json(row);
      });
    }
  });
});

app.post('/api/pages', authMiddleware, (req, res) => {
  const { title, slug, content } = req.body;
  
  db.run(
    'INSERT INTO pages (title, slug, content) VALUES (?, ?, ?)',
    [title, slug, content || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/pages/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, slug, content } = req.body;
  
  db.run(
    'UPDATE pages SET title = ?, slug = ?, content = ? WHERE id = ?',
    [title, slug, content, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/pages/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM pages WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Board API endpoints - 관리자용
app.get('/api/boards', authMiddleware, (req, res) => {
  db.all('SELECT * FROM boards ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// 공개 API - 인증 불필요
app.get('/api/boards/:slug', (req, res) => {
  const { slug } = req.params;
  db.get('SELECT * FROM boards WHERE slug = ?', [slug], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(row);
  });
});

// 공개 API - 인증 불필요
app.get('/api/boards/:slug/posts', (req, res) => {
  const { slug } = req.params;
  db.get('SELECT id FROM boards WHERE slug = ?', [slug], (err, board) => {
    if (err || !board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    db.all(
      'SELECT * FROM posts WHERE board_id = ? ORDER BY created_at DESC',
      [board.id],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
      }
    );
  });
});

app.post('/api/boards', authMiddleware, (req, res) => {
  const { name, slug, description } = req.body;
  
  db.run(
    'INSERT INTO boards (name, slug, description) VALUES (?, ?, ?)',
    [name, slug, description],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/boards/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, slug, description } = req.body;
  
  db.run(
    'UPDATE boards SET name = ?, slug = ?, description = ? WHERE id = ?',
    [name, slug, description, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/boards/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM boards WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Energy Data API endpoints
app.get('/api/energy-data', authMiddleware, (req, res) => {
  const { year, month, building } = req.query;
  let query = 'SELECT * FROM energy_data WHERE 1=1';
  const params = [];
  
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  
  if (month) {
    query += ' AND month = ?';
    params.push(month);
  }
  
  if (building) {
    query += ' AND building_name = ?';
    params.push(building);
  }
  
  query += ' ORDER BY year DESC, month DESC, building_name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/energy-data', authMiddleware, (req, res) => {
  const { building_name, year, month, electricity, gas, water } = req.body;
  
  db.run(
    `INSERT INTO energy_data (building_name, year, month, electricity, gas, water) 
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(building_name, year, month) 
     DO UPDATE SET electricity = ?, gas = ?, water = ?`,
    [building_name, year, month, electricity, gas, water, electricity, gas, water],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/energy-data/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { electricity, gas, water } = req.body;
  
  db.run(
    'UPDATE energy_data SET electricity = ?, gas = ?, water = ? WHERE id = ?',
    [electricity, gas, water, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/energy-data/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM energy_data WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Solar Data API endpoints
app.get('/api/solar-data', authMiddleware, (req, res) => {
  const { year, month, building } = req.query;
  let query = 'SELECT * FROM solar_data WHERE 1=1';
  const params = [];
  
  if (year) {
    query += ' AND year = ?';
    params.push(year);
  }
  
  if (month) {
    query += ' AND month = ?';
    params.push(month);
  }
  
  if (building) {
    query += ' AND building_name = ?';
    params.push(building);
  }
  
  query += ' ORDER BY year DESC, month DESC, building_name';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/solar-data', authMiddleware, (req, res) => {
  const { building_name, year, month, generation, capacity } = req.body;
  
  db.run(
    `INSERT INTO solar_data (building_name, year, month, generation, capacity) 
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(building_name, year, month) 
     DO UPDATE SET generation = ?, capacity = ?`,
    [building_name, year, month, generation, capacity, generation, capacity],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/solar-data/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { generation, capacity } = req.body;
  
  db.run(
    'UPDATE solar_data SET generation = ?, capacity = ? WHERE id = ?',
    [generation, capacity, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/solar-data/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM solar_data WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// Hero Slides API endpoints
app.get('/api/hero-slides', (req, res) => {
  db.all('SELECT * FROM hero_slides WHERE active = 1 ORDER BY order_index ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.get('/api/admin/hero-slides', authMiddleware, (req, res) => {
  db.all('SELECT * FROM hero_slides ORDER BY order_index ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/admin/hero-slides', authMiddleware, (req, res) => {
  const { title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active } = req.body;
  
  db.run(
    `INSERT INTO hero_slides (title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, subtitle, description, button_text, background_image, background_color, text_color || 'white', order_index || 0, active !== undefined ? active : 1],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, success: true });
    }
  );
});

app.put('/api/admin/hero-slides/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active } = req.body;
  
  db.run(
    `UPDATE hero_slides SET 
     title = ?, subtitle = ?, description = ?, button_text = ?, 
     background_image = ?, background_color = ?, text_color = ?, 
     order_index = ?, active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, subtitle, description, button_text, background_image, background_color, text_color, order_index, active, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true });
    }
  );
});

app.delete('/api/admin/hero-slides/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM hero_slides WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

app.post('/api/admin/hero-slides/upload-image', authMiddleware, upload.single('image'), (req, res) => {
  const file = req.file;
  
  if (!file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  
  // 이미지 URL 생성
  const imageUrl = `/uploads/${file.filename}`;
  res.json({ url: imageUrl, filename: file.filename });
});

// Buildings API endpoints
app.get('/api/buildings', authMiddleware, (req, res) => {
  db.all('SELECT * FROM buildings ORDER BY name', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Energy Statistics API endpoints
app.get('/api/energy-stats', authMiddleware, (req, res) => {
  const { year } = req.query;
  
  const queries = {
    monthlyUsage: `
      SELECT month, 
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        SUM(water) as total_water
      FROM energy_data
      WHERE year = ?
      GROUP BY month
      ORDER BY month
    `,
    yearlyComparison: `
      SELECT year,
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        SUM(water) as total_water
      FROM energy_data
      GROUP BY year
      ORDER BY year DESC
      LIMIT 5
    `,
    buildingUsage: `
      SELECT building_name,
        SUM(electricity) as total_electricity,
        SUM(gas) as total_gas,
        SUM(water) as total_water
      FROM energy_data
      WHERE year = ?
      GROUP BY building_name
      ORDER BY total_electricity DESC
      LIMIT 10
    `,
    solarGeneration: `
      SELECT month,
        SUM(generation) as total_generation,
        SUM(capacity) as total_capacity
      FROM solar_data
      WHERE year = ?
      GROUP BY month
      ORDER BY month
    `
  };
  
  const stats = {};
  const currentYear = year || new Date().getFullYear();
  
  db.all(queries.monthlyUsage, [currentYear], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.monthlyUsage = rows;
    
    db.all(queries.yearlyComparison, (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.yearlyComparison = rows;
      
      db.all(queries.buildingUsage, [currentYear], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.buildingUsage = rows;
        
        db.all(queries.solarGeneration, [currentYear], (err, rows) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.solarGeneration = rows;
          
          res.json(stats);
        });
      });
    });
  });
});

// Production에서 모든 라우트를 React 앱으로 전달 (SPA를 위한 catch-all)
if (!isDevelopment) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 인포그래픽 게시판 더미 데이터
const infographicPosts = [
  {
    id: 1,
    title: '2024년 온실가스 배출량 현황',
    description: '서울대학교 캠퍼스의 2024년 온실가스 배출량 현황을 시각적으로 표현한 인포그래픽입니다.',
    imageUrl: '/img/infographic1.svg',
    pdfUrl: '/downloads/infographic1.pdf',
    createdAt: new Date('2024-01-15'),
    views: 1245,
    category: '온실가스',
    content: '2024년 서울대학교의 온실가스 배출량은 총 143,200tCO2eq를 기록했습니다. 이는 전년 대비 3.2% 증가한 수치로, 주요 원인은 여름철 폭염으로 인한 냉방 시설 사용 증가입니다. Scope 1(직접배출) 17.9%, Scope 2(간접배출) 82.1%로 구성되어 있으며, 관악캠퍼스가 전체 배출량의 78%를 차지하고 있습니다. 배출량 허용치인 65,069t를 초과하여 약 78,131t의 초과 배출량이 발생했습니다.'
  },
  {
    id: 2,
    title: '탄소중립 캠퍼스 로드맵 2030',
    description: '2030년 탄소중립 달성을 위한 서울대학교의 로드맵과 주요 정책을 소개합니다.',
    imageUrl: '/img/infographic2.svg',
    pdfUrl: '/downloads/infographic2.pdf',
    createdAt: new Date('2024-02-10'),
    views: 987,
    category: '정책',
    content: '서울대학교는 2030년까지 탄소중립을 달성하기 위한 단계별 계획을 수립했습니다. 2024년 현재 온실가스 배출량 기준선 설정, 2026년까지 재생에너지 비중 30% 확대, 2028년까지 에너지 효율 50% 개선, 2030년 탄소중립 달성을 목표로 하고 있습니다. 주요 전략으로는 태양광 발전 시설 확대, 건물 에너지 효율화, 친환경 교통 시스템 구축, 탄소 흡수원 확충 등이 있습니다.'
  },
  {
    id: 3,
    title: '재생에너지 활용 현황',
    description: '캠퍼스 내 태양광 발전소와 재생에너지 활용 현황을 한눈에 볼 수 있는 인포그래픽입니다.',
    imageUrl: '/img/infographic3.svg',
    pdfUrl: '/downloads/infographic3.pdf',
    createdAt: new Date('2024-03-05'),
    views: 1567,
    category: '재생에너지',
    content: '서울대학교는 현재 총 2.5MW 규모의 태양광 발전 시설을 운영하고 있으며, 연간 3,200MWh의 재생에너지를 생산하고 있습니다. 주요 설치 위치는 중앙도서관 옥상(500kW), 학생회관 옥상(400kW), 공대 건물 옥상(600kW), 기숙사 옥상(800kW), 체육관 옥상(200kW) 등입니다. 2024년 기준 전체 전력 사용량의 8.5%를 재생에너지로 충당하고 있으며, 2030년까지 30%로 확대할 계획입니다.'
  },
  {
    id: 4,
    title: '에너지 효율화 사업 성과',
    description: '건물 에너지 효율화 사업의 주요 성과와 절약 효과를 시각적으로 보여줍니다.',
    imageUrl: '/img/placeholder.jpg',
    pdfUrl: '/downloads/infographic4.pdf',
    createdAt: new Date('2024-04-12'),
    views: 876,
    category: '에너지',
    content: 'LED 조명 교체, 고효율 설비 도입, 건물 단열재 개선 등을 통해 연간 15% 이상의 에너지 절약 효과를 달성했습니다. 주요 성과로는 조명 에너지 40% 절약, 냉난방 에너지 20% 절약, 전력 사용량 총 12% 감소 등이 있습니다. 이를 통해 연간 약 15억원의 에너지 비용을 절약하고 있으며, CO2 배출량을 연간 2,500t 감축하는 효과를 거두고 있습니다.'
  },
  {
    id: 5,
    title: '친환경 교통 정책',
    description: '전기차 충전소 확대와 친환경 교통 정책의 효과를 분석한 인포그래픽입니다.',
    imageUrl: '/img/placeholder.jpg',
    pdfUrl: '/downloads/infographic5.pdf',
    createdAt: new Date('2024-05-20'),
    views: 654,
    category: '교통',
    content: '캠퍼스 내 전기차 충전소를 20개소로 확대하고, 친환경 셔틀버스를 도입하여 교통 부문 탄소 배출량을 30% 감축했습니다. 전기 셔틀버스 10대 운영, 자전거 대여 시스템 구축, 보행로 개선을 통해 개인 차량 이용을 줄이고 있습니다. 또한 교직원 및 학생들의 친환경 교통 이용률이 2022년 45%에서 2024년 67%로 크게 증가했습니다.'
  },
  {
    id: 6,
    title: '녹색캠퍼스 조성 프로젝트',
    description: '캠퍼스 내 녹지 공간 확대와 생태계 복원 프로젝트의 진행 상황을 소개합니다.',
    imageUrl: '/img/placeholder.jpg',
    pdfUrl: '/downloads/infographic6.pdf',
    createdAt: new Date('2024-06-15'),
    views: 789,
    category: '환경',
    content: '새로운 녹지 공간 5만㎡를 조성하고, 생태연못과 야생동물 서식지를 복원하여 캠퍼스 생물다양성을 증진시켰습니다. 주요 사업으로는 관악산 연결 생태통로 조성, 빗물 정원 설치, 토종 식물 복원, 야생동물 먹이터 조성 등이 있습니다. 이를 통해 캠퍼스 내 CO2 흡수량을 연간 500t 증가시키고, 도시 열섬 효과를 완화하는 효과를 거두고 있습니다.'
  }
];

// 인포그래픽 게시판 목록 API
app.get('/api/boards/infographic/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const posts = infographicPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, endIndex);

    const totalPages = Math.ceil(infographicPosts.length / limit);

    res.json({
      posts: posts,
      currentPage: page,
      totalPages: totalPages,
      totalPosts: infographicPosts.length
    });
  } catch (error) {
    console.error('인포그래픽 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 인포그래픽 상세 조회 API
app.get('/api/boards/infographic/posts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = infographicPosts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    post.views += 1;

    res.json(post);
  } catch (error) {
    console.error('인포그래픽 상세 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!isDevelopment) {
    console.log('Serving React app from /client/dist');
  }
});