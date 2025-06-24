// API 테스트 스크립트
// 브라우저 콘솔에서 실행하여 API 동작을 확인할 수 있습니다

// 1. green_campus_group 게시판 정보 확인
async function testBoardInfo() {
  console.log('=== Testing Board Info API ===');
  try {
    const response = await fetch('/api/boards/green_campus_group');
    const data = await response.json();
    console.log('Board Info:', data);
    console.log('Board Type:', data.type);
    console.log('Board ID:', data.id);
    return data;
  } catch (error) {
    console.error('Error fetching board info:', error);
  }
}

// 2. 배너 정보 확인
async function testBannerAPI(boardId) {
  console.log('=== Testing Banner API ===');
  try {
    const response = await fetch(`/api/board-banners?board_id=${boardId}`);
    const data = await response.json();
    console.log('Banners:', data);
    console.log('Active Banners:', data.filter(b => b.is_active));
    return data;
  } catch (error) {
    console.error('Error fetching banners:', error);
  }
}

// 3. 전체 테스트 실행
async function runFullTest() {
  console.log('Starting full banner test...');
  
  // Step 1: Get board info
  const boardInfo = await testBoardInfo();
  
  if (!boardInfo) {
    console.error('Failed to get board info');
    return;
  }
  
  // Step 2: Check board type
  if (boardInfo.type !== 'banner') {
    console.warn(`Board type is '${boardInfo.type}', not 'banner'`);
    console.log('Board needs to be set to type "banner" for banners to display');
  }
  
  // Step 3: Check banners
  const banners = await testBannerAPI(boardInfo.id);
  
  if (!banners || banners.length === 0) {
    console.warn('No banners found for this board');
  } else {
    const activeBanners = banners.filter(b => b.is_active);
    console.log(`Found ${banners.length} total banners, ${activeBanners.length} active`);
  }
  
  console.log('Test complete!');
}

// 브라우저 콘솔에서 실행:
// runFullTest()