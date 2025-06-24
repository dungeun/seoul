# API 문서 (API Documentation)

## 1. API 개요

### 1.1 기본 정보
- **Base URL**: `http://localhost:3000/api` (개발)
- **Format**: JSON
- **인증**: JWT Bearer Token
- **Content-Type**: `application/json`

### 1.2 응답 형식
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

### 1.3 에러 응답
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

## 2. 인증 (Authentication)

### 2.1 로그인
```http
POST /api/auth/login
```

**요청 본문:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@snu.ac.kr",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2.2 로그아웃
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

### 2.3 현재 사용자 정보
```http
GET /api/auth/me
Authorization: Bearer {token}
```

## 3. 에너지 데이터 (Energy Data)

### 3.1 에너지 데이터 목록
```http
GET /api/energy-data?year=2024&month=6&building_id=1
```

**쿼리 파라미터:**
- `year` (선택): 연도
- `month` (선택): 월
- `building_id` (선택): 건물 ID
- `page` (선택): 페이지 번호
- `limit` (선택): 페이지당 항목 수

**응답:**
```json
{
  "results": [
    {
      "id": 1,
      "building_id": 1,
      "building_name": "본관",
      "usage_amount": 15234.56,
      "cost": 2345678,
      "measurement_date": "2024-06-01",
      "created_at": "2024-06-02T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "totalPages": 10
  }
}
```

### 3.2 에너지 데이터 생성
```http
POST /api/energy-data
Authorization: Bearer {token}
```

**요청 본문:**
```json
{
  "building_id": 1,
  "usage_amount": 15234.56,
  "cost": 2345678,
  "measurement_date": "2024-06-01"
}
```

### 3.3 에너지 데이터 수정
```http
PUT /api/energy-data/{id}
Authorization: Bearer {token}
```

### 3.4 에너지 데이터 삭제
```http
DELETE /api/energy-data/{id}
Authorization: Bearer {token}
```

## 4. 실시간 데이터 (Realtime Data)

### 4.1 실시간 에너지 현황
```http
GET /api/realtime/energy
```

**응답:**
```json
{
  "electricity": {
    "current": 1234.56,
    "unit": "kW",
    "change": 5.2,
    "status": "normal"
  },
  "gas": {
    "current": 234.12,
    "unit": "㎥",
    "change": -2.1,
    "status": "normal"
  },
  "water": {
    "current": 456.78,
    "unit": "톤",
    "change": 0.5,
    "status": "normal"
  },
  "timestamp": "2024-06-24T10:30:00Z"
}
```

### 4.2 실시간 날씨 정보
```http
GET /api/realtime/weather
```

**응답:**
```json
{
  "temperature": 25.5,
  "humidity": 65,
  "weather": "맑음",
  "icon": "sunny",
  "timestamp": "2024-06-24T10:30:00Z"
}
```

### 4.3 실시간 태양광 발전
```http
GET /api/realtime/solar
```

**응답:**
```json
{
  "current_power": 156.78,
  "daily_energy": 892.34,
  "monthly_energy": 15678.90,
  "co2_reduction": 7.89,
  "status": "generating",
  "timestamp": "2024-06-24T10:30:00Z"
}
```

## 5. 게시물 (Posts)

### 5.1 게시물 목록
```http
GET /api/posts?board_id=1&page=1&limit=10&search=탄소중립
```

**쿼리 파라미터:**
- `board_id` (선택): 게시판 ID
- `category_id` (선택): 카테고리 ID
- `status` (선택): 상태 (published, draft)
- `search` (선택): 검색어
- `page` (선택): 페이지 번호
- `limit` (선택): 페이지당 항목 수

### 5.2 게시물 상세
```http
GET /api/posts/{id}
```

**응답:**
```json
{
  "id": 1,
  "title": "2024년 탄소중립 실천 가이드",
  "content": "<p>게시물 내용...</p>",
  "board_id": 1,
  "board_name": "공지사항",
  "category_id": 2,
  "category_name": "캠페인",
  "author_id": 1,
  "author_name": "관리자",
  "status": "published",
  "view_count": 234,
  "attachment_filename": "guide.pdf",
  "attachment_filepath": "/uploads/guide.pdf",
  "created_at": "2024-06-01T10:00:00Z",
  "updated_at": "2024-06-01T10:00:00Z"
}
```

### 5.3 게시물 작성
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**폼 데이터:**
- `title`: 제목
- `content`: 내용
- `board_id`: 게시판 ID
- `category_id`: 카테고리 ID (선택)
- `status`: 상태 (published/draft)
- `attachment`: 첨부파일 (선택)

### 5.4 게시물 수정
```http
PUT /api/posts/{id}
Authorization: Bearer {token}
```

### 5.5 게시물 삭제
```http
DELETE /api/posts/{id}
Authorization: Bearer {token}
```

### 5.6 조회수 증가
```http
POST /api/posts/{id}/view
```

## 6. 온실가스 데이터 (GHG Data)

### 6.1 온실가스 배출량 조회
```http
GET /api/ghg-data?year=2024&building_id=1
```

**응답:**
```json
{
  "results": [
    {
      "id": 1,
      "building_id": 1,
      "building_name": "본관",
      "scope1": 123.45,
      "scope2": 234.56,
      "total_emissions": 358.01,
      "emissions_year": 2024,
      "created_at": "2024-06-01T10:00:00Z"
    }
  ],
  "summary": {
    "total_scope1": 1234.56,
    "total_scope2": 2345.67,
    "total_emissions": 3580.23,
    "change_from_last_year": -5.2
  }
}
```

