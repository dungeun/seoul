'use client';

import BoardTheme from '@/components/BoardTheme';

const emissionReduceData = [
  {
    id: 1,
    title: '온실가스 감축 목표 및 전략',
    content: `
      <p>서울대학교는 2050 탄소중립 달성을 위해 단계별 온실가스 감축 목표를 설정하였습니다.</p>
      <ul class="list-disc list-inside mt-4 space-y-2">
        <li>2030년까지 2018년 대비 40% 감축</li>
        <li>2040년까지 2018년 대비 70% 감축</li>
        <li>2050년까지 탄소중립 달성</li>
      </ul>
      <p class="mt-4">이를 위해 에너지 효율화, 재생에너지 확대, 친환경 교통 체계 구축 등 다양한 정책을 추진하고 있습니다.</p>
    `,
    imageUrl: '/img/2024.02_2050탄소중립캠퍼스기본구상.png'
  },
  {
    id: 2,
    title: '건물 에너지 효율화 사업',
    content: `
      <p>캠퍼스 내 주요 건물들의 에너지 효율을 개선하여 온실가스 배출량을 줄이고 있습니다.</p>
      <ul class="list-disc list-inside mt-4 space-y-2">
        <li>LED 조명 교체 사업 완료</li>
        <li>고효율 냉난방 시설 도입</li>
        <li>건물 단열 성능 개선</li>
        <li>스마트 에너지 관리 시스템 구축</li>
      </ul>
    `,
    imageUrl: '/img/2018.07_대기전력제로연구실조성.png'
  },
  {
    id: 3,
    title: '재생에너지 확대',
    content: `
      <p>태양광 발전 시설을 지속적으로 확대하여 재생에너지 비중을 늘려가고 있습니다.</p>
      <ul class="list-disc list-inside mt-4 space-y-2">
        <li>캠퍼스 마이크로그리드 구축</li>
        <li>건물 옥상 태양광 패널 설치</li>
        <li>에너지 저장 시설(ESS) 도입</li>
        <li>스마트 그리드 연계 시스템 운영</li>
      </ul>
    `,
    imageUrl: '/img/2015.10_캠퍼스마이크로그리드구축시작.jpg'
  },
  {
    id: 4,
    title: '친환경 교통 체계',
    content: `
      <p>캠퍼스 내 친환경 교통수단을 확대하여 운송 부문 온실가스 배출을 줄이고 있습니다.</p>
      <ul class="list-disc list-inside mt-4 space-y-2">
        <li>전기버스 도입</li>
        <li>자전거 도로 확충</li>
        <li>전기차 충전 인프라 구축</li>
        <li>대중교통 이용 활성화</li>
      </ul>
    `
  },
  {
    id: 5,
    title: '폐기물 감축 및 자원 순환',
    content: `
      <p>폐기물 발생량을 줄이고 자원 순환 체계를 구축하여 환경 부담을 최소화하고 있습니다.</p>
      <ul class="list-disc list-inside mt-4 space-y-2">
        <li>일회용품 사용 금지</li>
        <li>분리수거 체계 개선</li>
        <li>음식물 쓰레기 감량</li>
        <li>재활용품 활용 확대</li>
      </ul>
    `,
    imageUrl: '/img/2022.10_일회용기없는대학축제.jpg'
  }
];

export default function EmissionReducePage() {
  return (
    <BoardTheme
      pageTitle="온실가스 감축 사업"
      breadcrumb={['홈', '그린캠퍼스', '온실가스 감축']}
      leftSideTitle="감축 사업"
      items={emissionReduceData}
    />
  );
}