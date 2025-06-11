# Neon 데이터베이스 마이그레이션 설정

## 1단계: Neon 연결 정보 확인

Vercel Dashboard에서 다음을 확인하세요:
1. 프로젝트 설정 → Environment Variables
2. Neon 연결 정보를 다음 환경 변수로 설정:

```bash
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
POSTGRES_URL=postgresql://username:password@hostname/database?sslmode=require
```

## 2단계: 로컬에서 환경 변수 설정

```bash
# Neon 데이터베이스 연결 정보를 설정하세요
export POSTGRES_URL="postgresql://username:password@hostname/database?sslmode=require"
export SESSION_SECRET="super-secure-session-secret-key-here"
```

## 3단계: 데이터 마이그레이션 실행

```bash
# 데이터베이스 스키마 생성 및 데이터 마이그레이션
node migrate-to-postgres.js
```

## 4단계: Vercel 배포

```bash
# Vercel에 배포
npx vercel --prod
```

## 중요한 환경 변수들

### 필수 환경 변수 (Vercel에서 설정)
```
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
SESSION_SECRET=your-secure-secret
NODE_ENV=production
```

### 선택적 환경 변수
```
COOKIE_DOMAIN=.yourdomain.vercel.app
```

## 확인할 점

1. **Neon 데이터베이스 생성**: seoul-db가 생성되었는지 확인
2. **연결 문자열**: PostgreSQL 연결 문자열이 올바른지 확인
3. **SSL 설정**: `?sslmode=require` 포함되어 있는지 확인
4. **Vercel 프로젝트**: GitHub 연동이 되어있는지 확인

## 다음 단계

마이그레이션이 완료되면:
1. Vercel에서 자동으로 빌드 및 배포가 시작됩니다
2. https://seoul-*.vercel.app 에서 사이트 확인
3. 어드민 페이지에서 로그인 테스트 (admin/admin)
4. 데이터가 올바르게 마이그레이션되었는지 확인