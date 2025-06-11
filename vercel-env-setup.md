# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

Vercel Dashboard에서 다음 환경 변수들을 설정해야 합니다:

### 데이터베이스 설정
```
POSTGRES_URL=postgres://username:password@hostname:port/database?sslmode=require
DATABASE_URL=postgres://username:password@hostname:port/database?sslmode=require
```

### 세션 설정
```
SESSION_SECRET=your-super-secure-session-secret-key-here
NODE_ENV=production
```

### 쿠키 설정 (선택사항)
```
COOKIE_DOMAIN=.yourdomain.com
```

## Vercel Postgres 설정 단계

### 1. Vercel Postgres 생성
1. Vercel Dashboard → Storage → Create Database
2. PostgreSQL 선택
3. 데이터베이스 이름 입력 (예: seoul-university-cms)
4. 리전 선택 (가까운 지역)

### 2. 연결 정보 확인
- 생성된 데이터베이스에서 Connection String 복사
- Format: `postgres://username:password@hostname:port/database?sslmode=require`

### 3. 환경 변수 설정
1. Vercel Dashboard → Project Settings → Environment Variables
2. 위의 환경 변수들 추가
3. Production, Preview, Development 환경 모두 체크

### 4. 데이터 마이그레이션
배포 전에 로컬에서 데이터 마이그레이션 실행:
```bash
# 환경 변수 설정
export POSTGRES_URL="your-postgres-connection-string"

# 마이그레이션 실행
node migrate-to-postgres.js
```

### 5. 배포
```bash
vercel --prod
```

## 주의사항

1. **PostgreSQL 연결 제한**: Vercel의 무료 플랜은 연결 수에 제한이 있습니다
2. **파일 업로드**: 업로드된 파일은 Vercel Functions에서 영구 저장되지 않으므로 별도 스토리지(S3 등) 검토 필요
3. **세션 스토리지**: PostgreSQL 기반 세션 저장소 사용
4. **CORS**: 프로덕션 환경에서는 도메인 기반 CORS 설정 필요

## 트러블슈팅

### 데이터베이스 연결 오류
- 연결 문자열 확인
- SSL 설정 확인 (`sslmode=require`)
- 네트워크 방화벽 확인

### 세션 오류
- SESSION_SECRET 환경 변수 확인
- 쿠키 도메인 설정 확인
- HTTPS 설정 확인

### 파일 업로드 오류
- Vercel Functions의 파일 크기 제한 (50MB) 확인
- 임시 디렉토리 권한 확인