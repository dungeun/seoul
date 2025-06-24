# 서울대학교 탄소중립 캠퍼스 포털

서울대학교의 탄소중립 목표 달성을 위한 통합 정보 플랫폼입니다.

## 🌱 주요 기능

- **실시간 에너지 모니터링**: 전력, 가스, 수도 사용량 실시간 추적
- **온실가스 배출량 관리**: 건물별, 연도별 배출량 분석
- **태양광 발전 현황**: 실시간 발전량 및 CO2 절감 효과
- **탄소중립 연구자 네트워크**: 분야별 연구자 디렉토리
- **정보 공유**: 공지사항, 자료실, 인포그래픽

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- PostgreSQL 데이터베이스
- npm 또는 yarn

### 설치

```bash
# 저장소 클론
git clone [repository-url]
cd nextjs-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일 편집
```

### 개발 서버 실행

```bash
npm run dev
# http://localhost:3000 접속
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 📁 프로젝트 구조

```
nextjs-app/
├── app/                # Next.js App Router
├── components/         # React 컴포넌트
├── lib/               # 유틸리티 함수
├── public/            # 정적 파일
├── scripts/           # 스크립트
└── docs/              # 문서
```

## 📚 문서

- [프로젝트 개요](docs/PROJECT_OVERVIEW.md)
- [기술 문서](docs/TECHNICAL_DOCUMENTATION.md)
- [API 문서](docs/API_DOCUMENTATION.md)
- [데이터베이스 스키마](docs/DATABASE_SCHEMA.md)

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **인증**: JWT
- **실시간**: Server-Sent Events (SSE)
- **차트**: Recharts
- **에디터**: TipTap

## 📊 주요 화면

### 대시보드
실시간 에너지 사용량 및 날씨 정보를 한눈에 확인

### 온실가스 현황
연도별, 건물별 온실가스 배출량 추이 분석

### 탄소중립 연구자 네트워크
분야별 연구자 정보 및 연구 현황

### 관리자 페이지
콘텐츠 관리, 데이터 입력, 시스템 설정

## 🔐 관리자 접속

```
URL: /admin
기본 계정: admin / password
```

⚠️ 프로덕션 환경에서는 반드시 비밀번호를 변경하세요.

## 📝 라이선스

이 프로젝트는 서울대학교 탄소중립 캠퍼스 사업의 일환으로 개발되었습니다.

---

개발: 서울대학교 탄소중립 캠퍼스 사업단
문의: carbon-neutral@snu.ac.kr