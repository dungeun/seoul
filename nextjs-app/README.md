# 🌟 서울대학교 에너지 대시보드

실시간 에너지 사용량 및 온실가스 배출량 모니터링을 위한 Next.js 14 기반 대시보드 시스템

## ✨ 주요 기능

### 📊 공개 대시보드
- **홈페이지 (/)**: 전체 에너지 및 온실가스 데이터 요약
- **에너지 분석 (/energy)**: 전기, 가스, 수도 사용량 상세 분석
- **온실가스 분석 (/greenhouse-gas)**: CO₂ 배출량 추이 및 감축 성과
- **태양광 분석 (/solar-power)**: 태양광 발전량 및 효율성 데이터

### 🔧 관리자 대시보드
- **관리자 홈 (/admin)**: 시스템 상태 및 통계 모니터링
- **에너지 데이터 관리 (/admin/energy)**: CRUD 기능을 통한 데이터 관리
- **실시간 모니터링**: Server-Sent Events를 통한 실시간 데이터 업데이트

### 🚀 기술적 특징
- **실시간 데이터**: SSE를 통한 30초-2분 간격 자동 업데이트
- **차트 시스템**: Recharts 기반 인터랙티브 차트 4종
- **반응형 디자인**: 모바일/태블릿/데스크톱 완전 지원
- **타입 안전성**: TypeScript 완전 적용
- **성능 최적화**: SSR/SSG 및 코드 스플리팅

## 🛠️ 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 18** (클라이언트 컴포넌트)
- **TypeScript** (타입 안전성)
- **Tailwind CSS** (스타일링)
- **Framer Motion** (애니메이션)
- **Recharts** (차트 라이브러리)

### Backend
- **Next.js API Routes** (서버리스 API)
- **Better-SQLite3** (데이터베이스)
- **SWR** (데이터 페칭 및 캐싱)
- **Server-Sent Events** (실시간 스트리밍)

### 개발 도구
- **ESLint** (코드 품질)
- **TypeScript** (타입 체크)
- **PostCSS** (CSS 처리)

## 📦 설치 및 실행

### 필수 조건
- Node.js 18.17 이상
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install

# 또는
yarn install
```

### 환경 변수 설정
`.env.local` 파일을 생성하고 다음 변수를 설정:

```env
DATABASE_PATH=/path/to/your/database.db
```

### 개발 서버 실행
```bash
# 개발 모드
npm run dev

# 또는
yarn dev
```

서버가 실행되면 http://localhost:3000 에서 확인 가능합니다.

### 프로덕션 빌드
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 프로젝트 구조

```
nextjs-app/
├── app/                          # Next.js App Router
│   ├── admin/                    # 관리자 페이지
│   │   ├── energy/              # 에너지 데이터 관리
│   │   └── page.tsx             # 관리자 대시보드
│   ├── api/                      # API Routes
│   │   ├── energy/              # 에너지 데이터 API
│   │   ├── solar/               # 태양광 데이터 API
│   │   ├── buildings/           # 건물 데이터 API
│   │   ├── public/              # 공개 통계 API
│   │   └── realtime/            # 실시간 SSE API
│   ├── energy/                   # 에너지 분석 페이지
│   ├── greenhouse-gas/           # 온실가스 분석 페이지
│   ├── solar-power/              # 태양광 분석 페이지
│   └── page.tsx                  # 홈페이지
├── components/                   # 재사용 컴포넌트
│   ├── admin/                    # 관리자 컴포넌트
│   └── charts/                   # 차트 컴포넌트
├── lib/                          # 유틸리티 라이브러리
│   ├── hooks/                    # 커스텀 훅
│   ├── api.ts                    # API 클라이언트
│   ├── database.ts               # 데이터베이스 연결
│   └── utils.ts                  # 유틸리티 함수
├── types/                        # TypeScript 타입 정의
└── README.md                     # 프로젝트 문서
```

## 🔌 API 엔드포인트

### 에너지 데이터
- `GET /api/energy` - 에너지 데이터 조회
- `POST /api/energy` - 새 에너지 데이터 생성
- `PUT /api/energy/[id]` - 에너지 데이터 수정
- `DELETE /api/energy/[id]` - 에너지 데이터 삭제

### 태양광 데이터
- `GET /api/solar` - 태양광 데이터 조회
- `POST /api/solar` - 새 태양광 데이터 생성

### 건물 데이터
- `GET /api/buildings` - 건물 목록 조회

### 공개 통계
- `GET /api/public/energy-stats` - 에너지 통계
- `GET /api/public/greenhouse-gas-stats` - 온실가스 통계

### 실시간 데이터
- `GET /api/realtime/sse` - Server-Sent Events 스트림

## 📊 데이터베이스 스키마

### energy_data 테이블
```sql
CREATE TABLE energy_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  electricity DECIMAL(10,2),
  gas DECIMAL(10,2),
  water DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(building_name, year, month)
);
```

### solar_data 테이블
```sql
CREATE TABLE solar_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  building_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  generation DECIMAL(10,2),
  capacity DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### buildings 테이블
```sql
CREATE TABLE buildings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT,
  type TEXT,
  area DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 컴포넌트 사용법

### 차트 컴포넌트
```tsx
import EnergyChart from '@/components/charts/EnergyChart';

// 에너지 사용량 차트
<EnergyChart
  type="line"
  dataType="all"
  year={2024}
  building="본관"
  title="월별 에너지 사용량"
/>
```

### 관리자 레이아웃
```tsx
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminPage() {
  return (
    <AdminLayout>
      <div>관리자 페이지 내용</div>
    </AdminLayout>
  );
}
```

## 🚀 배포

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel

# 환경 변수 설정
vercel env add DATABASE_PATH
```

### Docker 배포
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 성능 최적화

- **SSR/SSG**: 정적 페이지 사전 렌더링
- **코드 스플리팅**: 자동 청크 분할
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **데이터 캐싱**: SWR을 통한 스마트 캐싱
- **번들 분석**: `npm run build`로 최적화 확인

## 🔧 개발 가이드

### 새 차트 컴포넌트 추가
1. `components/charts/` 폴더에 새 컴포넌트 생성
2. `BaseChart` 컴포넌트를 확장하여 구현
3. TypeScript 타입 정의 추가

### 새 API 엔드포인트 추가
1. `app/api/` 폴더에 새 라우트 생성
2. 데이터베이스 쿼리 함수 구현
3. 타입 정의 및 에러 처리 추가

## 🐛 문제 해결

### 데이터베이스 연결 오류
```bash
# 데이터베이스 파일 경로 확인
DATABASE_PATH=/correct/path/to/database.db

# 권한 확인
chmod 644 path/to/database.db
```

### 빌드 에러
```bash
# 타입 체크
npm run type-check

# 린트 확인
npm run lint

# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트 관련 문의: admin@seoul.ac.kr

---

© 2024 서울대학교 에너지 대시보드. 모든 권리 보유.
