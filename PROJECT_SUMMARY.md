# 서울대학교 탄소중립 캠퍼스 포털 프로젝트 요약

## 프로젝트 개요

### 프로젝트명
서울대학교 탄소중립 캠퍼스 포털

### 개발 기간
2024년 6월

### 프로젝트 목적
서울대학교의 2050 탄소중립 목표 달성을 위한 통합 정보 플랫폼 구축으로, 에너지 사용량 모니터링, 온실가스 배출 관리, 구성원 참여 촉진을 목표로 함

## 주요 기능

### 1. 실시간 모니터링 시스템
- **에너지 사용량**: 전력, 가스, 수도 실시간 모니터링
- **온실가스 배출량**: Scope 1, 2 배출량 추적 및 분석
- **태양광 발전**: 실시간 발전량 및 CO2 절감 효과
- **날씨 정보**: 현재 날씨 및 온습도 표시

### 2. 정보 제공 플랫폼
- **타임라인**: 2008-2024년 탄소중립 추진 역사
- **인포그래픽**: 시각화된 탄소중립 정보
- **자료실**: PDF 보고서 및 가이드라인 제공
- **공지사항**: 캠페인 및 이벤트 안내

### 3. 탄소중립 연구자 네트워크
- **연구자 디렉토리**: 분야별 전문가 정보
- **연구 분야 분류**:
  - 탄소중립 기술개발
  - 탄소중립 정책연구
  - 기후과학 연구
  - 기타 융합연구

### 4. 관리자 시스템
- **콘텐츠 관리**: 게시물, 페이지, 메뉴 관리
- **데이터 관리**: 에너지 데이터 입력 및 수정
- **사용자 관리**: 관리자 계정 관리
- **시스템 설정**: 사이트 설정 관리

## 기술 스택

### Frontend
- Next.js 15.3.3 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion
- Recharts (차트)
- TipTap (에디터)

### Backend
- Next.js API Routes
- PostgreSQL (Neon 호스팅)
- JWT 인증
- Server-Sent Events (SSE)

### DevOps
- Git 버전 관리
- npm 패키지 관리
- ESLint + TypeScript

## 프로젝트 구조

```
seoul_end/
└── nextjs-app/
    ├── app/              # Next.js 15 App Router
    │   ├── (public)/     # 공개 페이지
    │   ├── admin/        # 관리자 페이지
    │   ├── api/          # API 엔드포인트
    │   └── sse/          # 실시간 통신
    ├── components/       # React 컴포넌트
    ├── lib/             # 유틸리티 함수
    ├── public/          # 정적 자원
    ├── scripts/         # DB 스크립트
    ├── styles/          # 전역 스타일
    └── docs/            # 프로젝트 문서
```

## 데이터베이스 구조

### 주요 테이블 (17개)
1. **사용자**: users, user_sessions
2. **건물**: buildings, building_areas
3. **에너지**: energy_data, gas_data, water_data
4. **환경**: ghg_data, solar_data
5. **콘텐츠**: posts, pages, boards, categories
6. **기타**: menus, media, settings, link_posts

## 주요 성과

### 1. 기술적 성과
- Next.js 15 최신 버전 적용
- 실시간 데이터 스트리밍 구현
- 반응형 디자인 완성
- SEO 최적화

### 2. 기능적 성과
- 통합 대시보드 구축
- 자동화된 데이터 수집
- 직관적인 관리자 인터페이스
- 다양한 콘텐츠 타입 지원

### 3. 사용자 경험
- 빠른 페이지 로딩
- 모바일 최적화
- 접근성 고려
- 한국어 인터페이스

## 향후 계획

### 단기 (3개월)
- 모바일 앱 개발
- 추가 건물 데이터 연동
- 사용자 피드백 반영
- 성능 최적화

### 중기 (6개월)
- AI 기반 에너지 예측
- IoT 센서 연동
- 다국어 지원
- 대시보드 고도화

### 장기 (1년)
- 블록체인 탄소 크레딧
- 타 대학 연계
- 국제 표준 인증
- 오픈소스화

## 프로젝트 팀

- **개발**: 서울대학교 탄소중립 캠퍼스 사업단
- **기획**: 탄소중립 정책 연구팀
- **디자인**: UI/UX 디자인팀
- **데이터**: 에너지 관리팀

## 문서

1. [프로젝트 개요](nextjs-app/docs/PROJECT_OVERVIEW.md)
2. [기술 문서](nextjs-app/docs/TECHNICAL_DOCUMENTATION.md)
3. [API 문서](nextjs-app/docs/API_DOCUMENTATION.md)
4. [데이터베이스 스키마](nextjs-app/docs/DATABASE_SCHEMA.md)
5. [프로젝트 구조](nextjs-app/PROJECT_STRUCTURE.md)

---

작성일: 2024년 6월 24일
문의: carbon-neutral@snu.ac.kr