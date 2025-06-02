const express = require('express');
const router = express.Router();

// 인포그래픽 게시판 더미 데이터
const infographicPosts = [
  {
    id: 1,
    title: '2024년 온실가스 배출량 현황',
    description: '서울대학교 캠퍼스의 2024년 온실가스 배출량 현황을 시각적으로 표현한 인포그래픽입니다.',
    imageUrl: '/img/infographic1.svg',
    pdfUrl: '/downloads/infographic1.pdf',
    createdAt: new Date('2024-01-15'),
    views: 1245,
    category: '온실가스',
    content: '2024년 서울대학교의 온실가스 배출량은 총 143,200tCO2eq를 기록했습니다. 이는 전년 대비 3.2% 증가한 수치로, 주요 원인은 여름철 폭염으로 인한 냉방 시설 사용 증가입니다. Scope 1(직접배출) 17.9%, Scope 2(간접배출) 82.1%로 구성되어 있으며, 관악캠퍼스가 전체 배출량의 78%를 차지하고 있습니다. 배출량 허용치인 65,069t를 초과하여 약 78,131t의 초과 배출량이 발생했습니다.'
  },
  {
    id: 2,
    title: '탄소중립 캠퍼스 로드맵 2030',
    description: '2030년 탄소중립 달성을 위한 서울대학교의 로드맵과 주요 정책을 소개합니다.',
    imageUrl: '/img/infographic2.svg',
    pdfUrl: '/downloads/infographic2.pdf',
    createdAt: new Date('2024-02-10'),
    views: 987,
    category: '정책',
    content: '서울대학교는 2030년까지 탄소중립을 달성하기 위한 단계별 계획을 수립했습니다. 2024년 현재 온실가스 배출량 기준선 설정, 2026년까지 재생에너지 비중 30% 확대, 2028년까지 에너지 효율 50% 개선, 2030년 탄소중립 달성을 목표로 하고 있습니다. 주요 전략으로는 태양광 발전 시설 확대, 건물 에너지 효율화, 친환경 교통 시스템 구축, 탄소 흡수원 확충 등이 있습니다.'
  },
  {
    id: 3,
    title: '재생에너지 활용 현황',
    description: '캠퍼스 내 태양광 발전소와 재생에너지 활용 현황을 한눈에 볼 수 있는 인포그래픽입니다.',
    imageUrl: '/img/infographic3.svg',
    pdfUrl: '/downloads/infographic3.pdf',
    createdAt: new Date('2024-03-05'),
    views: 1567,
    category: '재생에너지',
    content: '서울대학교는 현재 총 2.5MW 규모의 태양광 발전 시설을 운영하고 있으며, 연간 3,200MWh의 재생에너지를 생산하고 있습니다. 주요 설치 위치는 중앙도서관 옥상(500kW), 학생회관 옥상(400kW), 공대 건물 옥상(600kW), 기숙사 옥상(800kW), 체육관 옥상(200kW) 등입니다. 2024년 기준 전체 전력 사용량의 8.5%를 재생에너지로 충당하고 있으며, 2030년까지 30%로 확대할 계획입니다.'
  },
  {
    id: 4,
    title: '에너지 효율화 사업 성과',
    description: '건물 에너지 효율화 사업의 주요 성과와 절약 효과를 시각적으로 보여줍니다.',
    imageUrl: '/img/placeholder.jpg',
    pdfUrl: '/downloads/infographic4.pdf',
    createdAt: new Date('2024-04-12'),
    views: 876,
    category: '에너지',
    content: 'LED 조명 교체, 고효율 설비 도입, 건물 단열재 개선 등을 통해 연간 15% 이상의 에너지 절약 효과를 달성했습니다. 주요 성과로는 조명 에너지 40% 절약, 냉난방 에너지 20% 절약, 전력 사용량 총 12% 감소 등이 있습니다. 이를 통해 연간 약 15억원의 에너지 비용을 절약하고 있으며, CO2 배출량을 연간 2,500t 감축하는 효과를 거두고 있습니다.'
  },
  {
    id: 5,
    title: '친환경 교통 정책',
    description: '전기차 충전소 확대와 친환경 교통 정책의 효과를 분석한 인포그래픽입니다.',
    imageUrl: '/img/placeholder.jpg',
    pdfUrl: '/downloads/infographic5.pdf',
    createdAt: new Date('2024-05-20'),
    views: 654,
    category: '교통',
    content: '캠퍼스 내 전기차 충전소를 20개소로 확대하고, 친환경 셔틀버스를 도입하여 교통 부문 탄소 배출량을 30% 감축했습니다. 전기 셔틀버스 10대 운영, 자전거 대여 시스템 구축, 보행로 개선을 통해 개인 차량 이용을 줄이고 있습니다. 또한 교직원 및 학생들의 친환경 교통 이용률이 2022년 45%에서 2024년 67%로 크게 증가했습니다.'
  },
  {
    id: 6,
    title: '녹색캠퍼스 조성 프로젝트',
    description: '캠퍼스 내 녹지 공간 확대와 생태계 복원 프로젝트의 진행 상황을 소개합니다.',
    imageUrl: '/img/placeholder.jpg',
    pdfUrl: '/downloads/infographic6.pdf',
    createdAt: new Date('2024-06-15'),
    views: 789,
    category: '환경',
    content: '새로운 녹지 공간 5만㎡를 조성하고, 생태연못과 야생동물 서식지를 복원하여 캠퍼스 생물다양성을 증진시켰습니다. 주요 사업으로는 관악산 연결 생태통로 조성, 빗물 정원 설치, 토종 식물 복원, 야생동물 먹이터 조성 등이 있습니다. 이를 통해 캠퍼스 내 CO2 흡수량을 연간 500t 증가시키고, 도시 열섬 효과를 완화하는 효과를 거두고 있습니다.'
  }
];

// 인포그래픽 게시판 목록 API
router.get('/api/boards/infographic/posts', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const posts = infographicPosts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, endIndex);

    const totalPages = Math.ceil(infographicPosts.length / limit);

    res.json({
      posts: posts,
      currentPage: page,
      totalPages: totalPages,
      totalPosts: infographicPosts.length
    });
  } catch (error) {
    console.error('인포그래픽 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 인포그래픽 상세 조회 API
router.get('/api/boards/infographic/posts/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const post = infographicPosts.find(p => p.id === id);

    if (!post) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    post.views += 1;

    res.json(post);
  } catch (error) {
    console.error('인포그래픽 상세 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 온실가스 통계 API (기존)
router.get('/api/public/greenhouse-gas-stats', (req, res) => {
  try {
    // 더미 데이터 반환
    const stats = {
      totalEmission: 143200,
      monthlyAverage: 11933,
      status: 'success'
    };
    res.json(stats);
  } catch (error) {
    console.error('온실가스 통계 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router; 