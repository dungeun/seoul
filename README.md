# 초경량 미니 CMS

극소수 사용자를 위한 초경량 CMS - 복잡한 기능 없이 핵심만 구현

## 기술 스택

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express + SQLite
- **Editor**: Toast UI Editor
- **Charts**: Recharts

## 시작하기

### 개발 모드 (2개 서버)

#### 1. 백엔드 실행
```bash
cd server
npm install
node init-db.js  # 최초 1회만 - 데이터베이스 초기화
npm run dev      # http://localhost:3001
```

#### 2. 프론트엔드 실행 (별도 터미널)
```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

### 프로덕션 모드 (1개 서버)

```bash
cd server
npm run build:start  # React 빌드 후 Express 서버만 실행
```

http://localhost:3001 에서 전체 애플리케이션이 실행됩니다.

## 기본 로그인 정보

- 아이디: admin
- 비밀번호: admin123

## 주요 기능

- 대시보드 통계 (차트)
- 게시판 관리
- 자료실 (파일 업로드/다운로드)
- 카테고리 관리
- Toast UI Editor 통합
- Recharts 차트 시각화

## 배포

### 로컬 프로덕션 배포

1. 클라이언트 빌드: `cd server && npm run build`
2. 서버 실행: `npm start`
3. 단일 포트(3001)에서 전체 애플리케이션 제공

### Render 클라우드 배포

이 프로젝트는 Render.com에서 자동 배포되도록 설정되어 있습니다.

#### render.yaml 설정:
- **Build Command**: 
  - React 19 호환성을 위해 `--legacy-peer-deps` 플래그 사용
  - 클라이언트 빌드 → 서버 설치 → DB 초기화 → 관리자 생성
- **Start Command**: Express 서버 실행 (API + React 정적 파일 제공)
- **환경 변수**:
  - `NODE_ENV`: production
  - `SESSION_SECRET`: Render가 자동 생성
  - `PORT`: Render가 자동 제공

#### 배포 절차:
1. GitHub에 코드 푸시
2. Render에서 리포지토리 연결
3. render.yaml 설정 자동 적용
4. 빌드 완료 대기 (약 5-10분)
5. 제공된 URL로 접속

#### 주의사항:
- SQLite DB는 배포시마다 초기화됨 (영구 데이터는 외부 DB 사용 권장)
- 업로드 파일은 재배포시 삭제됨 (외부 스토리지 사용 권장)
- xlsx 라이브러리가 client/package.json에 포함되어 있어야 함