### 6.2 온실가스 데이터 등록
```http
POST /api/ghg-data
Authorization: Bearer {token}
```

## 7. 태양광 데이터 (Solar Data)

### 7.1 태양광 발전 데이터 조회
```http
GET /api/solar-data?date=2024-06-24&building_id=1
```

**응답:**
```json
{
  "results": [
    {
      "id": 1,
      "building_id": 1,
      "building_name": "공학관",
      "generation_amount": 156.78,
      "measurement_datetime": "2024-06-24T14:00:00Z",
      "weather": "맑음",
      "temperature": 25.5
    }
  ],
  "summary": {
    "daily_total": 892.34,
    "monthly_total": 15678.90,
    "yearly_total": 123456.78,
    "co2_reduction": 61.73
  }
}
```

## 8. 건물 관리 (Buildings)

### 8.1 건물 목록
```http
GET /api/buildings
```

**응답:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "본관",
      "code": "MAIN",
      "area": 15234.56,
      "floors": 5,
      "construction_year": 1946,
      "has_solar": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 8.2 건물 상세 정보
```http
GET /api/buildings/{id}
```

## 9. 사용자 관리 (Users)

### 9.1 사용자 목록 (관리자 전용)
```http
GET /api/users
Authorization: Bearer {admin_token}
```

### 9.2 사용자 생성
```http
POST /api/users
Authorization: Bearer {admin_token}
```

**요청 본문:**
```json
{
  "username": "newuser",
  "email": "newuser@snu.ac.kr",
  "password": "password123",
  "role": "user"
}
```

### 9.3 사용자 수정
```http
PUT /api/users/{id}
Authorization: Bearer {admin_token}
```

### 9.4 사용자 삭제
```http
DELETE /api/users/{id}
Authorization: Bearer {admin_token}
```

## 10. 링크 게시물 (Link Posts)

### 10.1 연구자 네트워크 조회
```http
GET /api/link-posts?main_category=탄소중립 기술개발&sub_category=수소 분야
```

**응답:**
```json
{
  "results": [
    {
      "id": 1,
      "name": "홍길동",
      "department": "화학생물공학부",
      "url": "https://example.com",
      "screenshot_url": "/uploads/screenshots/1.png",
      "main_category": "탄소중립 기술개발",
      "sub_category": "수소 분야",
      "order_index": 1,
      "status": "published"
    }
  ]
}
```

### 10.2 링크 추가
```http
POST /api/link-posts
Authorization: Bearer {token}
```

## 11. Server-Sent Events (SSE)

### 11.1 대시보드 실시간 스트림
```http
GET /sse/dashboard
```

**이벤트 형식:**
```
event: energy
data: {"electricity":1234.56,"gas":234.12,"water":456.78,"timestamp":"2024-06-24T10:30:00Z"}

event: weather
data: {"temperature":25.5,"humidity":65,"weather":"맑음"}

event: solar
data: {"current_power":156.78,"daily_energy":892.34}
```

**클라이언트 연결 예시:**
```javascript
const eventSource = new EventSource('/sse/dashboard');

eventSource.addEventListener('energy', (e) => {
  const data = JSON.parse(e.data);
  updateEnergyDisplay(data);
});

eventSource.addEventListener('error', (e) => {
  console.error('SSE Error:', e);
  eventSource.close();
});
```

## 12. 파일 업로드

### 12.1 이미지 업로드
```http
POST /api/upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**폼 데이터:**
- `file`: 이미지 파일 (jpg, png, gif, webp)
- `type`: 업로드 타입 (post, banner, thumbnail)

**응답:**
```json
{
  "url": "/uploads/images/2024/06/image.jpg",
  "filename": "image.jpg",
  "size": 123456,
  "width": 1920,
  "height": 1080
}
```

### 12.2 문서 업로드
```http
POST /api/upload/document
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**폼 데이터:**
- `file`: 문서 파일 (pdf, doc, docx, xls, xlsx, hwp)

**제한사항:**
- 이미지: 최대 10MB
- PDF: 최대 50MB
- 기타 문서: 최대 10MB

## 13. 통계 API

### 13.1 에너지 사용 통계
```http
GET /api/stats/energy?year=2024&building_id=1
```

**응답:**
```json
{
  "monthly": [
    {"month": 1, "electricity": 12345.67, "gas": 2345.67, "water": 345.67},
    {"month": 2, "electricity": 11234.56, "gas": 2234.56, "water": 334.56}
  ],
  "yearly_total": {
    "electricity": 145678.90,
    "gas": 27890.12,
    "water": 4123.45
  },
  "comparison": {
    "last_year": 156789.01,
    "change_percent": -7.1
  }
}
```

### 13.2 온실가스 배출 통계
```http
GET /api/stats/ghg?start_year=2020&end_year=2024
```

## 14. 에러 코드

| 코드 | 설명 |
|------|------|
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 필요 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스 없음 |
| 409 | Conflict - 중복 리소스 |
| 422 | Unprocessable Entity - 유효성 검사 실패 |
| 500 | Internal Server Error - 서버 오류 |

## 15. Rate Limiting

- 인증된 사용자: 분당 100 요청
- 비인증 사용자: 분당 20 요청
- 파일 업로드: 시간당 50 요청

---

작성일: 2024년 6월 24일
버전: 1.0.0