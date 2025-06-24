# 서울대학교 탄소중립 캠퍼스 포털 프로젝트 개요

## 1. 프로젝트 소개

### 1.1 프로젝트명
서울대학교 탄소중립 캠퍼스 포털 (Seoul National University Carbon Neutral Campus Portal)

### 1.2 프로젝트 목적
- 서울대학교의 탄소중립 목표 달성을 위한 통합 정보 플랫폼 구축
- 실시간 에너지 사용량 모니터링 및 온실가스 배출량 추적
- 구성원 참여 촉진 및 탄소중립 실천 문화 확산
- 연구자 네트워크 구축 및 정보 공유 활성화

### 1.3 주요 대상
- 서울대학교 구성원 (학생, 교직원, 연구자)
- 탄소중립 정책 입안자 및 관리자
- 일반 시민 및 타 대학 관계자

## 2. 기술 스택

### 2.1 프론트엔드
- **프레임워크**: Next.js 15.3.3 (App Router)
- **언어**: TypeScript 5.x
- **스타일링**: Tailwind CSS 3.4.17
- **UI 라이브러리**: 
  - Headless UI 2.2.4
  - Heroicons 2.2.0
- **애니메이션**: Framer Motion 12.16.0
- **차트**: Recharts 2.15.3
- **에디터**: TipTap 2.14.0
- **상태관리**: React Hooks, SWR 2.3.3

### 2.2 백엔드
- **런타임**: Node.js
- **API**: Next.js API Routes
- **데이터베이스**: PostgreSQL (Neon 호스팅)
- **ORM**: pg 드라이버 직접 사용
- **인증**: JWT (jsonwebtoken 9.0.2)
- **암호화**: bcrypt 6.0.0
- **실시간 통신**: Server-Sent Events (SSE)

### 2.3 개발 도구
- **패키지 매니저**: npm
- **린터**: ESLint 8.x
- **타입 체크**: TypeScript
- **이미지 최적화**: Sharp 0.34.2
- **파일 처리**: xlsx 0.18.5, csv-parse 5.6.0
- **스크린샷**: Puppeteer 24.10.2

## 3. 주요 기능

### 3.1 대시보드 및 모니터링
- **실시간 에너지 현황**: 전력, 가스, 수도 사용량 실시간 표시
- **온실가스 배출량**: 연도별, 건물별 배출량 추적
- **태양광 발전**: 실시간 발전량 및 누적 통계
- **날씨 정보**: 현재 날씨 및 예보 연동

### 3.2 정보 제공
- **인포그래픽**: 탄소중립 관련 시각화 자료
- **타임라인**: 2008-2024년 주요 성과 및 이벤트
- **자료실**: PDF 문서 및 보고서 다운로드
- **공지사항**: 캠페인 및 이벤트 안내

### 3.3 연구자 네트워크
- **탄소중립 기술개발**: 분야별 연구자 디렉토리
- **연구 분야 분류**:
  - 수소 분야
  - 탄소 포집 및 저장 (CCUS)
  - 친환경 자동차 및 배터리
  - 무탄소 전력 공급
  - 저탄소 공정기술
  - 기타 분야

### 3.4 관리자 기능
- **콘텐츠 관리**: 게시물, 페이지, 메뉴 관리
- **데이터 입력**: 에너지 사용량 및 온실가스 데이터 관리
- **사용자 관리**: 관리자 계정 및 권한 관리
- **미디어 관리**: 이미지 및 파일 업로드
- **시스템 설정**: 사이트 정보 및 환경 설정

## 4. 시스템 아키텍처

### 4.1 디렉토리 구조
```
nextjs-app/
├── app/                    # Next.js App Router
│   ├── (public)/          # 공개 페이지
│   ├── admin/             # 관리자 페이지
│   ├── api/               # API 엔드포인트
│   └── sse/               # 실시간 통신
├── components/            # 재사용 컴포넌트
├── lib/                   # 유틸리티 함수
├── public/                # 정적 자원
├── scripts/               # 데이터베이스 스크립트
└── styles/                # 전역 스타일
```

### 4.2 데이터베이스 스키마
- **에너지 데이터**: energy_data, gas_data, water_data, solar_data
- **건물 정보**: buildings, building_areas
- **콘텐츠**: posts, pages, menus, categories
- **사용자**: users, user_sessions
- **미디어**: media
- **설정**: settings

### 4.3 API 구조
- RESTful API 설계
- 일관된 응답 형식
- 에러 처리 표준화
- CORS 정책 적용

## 5. 보안 및 성능

### 5.1 보안
- JWT 기반 인증
- bcrypt 암호화
- SQL Injection 방지
- XSS 방어
- CORS 설정

### 5.2 성능 최적화
- 이미지 최적화 (Sharp)
- 정적 생성 (SSG)
- 서버 사이드 렌더링 (SSR)
- 캐싱 전략
- 코드 스플리팅

## 6. 배포 및 운영

### 6.1 개발 환경
```bash
npm install
npm run dev
```

### 6.2 프로덕션 빌드
```bash
npm run build
npm start
```

### 6.3 데이터베이스 마이그레이션
```bash
npm run migrate
npm run migrate:check
```

### 6.4 환경 변수
- DATABASE_URL: PostgreSQL 연결 문자열
- JWT_SECRET: JWT 암호화 키
- NEXT_PUBLIC_API_URL: API 기본 URL

## 7. 향후 계획

### 7.1 기능 확장
- 모바일 앱 개발
- AI 기반 에너지 예측
- 블록체인 탄소 크레딧
- IoT 센서 연동 확대

### 7.2 성능 개선
- 실시간 데이터 처리 최적화
- 대용량 데이터 처리
- 분산 시스템 구축

### 7.3 사용자 경험
- 다국어 지원
- 접근성 개선
- 개인화 기능
- 소셜 기능 추가

## 8. 참고 자료

### 8.1 기술 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 8.2 프로젝트 관련
- 프로젝트 구조: `PROJECT_STRUCTURE.md`
- API 문서: `docs/API_DOCUMENTATION.md`
- 데이터베이스 스키마: `docs/DATABASE_SCHEMA.md`

---

작성일: 2024년 6월 20일
버전: 1.0.0