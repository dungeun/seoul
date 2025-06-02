import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import Header from '../../components/Header';

// 카운트업 애니메이션 컴포넌트
const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
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

const GreenhouseGas = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('2024');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/public/greenhouse-gas-stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('온실가스 통계 데이터 로딩 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <>
        <style>{`
          * {
            max-width: 1920px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .container, .max-w-6xl, .max-w-7xl, .max-w-full {
            max-width: 1920px !important;
            margin: 0 auto !important;
          }
          body > *, #root > * {
            max-width: 1920px !important;
            margin: 0 auto !important;
          }
        `}</style>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">온실가스 데이터를 불러오는 중...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{`
          * {
            max-width: 1920px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .container, .max-w-6xl, .max-w-7xl, .max-w-full {
            max-width: 1920px !important;
            margin: 0 auto !important;
          }
          body > *, #root > * {
            max-width: 1920px !important;
            margin: 0 auto !important;
          }
        `}</style>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-red-600">{error}</div>
        </div>
      </>
    );
  }

  const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008'];

  // 연도별 데이터
  const yearlyData = {
    '2024': {
      total: 143200,
      monthlyAverage: 11933,
      monthlyEmissions: [
        { month: '1월', emission: 15200 },
        { month: '2월', emission: 14100 },
        { month: '3월', emission: 11800 },
        { month: '4월', emission: 9800 },
        { month: '5월', emission: 9200 },
        { month: '6월', emission: 10800 },
        { month: '7월', emission: 12300 },
        { month: '8월', emission: 13200 },
        { month: '9월', emission: 12800 },
        { month: '10월', emission: 10100 },
        { month: '11월', emission: 11400 },
        { month: '12월', emission: 12600 }
      ]
    },
    '2023': {
      total: 139500,
      monthlyAverage: 11625,
      monthlyEmissions: [
        { month: '1월', emission: 14800 },
        { month: '2월', emission: 13800 },
        { month: '3월', emission: 11500 },
        { month: '4월', emission: 9600 },
        { month: '5월', emission: 8900 },
        { month: '6월', emission: 10500 },
        { month: '7월', emission: 12000 },
        { month: '8월', emission: 12900 },
        { month: '9월', emission: 12500 },
        { month: '10월', emission: 9800 },
        { month: '11월', emission: 11100 },
        { month: '12월', emission: 12100 }
      ]
    },
    '2022': {
      total: 141800,
      monthlyAverage: 11817,
      monthlyEmissions: [
        { month: '1월', emission: 15000 },
        { month: '2월', emission: 14000 },
        { month: '3월', emission: 11700 },
        { month: '4월', emission: 9700 },
        { month: '5월', emission: 9000 },
        { month: '6월', emission: 10700 },
        { month: '7월', emission: 12200 },
        { month: '8월', emission: 13100 },
        { month: '9월', emission: 12700 },
        { month: '10월', emission: 10000 },
        { month: '11월', emission: 11300 },
        { month: '12월', emission: 12400 }
      ]
    },
    '2021': {
      total: 135600,
      monthlyAverage: 11300,
      monthlyEmissions: [
        { month: '1월', emission: 14200 },
        { month: '2월', emission: 13200 },
        { month: '3월', emission: 11100 },
        { month: '4월', emission: 9200 },
        { month: '5월', emission: 8500 },
        { month: '6월', emission: 10000 },
        { month: '7월', emission: 11500 },
        { month: '8월', emission: 12400 },
        { month: '9월', emission: 12000 },
        { month: '10월', emission: 9300 },
        { month: '11월', emission: 10600 },
        { month: '12월', emission: 11500 }
      ]
    },
    '2020': {
      total: 139200,
      monthlyAverage: 11600,
      monthlyEmissions: [
        { month: '1월', emission: 14600 },
        { month: '2월', emission: 13600 },
        { month: '3월', emission: 11400 },
        { month: '4월', emission: 9500 },
        { month: '5월', emission: 8800 },
        { month: '6월', emission: 10300 },
        { month: '7월', emission: 11800 },
        { month: '8월', emission: 12700 },
        { month: '9월', emission: 12300 },
        { month: '10월', emission: 9600 },
        { month: '11월', emission: 10900 },
        { month: '12월', emission: 11900 }
      ]
    },
    '2019': {
      total: 139800,
      monthlyAverage: 11650,
      monthlyEmissions: [
        { month: '1월', emission: 14700 },
        { month: '2월', emission: 13700 },
        { month: '3월', emission: 11500 },
        { month: '4월', emission: 9600 },
        { month: '5월', emission: 8900 },
        { month: '6월', emission: 10400 },
        { month: '7월', emission: 11900 },
        { month: '8월', emission: 12800 },
        { month: '9월', emission: 12400 },
        { month: '10월', emission: 9700 },
        { month: '11월', emission: 11000 },
        { month: '12월', emission: 12000 }
      ]
    },
    '2018': {
      total: 143500,
      monthlyAverage: 11958,
      monthlyEmissions: [
        { month: '1월', emission: 15100 },
        { month: '2월', emission: 14100 },
        { month: '3월', emission: 11800 },
        { month: '4월', emission: 9800 },
        { month: '5월', emission: 9100 },
        { month: '6월', emission: 10700 },
        { month: '7월', emission: 12300 },
        { month: '8월', emission: 13200 },
        { month: '9월', emission: 12800 },
        { month: '10월', emission: 10100 },
        { month: '11월', emission: 11400 },
        { month: '12월', emission: 12500 }
      ]
    },
    '2017': {
      total: 140800,
      monthlyAverage: 11733,
      monthlyEmissions: [
        { month: '1월', emission: 14800 },
        { month: '2월', emission: 13800 },
        { month: '3월', emission: 11600 },
        { month: '4월', emission: 9700 },
        { month: '5월', emission: 9000 },
        { month: '6월', emission: 10600 },
        { month: '7월', emission: 12100 },
        { month: '8월', emission: 13000 },
        { month: '9월', emission: 12600 },
        { month: '10월', emission: 9900 },
        { month: '11월', emission: 11200 },
        { month: '12월', emission: 12300 }
      ]
    },
    '2016': {
      total: 135200,
      monthlyAverage: 11267,
      monthlyEmissions: [
        { month: '1월', emission: 14200 },
        { month: '2월', emission: 13200 },
        { month: '3월', emission: 11100 },
        { month: '4월', emission: 9300 },
        { month: '5월', emission: 8600 },
        { month: '6월', emission: 10100 },
        { month: '7월', emission: 11600 },
        { month: '8월', emission: 12500 },
        { month: '9월', emission: 12100 },
        { month: '10월', emission: 9400 },
        { month: '11월', emission: 10700 },
        { month: '12월', emission: 11800 }
      ]
    },
    '2015': {
      total: 125600,
      monthlyAverage: 10467,
      monthlyEmissions: [
        { month: '1월', emission: 13200 },
        { month: '2월', emission: 12200 },
        { month: '3월', emission: 10300 },
        { month: '4월', emission: 8600 },
        { month: '5월', emission: 7900 },
        { month: '6월', emission: 9300 },
        { month: '7월', emission: 10800 },
        { month: '8월', emission: 11600 },
        { month: '9월', emission: 11200 },
        { month: '10월', emission: 8700 },
        { month: '11월', emission: 9900 },
        { month: '12월', emission: 10900 }
      ]
    },
    '2014': {
      total: 118200,
      monthlyAverage: 9850,
      monthlyEmissions: [
        { month: '1월', emission: 12400 },
        { month: '2월', emission: 11500 },
        { month: '3월', emission: 9700 },
        { month: '4월', emission: 8100 },
        { month: '5월', emission: 7400 },
        { month: '6월', emission: 8700 },
        { month: '7월', emission: 10100 },
        { month: '8월', emission: 10900 },
        { month: '9월', emission: 10500 },
        { month: '10월', emission: 8200 },
        { month: '11월', emission: 9300 },
        { month: '12월', emission: 10200 }
      ]
    },
    '2013': {
      total: 118500,
      monthlyAverage: 9875,
      monthlyEmissions: [
        { month: '1월', emission: 12500 },
        { month: '2월', emission: 11600 },
        { month: '3월', emission: 9800 },
        { month: '4월', emission: 8200 },
        { month: '5월', emission: 7500 },
        { month: '6월', emission: 8800 },
        { month: '7월', emission: 10200 },
        { month: '8월', emission: 11000 },
        { month: '9월', emission: 10600 },
        { month: '10월', emission: 8300 },
        { month: '11월', emission: 9400 },
        { month: '12월', emission: 10300 }
      ]
    },
    '2012': {
      total: 118300,
      monthlyAverage: 9858,
      monthlyEmissions: [
        { month: '1월', emission: 12400 },
        { month: '2월', emission: 11500 },
        { month: '3월', emission: 9700 },
        { month: '4월', emission: 8100 },
        { month: '5월', emission: 7400 },
        { month: '6월', emission: 8700 },
        { month: '7월', emission: 10100 },
        { month: '8월', emission: 10900 },
        { month: '9월', emission: 10500 },
        { month: '10월', emission: 8200 },
        { month: '11월', emission: 9300 },
        { month: '12월', emission: 10200 }
      ]
    },
    '2011': {
      total: 115200,
      monthlyAverage: 9600,
      monthlyEmissions: [
        { month: '1월', emission: 12100 },
        { month: '2월', emission: 11200 },
        { month: '3월', emission: 9400 },
        { month: '4월', emission: 7900 },
        { month: '5월', emission: 7200 },
        { month: '6월', emission: 8500 },
        { month: '7월', emission: 9800 },
        { month: '8월', emission: 10600 },
        { month: '9월', emission: 10200 },
        { month: '10월', emission: 7900 },
        { month: '11월', emission: 9000 },
        { month: '12월', emission: 9900 }
      ]
    },
    '2010': {
      total: 114500,
      monthlyAverage: 9542,
      monthlyEmissions: [
        { month: '1월', emission: 12000 },
        { month: '2월', emission: 11100 },
        { month: '3월', emission: 9300 },
        { month: '4월', emission: 7800 },
        { month: '5월', emission: 7100 },
        { month: '6월', emission: 8400 },
        { month: '7월', emission: 9700 },
        { month: '8월', emission: 10500 },
        { month: '9월', emission: 10100 },
        { month: '10월', emission: 7800 },
        { month: '11월', emission: 8900 },
        { month: '12월', emission: 9800 }
      ]
    },
    '2009': {
      total: 112800,
      monthlyAverage: 9400,
      monthlyEmissions: [
        { month: '1월', emission: 11800 },
        { month: '2월', emission: 10900 },
        { month: '3월', emission: 9100 },
        { month: '4월', emission: 7600 },
        { month: '5월', emission: 6900 },
        { month: '6월', emission: 8200 },
        { month: '7월', emission: 9500 },
        { month: '8월', emission: 10300 },
        { month: '9월', emission: 9900 },
        { month: '10월', emission: 7600 },
        { month: '11월', emission: 8700 },
        { month: '12월', emission: 9600 }
      ]
    },
    '2008': {
      total: 110500,
      monthlyAverage: 9208,
      monthlyEmissions: [
        { month: '1월', emission: 11600 },
        { month: '2월', emission: 10700 },
        { month: '3월', emission: 8900 },
        { month: '4월', emission: 7400 },
        { month: '5월', emission: 6700 },
        { month: '6월', emission: 8000 },
        { month: '7월', emission: 9300 },
        { month: '8월', emission: 10100 },
        { month: '9월', emission: 9700 },
        { month: '10월', emission: 7400 },
        { month: '11월', emission: 8500 },
        { month: '12월', emission: 9400 }
      ]
    }
  };

  // 선택된 연도의 데이터
  const currentYearData = yearlyData[selectedYear] || yearlyData['2023'];

  // 연간 온실가스 배출량 데이터 (2010-2024)
  const yearlyEmissionData = [
    { year: '2010', emission: 114500 },
    { year: '2011', emission: 115200 },
    { year: '2012', emission: 118300 },
    { year: '2013', emission: 118500 },
    { year: '2014', emission: 118200 },
    { year: '2015', emission: 125600 },
    { year: '2016', emission: 135200 },
    { year: '2017', emission: 140800 },
    { year: '2018', emission: 143500 },
    { year: '2019', emission: 139800 },
    { year: '2020', emission: 139200 },
    { year: '2021', emission: 135600 },
    { year: '2022', emission: 141800 },
    { year: '2023', emission: 139500 },
    { year: '2024', emission: 143200 }
  ];

  // 단위면적당 배출량 데이터
  const unitAreaEmissionData = [
    { year: '2010', emission: 115000 },
    { year: '2011', emission: 115500 },
    { year: '2012', emission: 118600 },
    { year: '2013', emission: 118800 },
    { year: '2014', emission: 118500 },
    { year: '2015', emission: 125900 },
    { year: '2016', emission: 135500 },
    { year: '2017', emission: 141100 },
    { year: '2018', emission: 143800 },
    { year: '2019', emission: 140100 },
    { year: '2020', emission: 139500 },
    { year: '2021', emission: 135900 },
    { year: '2022', emission: 142100 },
    { year: '2023', emission: 139800 },
    { year: '2024', emission: 143500 }
  ];

  // Scope별 데이터
  const scopeData = [
    { name: '직접 배출량 (Scope 1)', value: 17.9, color: '#6ECD8E' },
    { name: '간접 배출량 (Scope 2)', value: 82.1, color: '#A8E6A3' }
  ];

  // 건물별 데이터
  const buildingData = [
    { name: '관악캠퍼스', value: 78, color: '#2D5A3D' },
    { name: '연건캠퍼스', value: 10, color: '#4A7C59' },
    { name: '평창캠퍼스', value: 6.5, color: '#A8E6A3' },
    { name: '그 외', value: 3.5, color: '#D4E157' },
    { name: '차세대융합기술연구원', value: 1.5, color: '#FFF59D' },
    { name: '시스템면역학회연구소', value: 0.5, color: '#FFECB3' }
  ];

  return (
    <div className="main-wrapper" style={{ maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      {/* CSS 스타일 추가 */}
      <style>{`
        @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Regular.woff2');
        @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-Bold.woff2');
        @import url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0/SUIT-ExtraBold.woff2');
        
        /* Main wrapper 설정 */
        .main-wrapper {
          max-width: 1920px !important;
          margin: 0 auto !important;
          width: 100% !important;
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
          background: radial-gradient(circle, #A8E6A3 0%, #7DD87A 50%, rgba(125, 216, 122, 0.3) 100%);
          top: -50px;
          left: 10%;
          animation: float1 8s ease-in-out infinite;
        }
        
        .gradient-circle-2 {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, #D4E157 0%, #C0CA33 50%, rgba(192, 202, 51, 0.3) 100%);
          top: 50px;
          right: 15%;
          animation: float2 10s ease-in-out infinite;
        }
        
        .gradient-circle-3 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #B2DFDB 0%, #80CBC4 50%, rgba(128, 203, 196, 0.3) 100%);
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
        
        .sub-title-content p {
          font-size: 1.2rem;
          color: #666;
          margin: 0 0 2rem 0;
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
        
        .breadcrumb span {
          color: #6ECD8E;
        }
      `}</style>

      <Header currentPage="greenhouse-gas" />

      {/* Sub Title Section */}
      <section className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="sub-title-content">
          <h1>온실가스 배출량</h1>
          <div className="breadcrumb">
            <span>홈</span>
            <span>&gt;</span>
            <span>온실가스</span>
            <span>&gt;</span>
            <span style={{ color: '#6ECD8E', fontWeight: '600' }}>온실가스 배출량</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 3rem' }}>
          
          {/* 1. 연도 선택 + 월별 차트 + 통계박스 */}
          <div style={{ marginBottom: '4rem' }}>
            {/* 연도 선택 버튼 - 3줄 6열 그리드 */}
            <div style={{
              maxWidth: '800px',
              margin: '0 auto 3rem auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '1rem'
              }}>
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #6ECD8E',
                      backgroundColor: selectedYear === year ? '#6ECD8E' : '#F5FDE7',
                      color: selectedYear === year ? 'white' : '#6ECD8E',
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
            </div>

            {/* 월별 차트와 통계박스 */}
            <div style={{
              maxWidth: '1600px',
              margin: '0 auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '3rem',
                alignItems: 'start'
              }}>
                {/* 월별 배출량 차트 */}
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={currentYearData.monthlyEmissions}>
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
                        label={{ value: 'Scope 별 배출량(tCO2eq)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()}t`, '배출량']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="emission" 
                        fill="#6ECD8E" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 모션이 있는 통계박스 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* 전체 배출량 */}
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#6ECD8D',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>전체 배출량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#6ECD8D' }}>
                      <CountUp key={`total-${selectedYear}`} end={currentYearData.total || 146344} suffix="t" />
                    </div>
                  </div>

                  {/* 월평균 배출량 */}
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#6ECD8D',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>월평균 배출량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#6ECD8D' }}>
                      <CountUp key={`monthly-${selectedYear}`} end={Math.round(currentYearData.monthlyAverage || 146344 / 12)} suffix="t" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. CO2eq 설명 + 도넛차트들 */}
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto 4rem auto'
          }}>
            <div style={{
              borderTop: '3px solid #6ECD8E',
              borderRadius: '12px',
              padding: '3rem',
              backgroundColor: 'transparent'
            }}>
              <h3 style={{
                color: '#6ECD8E',
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '2rem'
              }}>CO2eq란?</h3>
              <div style={{
                color: '#475569',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                marginBottom: '3rem'
              }}>
                <p style={{ marginBottom: '1rem' }}>
                  다양한 종류의 온실가스들을 기후변화에 미치는 영향을 고려하여 이산화탄소 양으로 환산한 단위입니다.
                </p>
                <p style={{ margin: 0 }}>
                  1tCO2eq 온실가체 배출 영향 = 이산화탄소 1톤 배출 영향
                </p>
              </div>

              {/* 도넛 차트들 - 순서 변경 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '3rem'
              }}>
                {/* 건물별 배출량 (왼쪽으로 이동) */}
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem'
                  }}>건물별 배출량</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={buildingData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={130}
                        dataKey="value"
                        stroke="none"
                      >
                        {buildingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '비율']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {buildingData.map((item, index) => (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: item.color, borderRadius: '50%' }}></div>
                          <span style={{ fontSize: '0.8rem' }}>{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scope별 배출량 (오른쪽으로 이동) */}
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{
                    color: '#333',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '1.5rem'
                  }}>Scope별 배출량</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={scopeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={130}
                        dataKey="value"
                        stroke="none"
                      >
                        {scopeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, '비율']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#6ECD8E', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '0.9rem' }}>직접 배출량 (Scope 1)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: '#A8E6A3', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '0.9rem' }}>간접 배출량 (Scope 2)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Scope 설명 */}
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto 4rem auto'
          }}>
            <div style={{
              borderTop: '3px solid #6ECD8E',
              borderRadius: '12px',
              padding: '3rem',
              backgroundColor: 'transparent'
            }}>
              <h3 style={{
                color: '#6ECD8E',
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '2rem'
              }}>Scope란?</h3>
              <div style={{
                color: '#475569',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                marginBottom: '3rem'
              }}>
                <p style={{ marginBottom: '1rem' }}>
                  온실가스 배출량을 배출원 기준으로 구분한 개념입니다.
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Scope1</strong> : 직접 배출량 (교내 차량 연소 등) | <strong>Scope2</strong> : 간접 배출량 (외부 전력 사용 등) | <strong>Scope3</strong> : 기타 간접 배출량 (통근, 통학 등)
                </p>
              </div>

              {/* 배출량 비교 막대그래프 */}
              <div style={{
                backgroundColor: 'transparent',
                borderRadius: '12px',
                padding: '3rem',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '3rem'
                }}>
                  {selectedYear}년
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '3rem', alignItems: 'center' }}>
                  <div>
                    <div style={{ marginBottom: '2rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <span style={{ minWidth: '120px', color: '#666', fontSize: '1.1rem' }}>배출 허용량</span>
                        <div style={{
                          flex: 1,
                          height: '40px',
                          backgroundColor: '#A8E6A3',
                          borderRadius: '8px',
                          position: 'relative',
                          marginRight: '2rem'
                        }}>
                          <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#fff',
                            fontWeight: '600'
                          }}>
                            65,069t
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <span style={{ minWidth: '120px', color: '#666', fontSize: '1.1rem' }}>배출량</span>
                        <div style={{
                          flex: 1,
                          height: '40px',
                          backgroundColor: '#6ECD8E',
                          borderRadius: '8px',
                          position: 'relative',
                          marginRight: '2rem',
                          width: '150%'
                        }}>
                          <div style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#fff',
                            fontWeight: '600'
                          }}>
                            {currentYearData.total?.toLocaleString()}t
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem',
                      color: '#666',
                      paddingLeft: '120px'
                    }}>
                      <span>0</span>
                      <span>20,000</span>
                      <span>40,000</span>
                      <span>60,000</span>
                      <span>80,000</span>
                      <span>100,000</span>
                      <span>120,000</span>
                      <span>140,000</span>
                      <span>160,000</span>
                    </div>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#6ECD8E',
                    color: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.9 }}>초과 배출량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FFD700' }}>
                      <CountUp key={`excess-${selectedYear}`} end={Math.max(0, currentYearData.total - 65069)} suffix="t" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 연간 온실가스 배출량 차트들 (2열) */}
          <div style={{
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            <div style={{
              borderTop: '3px solid #6ECD8E',
              borderRadius: '12px',
              padding: '3rem 0',
              backgroundColor: 'transparent'
            }}>
              <h3 style={{
                color: '#6ECD8E',
                fontSize: '1.8rem',
                fontWeight: '600',
                marginBottom: '3rem',
                textAlign: 'center'
              }}>연간 온실가스 배출량</h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '3rem',
                padding: '0 3rem'
              }}>
                {/* 전체 배출량 */}
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '3rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    textAlign: 'left',
                    marginBottom: '2rem',
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    전체 배출량(t)
                  </div>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={yearlyEmissionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        domain={[110000, 150000]}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()}t`, '배출량']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emission" 
                        stroke="#6ECD8E" 
                        strokeWidth={2}
                        dot={{ fill: '#6ECD8E', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 단위면적당 배출량 */}
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '3rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{
                    textAlign: 'left',
                    marginBottom: '2rem',
                    color: '#666',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    단위면적당 배출량(kgCO2eq/m²·2)
                  </div>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={unitAreaEmissionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        domain={[110000, 150000]}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value.toLocaleString()}`, 'kgCO2eq/m²']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="emission" 
                        stroke="#6ECD8E" 
                        strokeWidth={2}
                        dot={{ fill: '#6ECD8E', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GreenhouseGas;