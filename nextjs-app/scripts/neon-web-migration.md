# Neon DB 웹 콘솔에서 마이그레이션 실행하기

## 방법 1: Neon 웹 콘솔 사용

1. [Neon Console](https://console.neon.tech) 접속
2. 프로젝트 선택 (lingering-shape-89739543)
3. SQL Editor 탭 클릭
4. 아래 SQL 복사해서 실행

## 방법 2: psql 명령어 사용

```bash
# 로컬에서 psql로 직접 연결
psql "postgres://neondb_owner:npg_hOR5FfXqWJB6@ep-ancient-paper-a1vxdgn4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# 또는 환경변수 사용
export DATABASE_URL="postgres://neondb_owner:npg_hOR5FfXqWJB6@ep-ancient-paper-a1vxdgn4-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
psql $DATABASE_URL
```

## 방법 3: npm 스크립트 사용

```bash
cd nextjs-app

# 마이그레이션 실행
npm run migrate

# 스키마 확인
npm run migrate:check
```

## 실행할 SQL (순서대로)

### 1. 기본 테이블 및 컬럼 수정
```sql
-- db-fix-missing-schema.sql 내용 복사
```

### 2. 수집 로그 테이블
```sql
-- db-migration-collection-logs.sql 내용 복사
```

## 주의사항

- Neon은 PostgreSQL 기반이므로 모든 PostgreSQL 문법 지원
- SSL 연결 필수 (sslmode=require)
- 트랜잭션 지원으로 안전한 마이그레이션 가능
- 웹 콘솔에서는 여러 SQL문을 한번에 실행 가능