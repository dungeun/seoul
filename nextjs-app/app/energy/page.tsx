'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Area, AreaChart, Legend
} from 'recharts';
import axios from 'axios';
import Header from '../../components/Header';

// Types for data structures
interface MonthlyEmission {
  month: string;
  emission: number;
}

interface MonthlyUsage {
  month: string;
  usage: number;
}

interface YearlyToeData {
  total: number;
  monthlyAverage: number;
  monthlyEmissions: MonthlyEmission[];
}

interface EnergyData {
  total: number;
  monthlyAverage: number;
  monthlyUsage: MonthlyUsage[];
}

interface EnergyStats {
  // Add type definition based on API response
  [key: string]: any;
}

// CountUp Animation Component
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

const Energy: React.FC = () => {
  const [stats, setStats] = useState<EnergyStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/public/energy-stats');
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error('에너지 통계 데이터 로딩 오류:', error);
        setError('데이터를 불러오는데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

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
            <div className="text-xl">에너지 데이터를 불러오는 중...</div>
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

  const years: string[] = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  // 연도별 TOE 데이터
  const yearlyToeData: Record<string, YearlyToeData> = {
    '2024': {
      total: 39117,
      monthlyAverage: 3260,
      monthlyEmissions: [
        { month: '1월', emission: 6170 },
        { month: '2월', emission: 5245 },
        { month: '3월', emission: 4651 },
        { month: '4월', emission: 3652 },
        { month: '5월', emission: 3825 },
        { month: '6월', emission: 4549 },
        { month: '7월', emission: 5412 },
        { month: '8월', emission: 5649 },
        { month: '9월', emission: 0 },
        { month: '10월', emission: 0 },
        { month: '11월', emission: 0 },
        { month: '12월', emission: 0 }
      ]
    }
  };

  // 전력 소비량 데이터 (MWh)
  const electricityData: EnergyData = {
    total: 157058,
    monthlyAverage: 19632,
    monthlyUsage: [
      { month: '1월', usage: 21874 },
      { month: '2월', usage: 22342 },
      { month: '3월', usage: 18549 },
      { month: '4월', usage: 17865 },
      { month: '5월', usage: 16274 },
      { month: '6월', usage: 17845 },
      { month: '7월', usage: 19532 },
      { month: '8월', usage: 22777 },
      { month: '9월', usage: 0 },
      { month: '10월', usage: 0 },
      { month: '11월', usage: 0 },
      { month: '12월', usage: 0 }
    ]
  };

  // 가스 소비량 데이터 (m3)
  const gasData: EnergyData = {
    total: 5959957,
    monthlyAverage: 744994,
    monthlyUsage: [
      { month: '1월', usage: 1223456 },
      { month: '2월', usage: 987234 },
      { month: '3월', usage: 745632 },
      { month: '4월', usage: 356789 },
      { month: '5월', usage: 412345 },
      { month: '6월', usage: 623456 },
      { month: '7월', usage: 789123 },
      { month: '8월', usage: 965432 },
      { month: '9월', usage: 856579 },
      { month: '10월', usage: 0 },
      { month: '11월', usage: 0 },
      { month: '12월', usage: 0 }
    ]
  };

  // 상수 소비량 데이터 (t)
  const waterData: EnergyData = {
    total: 331619,
    monthlyAverage: 110539,
    monthlyUsage: [
      { month: '1월', usage: 103456 },
      { month: '2월', usage: 127834 },
      { month: '3월', usage: 100329 },
      { month: '4월', usage: 0 },
      { month: '5월', usage: 0 },
      { month: '6월', usage: 0 },
      { month: '7월', usage: 0 },
      { month: '8월', usage: 0 },
      { month: '9월', usage: 0 },
      { month: '10월', usage: 0 },
      { month: '11월', usage: 0 },
      { month: '12월', usage: 0 }
    ]
  };

  const currentYearToe = yearlyToeData[selectedYear] || yearlyToeData['2024'];

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

      <Header currentPage="energy" />

      {/* Sub Title Section */}
      <section className="sub-title-section">
        <div className="gradient-circles">
          <div className="gradient-circle gradient-circle-1"></div>
          <div className="gradient-circle gradient-circle-2"></div>
          <div className="gradient-circle gradient-circle-3"></div>
        </div>
        <div className="sub-title-content">
          <h1 style={{ color: '#6ECD8E' }}>에너지 사용량</h1>
          <div className="breadcrumb">
            <span style={{ color: '#333' }}>홈</span>
            <span style={{ color: '#333' }}>&gt;</span>
            <span style={{ color: '#333' }}>에너지</span>
            <span style={{ color: '#333' }}>&gt;</span>
            <span style={{ color: '#6ECD8E', fontWeight: '600' }}>에너지 사용량</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ backgroundColor: '#fff', padding: '3rem 0' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', padding: '0 3rem' }}>
          
          {/* 1. 전체 에너지 소비량 (TOE) */}
          <div style={{ marginBottom: '4rem' }}>
            {/* 연도 선택 버튼 - 2줄 4열 그리드 */}
            <div style={{
              maxWidth: '800px',
              margin: '0 auto 3rem auto'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem'
              }}>
                {years.map((year: string) => (
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

            <h2 style={{
              color: '#6ECD8E',
              fontSize: '1.8rem',
              fontWeight: '600',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>전체 에너지 소비량</h2>

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
                    <BarChart data={currentYearToe.monthlyEmissions}>
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
                        label={{ value: '에너지 소비량(TOE)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value.toLocaleString()}TOE`, '소비량']}
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

                {/* 통계박스 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* 에너지 소비량 */}
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#6ECD8E',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>에너지 소비량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#6ECD8E' }}>
                      <CountUp key={`total-toe-${selectedYear}`} end={currentYearToe.total} suffix=" TOE" />
                    </div>
                  </div>

                  {/* 월평균 */}
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#6ECD8E',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>월 평균</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#6ECD8E' }}>
                      <CountUp key={`monthly-toe-${selectedYear}`} end={currentYearToe.monthlyAverage} suffix=" TOE" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 전력 소비량 */}
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
                marginBottom: '1rem',
                textAlign: 'center'
              }}>전력 소비량</h3>
              <p style={{
                textAlign: 'center',
                color: '#666',
                marginBottom: '3rem'
              }}>관악캠퍼스, 연건캠퍼스 (한국전력)</p>

              {/* 월별 차트와 통계박스 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '3rem',
                alignItems: 'start'
              }}>
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={electricityData.monthlyUsage}>
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
                        label={{ value: '전력 사용량(MWh)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value.toLocaleString()} MWh`, '사용량']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="usage" 
                        fill="#3B82F6" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#3B82F6',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>전력 소비량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3B82F6' }}>
                      <CountUp key="electricity-total" end={electricityData.total} suffix=" MWh" />
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#3B82F6',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>월 평균</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#3B82F6' }}>
                      <CountUp key="electricity-monthly" end={electricityData.monthlyAverage} suffix=" MWh" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. 가스 소비량 */}
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
                marginBottom: '1rem',
                textAlign: 'center'
              }}>가스 소비량</h3>
              <p style={{
                textAlign: 'center',
                color: '#666',
                marginBottom: '3rem'
              }}>관악캠퍼스 (도시가스공사)</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '3rem',
                alignItems: 'start'
              }}>
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={gasData.monthlyUsage}>
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
                        label={{ value: '가스 소비량(m³)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value.toLocaleString()} m³`, '소비량']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="usage" 
                        fill="#10B981" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#10B981',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>가스 소비량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10B981' }}>
                      <CountUp key="gas-total" end={gasData.total} suffix=" m³" />
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#10B981',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>월 평균</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10B981' }}>
                      <CountUp key="gas-monthly" end={gasData.monthlyAverage} suffix=" m³" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 상수 소비량 */}
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
                marginBottom: '1rem',
                textAlign: 'center'
              }}>상수 소비량</h3>
              <p style={{
                textAlign: 'center',
                color: '#666',
                marginBottom: '3rem'
              }}>관악캠퍼스 (자체 검침)</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '3rem',
                alignItems: 'start',
                padding: '0 3rem'
              }}>
                <div style={{
                  backgroundColor: 'transparent',
                  borderRadius: '12px',
                  padding: '2rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={waterData.monthlyUsage}>
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
                        label={{ value: '상수 소비량(t)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                      />
                      <Tooltip 
                        formatter={(value: any) => [`${value.toLocaleString()} t`, '소비량']}
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="usage" 
                        fill="#F59E0B" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#F59E0B',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>상수 소비량</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#F59E0B' }}>
                      <CountUp key="water-total" end={waterData.total} suffix=" t" />
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '1.2rem', 
                      color: 'white', 
                      backgroundColor: '#F59E0B',
                      padding: '0.8rem 1.5rem',
                      borderRadius: '8px',
                      display: 'inline-block',
                      marginBottom: '1rem'
                    }}>월 평균</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#F59E0B' }}>
                      <CountUp key="water-monthly" end={waterData.monthlyAverage} suffix=" t" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Energy;