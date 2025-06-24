# 게시판 배너 디버깅 가이드

## 문제 설명
`/board/green_campus_group` 게시판에서 배너가 표시되지 않는 문제

## 확인 사항

### 1. 게시판 타입 확인
게시판이 'banner' 타입으로 설정되어 있어야 배너가 표시됩니다.

**브라우저 콘솔에서 실행:**
```javascript
// 게시판 정보 확인
fetch('/api/boards/green_campus_group')
  .then(res => res.json())
  .then(data => {
    console.log('Board Info:', data);
    console.log('Board Type:', data.type);
    console.log('Board ID:', data.id);
  });
```

### 2. 배너 데이터 확인
게시판 ID를 사용하여 배너 데이터를 확인합니다.

**브라우저 콘솔에서 실행:**
```javascript
// 먼저 게시판 ID 가져오기
fetch('/api/boards/green_campus_group')
  .then(res => res.json())
  .then(board => {
    // 배너 데이터 확인
    return fetch(`/api/board-banners?board_id=${board.id}`);
  })
  .then(res => res.json())
  .then(banners => {
    console.log('All Banners:', banners);
    console.log('Active Banners:', banners.filter(b => b.is_active));
  });
```

### 3. 네트워크 요청 확인
1. 브라우저 개발자 도구 열기 (F12)
2. Network 탭으로 이동
3. 페이지 새로고침
4. 다음 요청들이 있는지 확인:
   - `/api/boards/green_campus_group` - 200 OK
   - `/api/board-banners?board_id=X` - 200 OK (게시판 타입이 banner인 경우만)

### 4. 콘솔 에러 확인
Console 탭에서 JavaScript 에러가 있는지 확인

## 문제 해결 방법

### 방법 1: 게시판 타입을 'banner'로 변경
```javascript
// 브라우저 콘솔에서 실행
async function updateBoardToBanner() {
  // 1. 현재 게시판 정보 가져오기
  const boardRes = await fetch('/api/boards/green_campus_group');
  const board = await boardRes.json();
  
  // 2. 타입을 banner로 업데이트
  const updateRes = await fetch('/api/boards/green_campus_group', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...board,
      type: 'banner'
    })
  });
  
  const result = await updateRes.json();
  console.log('Updated board:', result);
  return result;
}

updateBoardToBanner();
```

### 방법 2: 배너 데이터 추가
```javascript
// 브라우저 콘솔에서 실행
async function addTestBanner() {
  // 1. 게시판 ID 가져오기
  const boardRes = await fetch('/api/boards/green_campus_group');
  const board = await boardRes.json();
  
  // 2. 테스트 배너 추가
  const bannerRes = await fetch('/api/board-banners', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board_id: board.id,
      title: '테스트 배너',
      subtitle: '테스트 서브타이틀',
      image_url: '/img/test-banner.jpg',
      link_url: '#',
      order_index: 1,
      is_active: true
    })
  });
  
  const result = await bannerRes.json();
  console.log('Added banner:', result);
  return result;
}

addTestBanner();
```

### 방법 3: 데이터베이스 직접 수정 (서버에서)
PostgreSQL 접속 후:
```sql
-- 게시판 타입 확인
SELECT id, name, slug, type FROM boards WHERE slug = 'green_campus_group';

-- 게시판 타입을 banner로 변경
UPDATE boards SET type = 'banner' WHERE slug = 'green_campus_group';

-- 배너 데이터 확인
SELECT * FROM board_banners WHERE board_id = (
  SELECT id FROM boards WHERE slug = 'green_campus_group'
);

-- 샘플 배너 추가
INSERT INTO board_banners (board_id, title, subtitle, image_url, link_url, order_index, is_active)
VALUES (
  (SELECT id FROM boards WHERE slug = 'green_campus_group'),
  '그린캠퍼스 홍보',
  '지속가능한 미래를 위한 첫걸음',
  '/img/banner1.jpg',
  '/board/green_campus_group/1',
  1,
  true
);
```

## 예상되는 문제 원인

1. **게시판 타입이 'banner'가 아님**
   - page.tsx의 65번 라인에서 `boardData.type === 'banner'` 조건을 확인
   - 게시판 타입이 'list' 또는 다른 값으로 설정되어 있을 가능성

2. **배너 데이터가 없음**
   - board_banners 테이블에 해당 게시판의 배너가 없을 수 있음

3. **배너가 비활성 상태**
   - is_active가 false로 설정되어 있을 수 있음

4. **이미지 경로 문제**
   - image_url이 잘못된 경로를 가리키고 있을 수 있음

## 추가 디버깅 팁

1. **컴포넌트 상태 확인**
   React Developer Tools를 사용하여 BoardPage 컴포넌트의 state 확인:
   - board.type 값
   - banners 배열 내용

2. **API 응답 로깅**
   page.tsx 파일의 66-71번 라인에 console.log 추가:
   ```javascript
   if (boardData.type === 'banner') {
     console.log('Board is banner type, fetching banners...');
     const bannersRes = await fetch(`/api/board-banners?board_id=${boardData.id}`);
     console.log('Banner API response status:', bannersRes.status);
     if (bannersRes.ok) {
       const bannersData = await bannersRes.json();
       console.log('Raw banner data:', bannersData);
       setBanners(bannersData.filter((b: BoardBanner) => b.is_active));
     }
   }
   ```

3. **이미지 로드 확인**
   Network 탭에서 이미지 요청이 실패하는지 확인

## 빠른 해결 스크립트

```javascript
// 모든 문제를 한 번에 해결하는 스크립트
async function fixBannerIssue() {
  try {
    // 1. 게시판 정보 가져오기
    const boardRes = await fetch('/api/boards/green_campus_group');
    const board = await boardRes.json();
    console.log('Current board:', board);
    
    // 2. 타입이 banner가 아니면 업데이트
    if (board.type !== 'banner') {
      console.log('Updating board type to banner...');
      const updateRes = await fetch('/api/boards/green_campus_group', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...board, type: 'banner' })
      });
      const updatedBoard = await updateRes.json();
      console.log('Board updated:', updatedBoard);
    }
    
    // 3. 배너 확인
    const bannersRes = await fetch(`/api/board-banners?board_id=${board.id}`);
    const banners = await bannersRes.json();
    console.log('Current banners:', banners);
    
    // 4. 활성 배너가 없으면 추가
    if (!banners.some(b => b.is_active)) {
      console.log('No active banners found, adding test banner...');
      const newBannerRes = await fetch('/api/board-banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: board.id,
          title: '그린캠퍼스 테스트 배너',
          subtitle: '배너가 정상적으로 표시됩니다',
          image_url: '/img/placeholder.png',
          link_url: '#',
          order_index: 1,
          is_active: true
        })
      });
      const newBanner = await newBannerRes.json();
      console.log('New banner added:', newBanner);
    }
    
    console.log('✅ Fix complete! Please refresh the page.');
  } catch (error) {
    console.error('❌ Error fixing banner issue:', error);
  }
}

// 실행: fixBannerIssue()
```

## 확인 완료 후
페이지를 새로고침하여 배너가 표시되는지 확인하세요.