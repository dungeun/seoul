// 게시판 타입을 banner로 업데이트하는 스크립트
// 브라우저 콘솔 또는 API 테스트 도구에서 실행

async function updateBoardType() {
  console.log('Updating green_campus_group board type to "banner"...');
  
  try {
    // 1. 먼저 현재 게시판 정보 가져오기
    const boardResponse = await fetch('/api/boards/green_campus_group');
    const boardData = await boardResponse.json();
    console.log('Current board data:', boardData);
    
    // 2. 게시판 타입을 banner로 업데이트
    const updateResponse = await fetch(`/api/boards/green_campus_group`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: boardData.name,
        slug: boardData.slug,
        description: boardData.description,
        type: 'banner' // 타입을 banner로 설정
      })
    });
    
    const updatedBoard = await updateResponse.json();
    console.log('Updated board:', updatedBoard);
    
    if (updateResponse.ok) {
      console.log('✅ Board type successfully updated to "banner"');
    } else {
      console.error('❌ Failed to update board type:', updatedBoard);
    }
    
    return updatedBoard;
  } catch (error) {
    console.error('Error updating board type:', error);
  }
}

// 샘플 배너 데이터 추가 함수
async function addSampleBanners(boardId) {
  console.log('Adding sample banners...');
  
  const sampleBanners = [
    {
      board_id: boardId,
      title: '그린캠퍼스 홍보 배너 1',
      subtitle: '지속가능한 미래를 위한 첫걸음',
      image_url: '/img/banner1.jpg',
      link_url: '/board/green_campus_group/1',
      order_index: 1
    },
    {
      board_id: boardId,
      title: '환경 보호 캠페인',
      subtitle: '우리가 만드는 깨끗한 캠퍼스',
      image_url: '/img/banner2.jpg',
      link_url: '/board/green_campus_group/2',
      order_index: 2
    },
    {
      board_id: boardId,
      title: '에너지 절약 프로젝트',
      subtitle: '작은 실천이 만드는 큰 변화',
      image_url: '/img/banner3.jpg',
      link_url: '/board/green_campus_group/3',
      order_index: 3
    }
  ];
  
  for (const banner of sampleBanners) {
    try {
      const response = await fetch('/api/board-banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banner)
      });
      
      const result = await response.json();
      if (response.ok) {
        console.log('✅ Banner added:', result);
      } else {
        console.error('❌ Failed to add banner:', result);
      }
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  }
}

// 전체 설정 실행 함수
async function setupBoardWithBanners() {
  console.log('=== Setting up board with banners ===');
  
  // 1. 게시판 타입 업데이트
  const updatedBoard = await updateBoardType();
  
  if (!updatedBoard || !updatedBoard.id) {
    console.error('Failed to update board');
    return;
  }
  
  // 2. 샘플 배너 추가 (선택사항)
  const addBanners = confirm('Do you want to add sample banners?');
  if (addBanners) {
    await addSampleBanners(updatedBoard.id);
  }
  
  console.log('=== Setup complete! ===');
  console.log('Refresh the page to see the changes');
}

// 브라우저 콘솔에서 실행:
// setupBoardWithBanners()