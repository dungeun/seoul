'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import Header from '../../components/Header';

// TypeScript interfaces
interface MonthlyGeneration {
  month: string;
  generation: number;
}

interface YearlyData {
  total: number;
  monthlyAverage: number;
  carbonReduction: number;
  monthlyGeneration: MonthlyGeneration[];
}

interface YearlyTrendData {
  year: string;
  generation: number;
}

// 카운트업 애니메이션 컴포넌트
interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

const SolarPower: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const years: string[] = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016'];

  // 연도별 태양광 발전량 데이터
  const solarGenerationData: Record<string, YearlyData> = {
    '2024': {
      total: 1261489,
      monthlyAverage: 210248,
      carbonReduction: 587,
      monthlyGeneration: [
        { month: '1월', generation: 118456 },
        { month: '2월', generation: 142789 },
        { month: '3월', generation: 215634 },
        { month: '4월', generation: 234567 },
        { month: '5월', generation: 287923 },
        { month: '6월', generation: 245678 },
        { month: '7월', generation: 0 },
        { month: '8월', generation: 0 },
        { month: '9월', generation: 0 },
        { month: '10월', generation: 0 },
        { month: '11월', generation: 0 },
        { month: '12월', generation: 0 }
      ]
    },
    '2023': {
      total: 1782921,
      monthlyAverage: 148577,
      carbonReduction: 830,
      monthlyGeneration: [
        { month: '1월', generation: 108234 },
        { month: '2월', generation: 126789 },
        { month: '3월', generation: 189456 },
        { month: '4월', generation: 167890 },
        { month: '5월', generation: 198765 },
        { month: '6월', generation: 234567 },
        { month: '7월', generation: 256789 },
        { month: '8월', generation: 245678 },
        { month: '9월', generation: 189345 },
        { month: '10월', generation: 156234 },
        { month: '11월', generation: 89567 },
        { month: '12월', generation: 0 }
      ]
    },
    '2022': {
      total: 1654782,
      monthlyAverage: 137899,
      carbonReduction: 770,
      monthlyGeneration: [
        { month: '1월', generation: 95234 },
        { month: '2월', generation: 115789 },
        { month: '3월', generation: 178456 },
        { month: '4월', generation: 156890 },
        { month: '5월', generation: 187765 },
        { month: '6월', generation: 223567 },
        { month: '7월', generation: 245789 },
        { month: '8월', generation: 234678 },
        { month: '9월', generation: 178345 },
        { month: '10월', generation: 145234 },
        { month: '11월', generation: 78567 },
        { month: '12월', generation: 10468 }
      ]
    },
    '2021': {
      total: 1456932,
      monthlyAverage: 121411,
      carbonReduction: 679,
      monthlyGeneration: [
        { month: '1월', generation: 87234 },
        { month: '2월', generation: 98789 },
        { month: '3월', generation: 156456 },
        { month: '4월', generation: 134890 },
        { month: '5월', generation: 165765 },
        { month: '6월', generation: 198567 },
        { month: '7월', generation: 218789 },
        { month: '8월', generation: 207678 },
        { month: '9월', generation: 156345 },
        { month: '10월', generation: 123234 },
        { month: '11월', generation: 67567 },
        { month: '12월', generation: 41818 }
      ]
    },
    '2020': {
      total: 1298456,
      monthlyAverage: 108205,
      carbonReduction: 605,
      monthlyGeneration: [
        { month: '1월', generation: 78234 },
        { month: '2월', generation: 89789 },
        { month: '3월', generation: 134456 },
        { month: '4월', generation: 123890 },
        { month: '5월', generation: 145765 },
        { month: '6월', generation: 178567 },
        { month: '7월', generation: 198789 },
        { month: '8월', generation: 187678 },
        { month: '9월', generation: 134345 },
        { month: '10월', generation: 103234 },
        { month: '11월', generation: 56567 },
        { month: '12월', generation: 67342 }
      ]
    }
  };

  // 연간 태양광 발전량 추이 데이터
  const yearlyTrendData: YearlyTrendData[] = [
    { year: '2014', generation: 185247 },
    { year: '2015', generation: 789456 },
    { year: '2016', generation: 823456 },
    { year: '2017', generation: 1189567 },
    { year: '2018', generation: 1287654 },
    { year: '2019', generation: 1398765 },
    { year: '2020', generation: 1298456 },
    { year: '2021', generation: 1456932 },
    { year: '2022', generation: 1654782 },
    { year: '2023', generation: 1782921 },
    { year: '2024', generation: 1261489 }
  ];

  const currentYearData = solarGenerationData[selectedYear] || solarGenerationData['2024'];

  useEffect(() => {
    // 태양광 데이터 로딩 시뮬레이션
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <style>{`
          .main-wrapper {
            max-width: 1920px !important;
            margin: 0 auto !important;
            width: 100% !important;
          }
        `}</style>
        <div className="main-wrapper">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">태양광 데이터를 불러오는 중...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{`
          .main-wrapper {
            max-width: 1920px !important;
            margin: 0 auto !important;
            width: 100% !important;
          }
        `}</style>
        <div className="main-wrapper">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-red-600">{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      {/* CSS 스타일 추가 */}
      <style>{`
        /* Main wrapper 설정 */
        .main-wrapper {
          max-width: 1920px !important;
          margin: 0 auto !important;
          width: 100% !important;
        }
        
        /* Font Face */
        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }

        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
        }

        @font-face {
          font-family: 'SUIT';
          src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-ExtraBold.woff2') format('woff2');
          font-weight: 800;
          font-style: normal;
        }
        
        body {
          font-family: 'SUIT', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        
        /* 서브 타이틀 영역 */
        .sub-title-section {
          background-color: #F5FDE7;
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        
        /* 그라디언트 구들 */
        .gradient-circles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .gradient-circle {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.7;
        }
        
        .gradient-circle-1 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #FFE082 0%, #FFB74D 50%, rgba(255, 183, 77, 0.3) 100%);
          top: -50px;
          left: 10%;
          animation: float1 8s ease-in-out infinite;
        }
        
        .gradient-circle-2 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #FFF59D 0%, #FFEB3B 50%, rgba(255, 235, 59, 0.3) 100%);
          top: 50px;
          right: 15%;
          animation: float2 10s ease-in-out infinite;
        }
        
        .gradient-circle-3 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #FFCC02 0%, #FF9800 50%, rgba(255, 152, 0, 0.3) 100%);
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          animation: float3 12s ease-in-out infinite;
        }
        
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(0.9); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateX(-50%) translateY(0px) scale(1); }
          50% { transform: translateX(-50%) translateY(-25px) scale(1.05); }
        }
        
        .sub-title-content {
          text-align: center;
          position: relative;
          z-index: 2;
        }
        
        .sub-title-content h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #333;
          margin-bottom: 1rem;
        }
        
        .breadcrumb {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
          margin-top: 1rem;
        }
      `}</style>

      <Header currentPage="solar-power" />

      {/* Sub Title Section */}
      <section className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="sub-title-content">
          <h1 style={{ color: '#FF9800' }}>태양광 발전량</h1>
          <div className="breadcrumb">
            <span style={{ color: '#333' }}>홈</span>
            <span style={{ color: '#333' }}>&gt;</span>
            <span style={{ color: '#333' }}>에너지</span>
            <span style={{ color: '#333' }}>&gt;</span>
            <span style={{ color: '#FF9800', fontWeight: '600' }}>태양광 발전량</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 3rem' }}>
          
          {/* 1. 연도 선택 + 월별 차트 + 통계박스 */}
          <div style={{ marginBottom: '4rem' }}>
            {/* 연도 선택 버튼 - 3줄 3열 그리드 (온실가스와 비슷하게) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem',
              marginBottom: '3rem',
              maxWidth: '600px',
              margin: '0 auto 3rem auto'
            }}>
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #FF9800',
                    backgroundColor: selectedYear === year ? '#FF9800' : '#FFF3E0',
                    color: selectedYear === year ? 'white' : '#FF9800',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.9rem'
                  }}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* 월별 차트와 통계박스 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '3rem',
              alignItems: 'start'
            }}>
              {/* 월별 발전량 차트 */}
              <div style={{
                backgroundColor: 'transparent',
                borderRadius: '12px',
                padding: '2rem',
                border: '1px solid #e2e8f0'
              }}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={currentYearData.monthlyGeneration}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      label={{ value: '태양광 발전량(kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`, '발전량']}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="generation" 
                      fill="#FF9800" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 통계박스 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 태양광 발전량 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    color: 'white', 
                    backgroundColor: '#FF9800',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>태양광 발전량</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FF9800' }}>
                    <CountUp key={`total-${selectedYear}`} end={currentYearData.total} suffix=" kWh" />
                  </div>
                </div>

                {/* 월 평균 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    color: 'white', 
                    backgroundColor: '#FF9800',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>월 평균</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FF9800' }}>
                    <CountUp key={`average-${selectedYear}`} end={currentYearData.monthlyAverage} suffix=" kWh" />
                  </div>
                </div>

                {/* 온실가스 감축 효과 */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    color: 'white', 
                    backgroundColor: '#FF9800',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>온실가스 감축 효과</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FF9800' }}>
                    <CountUp key={`reduction-${selectedYear}`} end={currentYearData.carbonReduction} suffix=" t" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 연간 태양광 발전량 추이 */}
          <div style={{
            borderTop: '3px solid #FF9800',
            borderRadius: '12px',
            padding: '3rem 0',
            backgroundColor: 'transparent'
          }}>
            <h3 style={{
              color: '#FF9800',
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '3rem',
              textAlign: 'center'
            }}>연간 태양광 발전량</h3>

            <div style={{
              backgroundColor: 'transparent',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid #e2e8f0',
              margin: '0 3rem'
            }}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={yearlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    label={{ value: '태양광 발전량(kWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString()} kWh`, '연간 발전량']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="generation" 
                    stroke="#FF9800" 
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#FF9800' }}
                    activeDot={{ r: 8, fill: '#E65100' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#f8f9fa', padding: '3rem 0', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={{ color: '#333', marginBottom: '1rem' }}>서울대학교 탄소중립 캠퍼스</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>08826 서울특별시 관악구 관악로 1</p>
              <p style={{ color: '#666', lineHeight: '1.6' }}>전화: 02-880-5114</p>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>바로가기</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="/greenhouse-gas" style={{ color: '#666', textDecoration: 'none' }}>온실가스 현황</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/energy" style={{ color: '#666', textDecoration: 'none' }}>에너지 관리</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="/solar-power" style={{ color: '#666', textDecoration: 'none' }}>태양광 발전</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#333', marginBottom: '1rem' }}>관련 사이트</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#666', textDecoration: 'none' }}>서울대학교</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#666', textDecoration: 'none' }}>환경부</a></li>
                <li style={{ marginBottom: '0.5rem' }}><a href="#" style={{ color: '#666', textDecoration: 'none' }}>한국환경공단</a></li>
              </ul>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>&copy; 2024 Seoul National University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SolarPower;