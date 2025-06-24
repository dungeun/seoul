# 기술 문서 (Technical Documentation)

## 1. 개발 환경 설정

### 1.1 필수 요구사항
- Node.js 18.0 이상
- npm 또는 yarn
- PostgreSQL 데이터베이스
- Git

### 1.2 프로젝트 설치
```bash
# 저장소 클론
git clone [repository-url]
cd nextjs-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수 설정
```

### 1.3 환경 변수 설정
```env
# 데이터베이스
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# 인증
JWT_SECRET=your-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# 외부 서비스 (선택사항)
WEATHER_API_KEY=your-weather-api-key
```

## 2. 프로젝트 구조 상세

### 2.1 앱 라우터 구조
```
app/
├── (public)/                 # 공개 페이지 그룹
│   ├── page.tsx             # 홈페이지
│   ├── dashboard/           # 대시보드
│   ├── solar/              # 태양광 현황
│   ├── ghg/                # 온실가스
│   ├── timeline/           # 타임라인
│   ├── infographic/        # 인포그래픽
│   ├── board/[slug]/       # 동적 게시판
│   └── carbon-tech/        # 연구자 네트워크
│
├── admin/                   # 관리자 페이지
│   ├── layout.tsx          # 관리자 레이아웃
│   ├── dashboard/          # 관리자 대시보드
│   ├── energy-data/        # 에너지 데이터 관리
│   ├── posts/              # 게시물 관리
│   ├── users/              # 사용자 관리
│   └── settings/           # 시스템 설정
│
├── api/                     # API 라우트
│   ├── auth/               # 인증 API
│   ├── energy-data/        # 에너지 데이터 API
│   ├── posts/              # 게시물 API
│   └── [...기타 API]/      # 기타 API 엔드포인트
│
└── sse/                     # Server-Sent Events
    └── dashboard/          # 실시간 대시보드 데이터
```

### 2.2 컴포넌트 구조
```
components/
├── admin/                   # 관리자 전용 컴포넌트
│   ├── AdminLayout.tsx     # 관리자 레이아웃
│   ├── AdminSidebar.tsx    # 사이드바 네비게이션
│   └── [...]/              # 기타 관리자 컴포넌트
│
├── charts/                  # 차트 컴포넌트
│   ├── EnergyChart.tsx     # 에너지 사용량 차트
│   ├── GHGChart.tsx        # 온실가스 차트
│   └── SolarChart.tsx      # 태양광 발전 차트
│
├── dashboard/               # 대시보드 컴포넌트
│   ├── EnergyStatus.tsx    # 에너지 현황
│   ├── WeatherWidget.tsx   # 날씨 위젯
│   └── [...]/              # 기타 대시보드 위젯
│
└── ui/                      # UI 기본 컴포넌트
    ├── Button.tsx          # 버튼
    ├── Card.tsx            # 카드
    └── [...]/              # 기타 UI 컴포넌트
```

## 3. 주요 기능 구현

### 3.1 실시간 데이터 스트리밍 (SSE)
```typescript
// app/sse/dashboard/route.ts
export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = () => {
        const data = {
          energy: getCurrentEnergyData(),
          timestamp: new Date().toISOString()
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };
      
      const interval = setInterval(sendData, 5000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 3.2 인증 시스템
```typescript
// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string, 
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: number): string {
  return jwt.sign(
    { userId, timestamp: Date.now() },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}
```

### 3.3 데이터베이스 연결
```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const dbQuery = {
  async query(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  },
  
  async get<T>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.query(text, params);
    return result.rows[0] || null;
  },
  
  async all<T>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.query(text, params);
    return result.rows;
  }
};
```

## 4. API 엔드포인트

### 4.1 인증 API
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### 4.2 에너지 데이터 API
- `GET /api/energy-data` - 에너지 데이터 조회
- `POST /api/energy-data` - 에너지 데이터 등록
- `PUT /api/energy-data/[id]` - 에너지 데이터 수정
- `DELETE /api/energy-data/[id]` - 에너지 데이터 삭제

### 4.3 게시물 API
- `GET /api/posts` - 게시물 목록
- `GET /api/posts/[id]` - 게시물 상세
- `POST /api/posts` - 게시물 작성
- `PUT /api/posts/[id]` - 게시물 수정
- `DELETE /api/posts/[id]` - 게시물 삭제

### 4.4 실시간 데이터 API
- `GET /api/realtime/energy` - 실시간 에너지 데이터
- `GET /api/realtime/weather` - 실시간 날씨 정보
- `GET /api/realtime/solar` - 실시간 태양광 발전량

## 5. 데이터베이스 스키마

### 5.1 주요 테이블
```sql
-- 에너지 데이터
CREATE TABLE energy_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  usage_amount DECIMAL(10,2),
  cost INTEGER,
  measurement_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 온실가스 데이터
CREATE TABLE ghg_data (
  id SERIAL PRIMARY KEY,
  building_id INTEGER REFERENCES buildings(id),
  emissions_amount DECIMAL(10,2),
  emissions_year INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 사용자
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 게시물
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  board_id INTEGER REFERENCES boards(id),
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'published',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 인덱스
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_energy_data_date ON energy_data(measurement_date);
CREATE INDEX idx_energy_data_building ON energy_data(building_id);
CREATE INDEX idx_posts_board ON posts(board_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
```

## 6. 테스트 및 디버깅

### 6.1 개발 서버 실행
```bash
npm run dev
# http://localhost:3000 접속
```

### 6.2 프로덕션 빌드
```bash
npm run build
npm start
```

### 6.3 데이터베이스 마이그레이션
```bash
# 스키마 확인
npm run migrate:check

# 마이그레이션 실행
npm run migrate

# 샘플 데이터 입력
node scripts/seed-data.js
```

### 6.4 일반적인 문제 해결
1. **데이터베이스 연결 오류**
   - DATABASE_URL 환경 변수 확인
   - PostgreSQL 서버 상태 확인
   - SSL 설정 확인

2. **빌드 오류**
   - Node.js 버전 확인 (18.0 이상)
   - 의존성 재설치: `rm -rf node_modules && npm install`
   - TypeScript 오류 확인: `npm run type-check`

3. **실시간 데이터 미작동**
   - SSE 엔드포인트 응답 확인
   - 네트워크 연결 상태 확인
   - 브라우저 콘솔 오류 확인

## 7. 배포

### 7.1 Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add DATABASE_URL
vercel env add JWT_SECRET
```

### 7.2 Docker 배포
```dockerfile
# Dockerfile 예시
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 7.3 성능 모니터링
- Vercel Analytics 사용
- 커스텀 로깅 구현
- 에러 추적 (Sentry 등)

## 8. 보안 가이드라인

### 8.1 환경 변수 관리
- `.env.local` 파일은 절대 커밋하지 않음
- 프로덕션 환경에서는 안전한 환경 변수 관리 서비스 사용
- 민감한 정보는 암호화하여 저장

### 8.2 API 보안
- 모든 API 엔드포인트에 적절한 인증 적용
- Rate limiting 구현
- CORS 정책 설정
- SQL Injection 방지

### 8.3 프론트엔드 보안
- XSS 방지를 위한 입력값 검증
- Content Security Policy 설정
- HTTPS 강제 사용

---

작성일: 2024년 6월 24일
버전: 1.0.0