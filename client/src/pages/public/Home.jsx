import React, { useEffect, useState, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [energyData, setEnergyData] = useState({
    greenhouse: { total: 144448, year: 2022, unit: 't(톤)' },
    energy: { total: 43106, year: 2023, unit: 'TOE(석유환산톤)' },
    solar: { total: 1782921, year: 2023, unit: 'kWh(킬로와트시)' },
    reduction: { total: 830, year: 2023, unit: 't(톤)' }
  });
  const [loading, setLoading] = useState(true);
  const [timelineReady, setTimelineReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [clickedCard, setClickedCard] = useState(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState([]);
  
  // 기본 히어로 슬라이드 데이터 (백업용)
  const defaultHeroSlides = [
    {
      id: 1,
      title: "서울대학교 탄소중립캠퍼스",
      subtitle: "Carbon Neutral Campus Initiative",
      description: "2050 탄소중립을 향한 지속가능한 미래를 만들어갑니다",
      button_text: "자세히 보기",
      background_color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      text_color: "white",
      order_index: 1
    },
    {
      id: 2,
      title: "그린에너지 혁신",
      subtitle: "Green Energy Innovation",
      description: "태양광, 풍력 등 재생에너지로 캠퍼스를 운영합니다",
      button_text: "에너지 현황",
      background_color: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      text_color: "white",
      order_index: 2
    },
    {
      id: 3,
      title: "지속가능한 연구",
      subtitle: "Sustainable Research",
      description: "환경 친화적 기술 개발과 연구로 미래를 선도합니다",
      button_text: "연구 네트워크",
      background_color: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
      text_color: "white",
      order_index: 3
    },
    {
      id: 4,
      title: "스마트 그린캠퍼스",
      subtitle: "Smart Green Campus",
      description: "AI와 IoT 기술로 효율적인 에너지 관리를 실현합니다",
      button_text: "데이터 플랫폼",
      background_color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      text_color: "white",
      order_index: 4
    }
  ];
  
  // 자동 슬라이드 함수 참조
  const autoSlideRef = useRef(null);

  // 모달 닫기 함수를 useCallback으로 정의
  const closeIframeModal = useCallback(() => {
    console.log('🔴 모달 닫기 버튼 클릭됨!');
    setModalOpen(false);
    
    // 잠시 후 완전히 닫기
    setTimeout(() => {
      setSelectedYear(null);
      setClickedCard(null);
      setIframeLoading(true);
      // 자동 슬라이드 재시작
      if (autoSlideRef.current?.startAutoSlide) {
        autoSlideRef.current.startAutoSlide();
      }
    }, 300);
  }, []);

  useEffect(() => {
    // API에서 실제 데이터 가져오기
    const fetchEnergyData = async () => {
      try {
        // 온실가스 데이터 가져오기
        const greenhouseResponse = await fetch('/api/public/greenhouse-gas-stats');
        if (greenhouseResponse.ok) {
          const greenhouseData = await greenhouseResponse.json();
          setEnergyData(prev => ({
            ...prev,
            greenhouse: {
              total: greenhouseData.currentYear.total,
              year: new Date().getFullYear(),
              unit: 't(톤)'
            },
            reduction: {
              total: Math.abs(greenhouseData.currentYear.changePercent * greenhouseData.currentYear.total / 100),
              year: new Date().getFullYear(),
              unit: 't(톤)'
            }
          }));
        }

        // 에너지 데이터 가져오기
        const energyResponse = await fetch('/api/public/energy-stats');
        if (energyResponse.ok) {
          const energyData = await energyResponse.json();
          setEnergyData(prev => ({
            ...prev,
            energy: {
              total: energyData.currentYear.electricity + energyData.currentYear.gas,
              year: new Date().getFullYear(),
              unit: 'MWh'
            },
            solar: {
              total: energyData.currentYear.solar,
              year: new Date().getFullYear(),
              unit: 'MWh'
            }
          }));
        }
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    // 히어로 슬라이드 데이터 가져오기
    const fetchHeroSlides = async () => {
      try {
        const response = await fetch('/api/hero-slides');
        if (response.ok) {
          const slides = await response.json();
          if (slides && slides.length > 0) {
            setHeroSlides(slides);
          } else {
            setHeroSlides(defaultHeroSlides);
          }
        } else {
          setHeroSlides(defaultHeroSlides);
        }
      } catch (error) {
        console.error('히어로 슬라이드 데이터 가져오기 실패:', error);
        setHeroSlides(defaultHeroSlides);
      }
    };

    fetchEnergyData();
    fetchHeroSlides();

    // GSAP 라이브러리 동적 로드
    const loadGSAP = () => {
      return new Promise((resolve) => {
        if (window.gsap) {
          resolve(window.gsap);
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
        script.onload = () => resolve(window.gsap);
        document.head.appendChild(script);
      });
    };

    // 모든 기능 초기화
    const initializeAll = async () => {
      await loadGSAP();
      
      // 약간의 지연을 두어 DOM 요소들이 완전히 렌더링되도록 함
      setTimeout(() => {
        initDropdown();
        initTimelineSlider();
        assignRandomBackgroundImages();
      }, 100);
    };

    // 드롭다운 메뉴 기능
    function initDropdown() {
      const navigation = document.querySelector('.navigation');
      const navItems = document.querySelectorAll('.nav-item');
      const dropdownContainer = document.querySelector('.dropdown-menu-container');
      const dropdownMenus = document.querySelectorAll('.dropdown-menu');

      if (!navigation || !dropdownContainer) return;

      navigation.addEventListener('mouseenter', function() {
        dropdownContainer.classList.add('active');
      });

      let closeTimer;
      
      function hideDropdown() {
        closeTimer = setTimeout(function() {
          dropdownContainer.classList.remove('active');
          dropdownMenus.forEach(function(menu) {
            menu.classList.remove('active');
          });
        }, 100);
      }
      
      function showDropdown() {
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        dropdownContainer.classList.add('active');
      }

      navigation.addEventListener('mouseleave', hideDropdown);
      dropdownContainer.addEventListener('mouseenter', showDropdown);
      dropdownContainer.addEventListener('mouseleave', hideDropdown);
      
      navItems.forEach(function(item, index) {
        const navLink = item.querySelector('.nav-link');
        if (!navLink) return;
        const menuText = navLink.textContent.trim();
        
        item.addEventListener('mouseenter', function() {
          showDropdown();
          
          dropdownMenus.forEach(function(menu) {
            menu.classList.remove('active');
          });
          
          const targetMenu = document.querySelector('.dropdown-menu[data-menu="' + menuText + '"]');
          if (targetMenu) {
            targetMenu.classList.add('active');
            
            const menuRect = item.getBoundingClientRect();
            const headerRect = document.querySelector('.header').getBoundingClientRect();
            const dropdownColumn = targetMenu.querySelector('.dropdown-column');
            
            const menuLeftPosition = menuRect.left - headerRect.left + 40;
            
            if (dropdownColumn) {
              dropdownColumn.style.left = menuLeftPosition + 'px';
            }
            
            const subCategories = targetMenu.querySelector('.sub-categories');
            if (subCategories) {
              const centerPosition = menuLeftPosition - 600;
              const finalPosition = centerPosition < 40 ? 40 : centerPosition;
              subCategories.style.left = finalPosition + 'px';
            }
          }
        });
      });
    }

    // 타임라인 슬라이더 기능
    function initTimelineSlider() {
      const timelineGrid = document.querySelector('.timeline-grid');
      const yearBar = document.querySelector('.year-bar');
      const yearItems = document.querySelectorAll('.year-item');
      const timelineItems = document.querySelectorAll('.timeline-item');
      
      if (!timelineGrid || !yearBar || timelineItems.length === 0) return;
      
      const years = [];
      for (let year = 2008; year <= 2024; year++) {
        years.push(year);
      }
      
      let currentIndex = 0;
      let autoSlideInterval;
      const totalItems = timelineItems.length;

      function goToSlide(index) {
        if (yearItems[currentIndex]) {
          yearItems[currentIndex].classList.remove('active');
        }
        
        timelineItems.forEach(item => {
          item.classList.remove('second-position', 'first-position', 'third-position', 'fourth-position');
        });
        
        currentIndex = index;
        const translateX = -(currentIndex * 375);
        const yearTranslateX = -(currentIndex * 240);
        
        timelineGrid.style.transform = `translateX(${translateX}px)`;
        yearBar.style.transform = `translateX(${yearTranslateX}px)`;
        
        if (yearItems[currentIndex]) {
          yearItems[currentIndex].classList.add('active');
        }
        
        const positions = ['first-position', 'second-position', 'third-position', 'fourth-position'];
        positions.forEach((position, i) => {
          const itemIndex = currentIndex + i;
          if (itemIndex < totalItems && timelineItems[itemIndex]) {
            timelineItems[itemIndex].classList.add(position);
          }
        });
      }

      function moveToNext() {
        const nextIndex = (currentIndex + 1) % totalItems;
        goToSlide(nextIndex);
      }

      function startAutoSlide() {
        autoSlideInterval = setInterval(moveToNext, 5000);
      }

      function stopAutoSlide() {
        clearInterval(autoSlideInterval);
      }

      function restartAutoSlide() {
        stopAutoSlide();
        setTimeout(startAutoSlide, 3000);
      }

      // 년도별 상세 페이지를 중앙 모달로 바로 표시
      function showYearDetail(year, clickedCard) {
        if (autoSlideRef.current?.stopAutoSlide) {
          autoSlideRef.current.stopAutoSlide();
        }
        
        // 선택된 년도 저장하고 바로 모달 열기
        setSelectedYear(year);
        setClickedCard(clickedCard);
        setIframeLoading(true);
        setModalOpen(true);
        
        console.log(`🎬 ${year}년 모달 열기`);
      }

      // iframe 모달 열기 함수
      function openIframeModal(year) {
        const modal = document.getElementById('yearModal');
        const iframe = document.getElementById('yearIframe');
        
        if (!modal || !iframe) return;
        
        iframe.src = `/html/${year}.html`;
        modal.classList.add('active');
      }

      // 카드 클릭 이벤트
      timelineItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const year = years[index];
          showYearDetail(year, item);
        });
      });

      // 년도바 클릭 이벤트
      yearItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          goToSlide(index);
          restartAutoSlide();
        });
      });

      // 자동 슬라이드 시작
      startAutoSlide();
      
      // 초기 위치별 오버레이 설정 - 깜빡임 방지를 위해 즉시 설정
      if (timelineItems.length > 0) {
        timelineItems[0].classList.add('first-position');
      }
      if (timelineItems.length > 1) {
        timelineItems[1].classList.add('second-position');
      }
      if (timelineItems.length > 2) {
        timelineItems[2].classList.add('third-position');
      }
      if (timelineItems.length > 3) {
        timelineItems[3].classList.add('fourth-position');
      }

      // 전역 함수로 저장 (정리를 위해)
      window.currentTimelineSlider = {
        startAutoSlide,
        stopAutoSlide,
        restartAutoSlide,
        cleanup: () => {
          stopAutoSlide();
        }
      };

      // ref에도 저장
      autoSlideRef.current = {
        startAutoSlide,
        stopAutoSlide,
        restartAutoSlide
      };

      // 초기화 완료 후 타임라인 표시 (깜빡임 방지)
      setTimeout(() => {
        setTimelineReady(true);
      }, 500);
    }

    function assignRandomBackgroundImages() {
      const timelineItems = document.querySelectorAll('.timeline-item');
      
      const randomImages = [
        'a1.jpg', 'a2.jpg', 'a3.jpg', 'a4.jpg', 'a5.jpg', 
        'a6.jpg', 'a7.jpg', 'a8.jpg', 'a9.jpg'
      ];
      
      timelineItems.forEach((item, index) => {
        const year = 2008 + index;
        const randomIndex = Math.floor(Math.random() * randomImages.length);
        const imageName = randomImages[randomIndex];
        
        item.classList.add('has-bg-image');
        item.style.backgroundImage = `url('/img/${imageName}')`;
        item.style.backgroundSize = 'cover';
        item.style.backgroundPosition = 'center';
        item.style.backgroundRepeat = 'no-repeat';
        
        // 이미지 존재 확인
        const img = new Image();
        img.onload = function() {
          console.log(`✅ 이미지 로딩 성공: ${imageName}`);
        };
        img.onerror = function() {
          console.error(`❌ 이미지 로딩 실패: ${imageName}`);
          item.style.backgroundImage = 'none';
          item.classList.remove('has-bg-image');
        };
        img.src = `/img/${imageName}`;
      });
    }

    // 초기화 실행
    initializeAll();

    // 정리 함수
    return () => {
      if (window.currentTimelineSlider?.cleanup) {
        window.currentTimelineSlider.cleanup();
      }
    };
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeIframeModal();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [modalOpen, closeIframeModal]);

  // 히어로 슬라이드 자동 전환
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // 5초마다 전환

    return () => clearInterval(slideInterval);
  }, [heroSlides.length]);

  return (
    <>
      {/* 스타일을 먼저 로드 */}
      <link rel="stylesheet" href="/styles.css" />
      
      <div className="main-wrapper">
        {/* CSS 스타일 추가 */}
        <style>{`
          @import url('/styles.css');
          
          /* 전체 페이지 중앙 정렬 및 1920px 제한 */
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          
          .main-wrapper {
            max-width: 1920px;
            width: 100%;
            margin: 0 auto;
            background-color: white;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
          }
          
          /* 기본 컨테이너 - 개별 섹션에서 override 가능 */
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 40px;
            width: 100%;
          }
          
          /* 헤더는 전체 폭 사용 */
          .header-container {
            max-width: 1920px;
            margin: 0 auto;
            padding: 0 40px;
            width: 100%;
          }
          
          /* 히어로 섹션 - 전체 폭 */
          .hero {
            width: 100%;
            height: 900px;
            position: relative;
            overflow: hidden;
          }
          
          .hero-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            z-index: 2;
            width: 100%;
            max-width: 1200px;
            padding: 0 40px;
          }
          
          .hero-title {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          
          .hero-subtitle {
            font-size: 1.5rem;
            font-weight: 400;
            margin-bottom: 1.5rem;
            opacity: 0.9;
          }
          
          .hero-description {
            font-size: 1.2rem;
            font-weight: 300;
            margin-bottom: 2.5rem;
            opacity: 0.8;
            line-height: 1.6;
          }
          
          .hero-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid white;
            padding: 15px 30px;
            font-size: 1.1rem;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
          }
          
          .hero-btn:hover {
            background: white;
            color: #333;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
          
          .hero-indicators {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 3;
          }
          
          .hero-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .hero-indicator.active {
            background: white;
            transform: scale(1.2);
          }
          
          .hero-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            z-index: 3;
          }
          
          .hero-nav:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-50%) scale(1.1);
          }
          
          .hero-nav.prev {
            left: 30px;
          }
          
          .hero-nav.next {
            right: 30px;
          }
          
          /* 타임라인 섹션 - 넓은 폭 사용 */
          .history-section .container {
            max-width: 1600px;
            margin: 0 auto;
            padding: 60px 40px;
          }
          
          /* 지속가능한 캠퍼스 섹션 - 표준 폭 */
          .sustainable-section {
            height: 900px;
            display: flex;
            align-items: center;
          }
          
          .sustainable-section .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 60px 40px;
          }
          
          .sustainable-section .icon-grid {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          /* 에너지 데이터 섹션 - 표준 폭 */
          .energy-data-section {
            border-radius: 0 100px 0 0;
            background-color: #F5FDE7;
            margin-top: 0;
          }
          
          .energy-data-section .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 60px 40px;
          }
          
          .energy-data-section h2 {
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 0 40px 0;
            font-size: 2.5rem;
            font-weight: bold;
            color: #2c3e50;
            text-align: center;
          }
          
          .data-card {
            box-shadow: none !important;
            border: 1px solid #e0e0e0;
            border-top-left-radius: 100px;
            border-top-right-radius: 0;
            border-bottom-left-radius: 0;
            border-bottom-right-radius: 0;
          }
          
          /* 푸터 - 전체 폭 */
          .footer {
            width: 100%;
            background-color: #2c3e50;
            color: white;
          }
          
          .footer .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
          }
          
          /* 타임라인 카드 호버 효과 */
          .timeline-item {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .timeline-item:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          }
          
          /* 반응형 디자인 */
          @media (max-width: 1920px) {
            .main-wrapper {
              box-shadow: none;
            }
          }
          
          @media (max-width: 1400px) {
            .history-section .container,
            .sustainable-section .container {
              max-width: 95%;
              padding: 40px 20px;
            }
          }
          
          @media (max-width: 768px) {
            .container {
              padding: 20px;
            }
            
            .hero-content {
              padding: 60px 20px;
            }
          }
        `}</style>

        {/* Header */}
        <Header />

        {/* Hero Section - Slider */}
        <section className="hero">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: heroSlides[currentSlide]?.background_image 
                  ? `url(${heroSlides[currentSlide].background_image}) center/cover` 
                  : heroSlides[currentSlide]?.background_color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                zIndex: 1
              }}
            />
          </AnimatePresence>

          <div className="hero-content">
            <motion.h1 
              key={`title-${currentSlide}`}
              className="hero-title"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              style={{ color: heroSlides[currentSlide]?.text_color || 'white' }}
            >
              {heroSlides[currentSlide]?.title || '서울대학교 탄소중립캠퍼스'}
            </motion.h1>
            
            <motion.p 
              key={`subtitle-${currentSlide}`}
              className="hero-subtitle"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              style={{ color: heroSlides[currentSlide]?.text_color || 'white' }}
            >
              {heroSlides[currentSlide]?.subtitle || 'Carbon Neutral Campus Initiative'}
            </motion.p>
            
            <motion.p 
              key={`description-${currentSlide}`}
              className="hero-description"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ color: heroSlides[currentSlide]?.text_color || 'white' }}
            >
              {heroSlides[currentSlide]?.description || '2050 탄소중립을 향한 지속가능한 미래를 만들어갑니다'}
            </motion.p>
            
            <motion.button 
              key={`button-${currentSlide}`}
              className="hero-btn"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {heroSlides[currentSlide]?.button_text || '자세히 보기'}
            </motion.button>
          </div>

          {/* Navigation Arrows */}
          <button 
            className="hero-nav prev"
            onClick={() => setCurrentSlide((prev) => prev === 0 ? heroSlides.length - 1 : prev - 1)}
          >
            ‹
          </button>
          
          <button 
            className="hero-nav next"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          >
            ›
          </button>

          {/* Slide Indicators */}
          <div className="hero-indicators">
            {heroSlides.map((_, index) => (
              <motion.div
                key={index}
                className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="history-section">
          <div className="container">
            <h2>서울대학교 탄소중립 캠퍼스의 역사</h2>
            <p className="subtitle">From sustainable SNU to carbon neutral campus</p>
            
            <motion.div 
              className={`timeline-container ${timelineReady ? 'ready' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: timelineReady ? 1 : 0, y: timelineReady ? 0 : 50 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              <div className="timeline-grid">
                {[2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year, index) => (
                  <motion.div 
                    key={year} 
                    className="timeline-item"
                    whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      showYearDetail(year, e.currentTarget);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="year">{year}</div>
                    <div className="content">
                      <h3>{year === 2008 ? '그린캠퍼스 선언' :
                           year === 2009 ? '친환경 건물 인증' :
                           year === 2010 ? '태양광 발전 시설' :
                           year === 2011 ? '에너지 모니터링' :
                           year === 2012 ? '폐기물 재활용' :
                           year === 2013 ? '친환경 교통' :
                           year === 2014 ? '그린 IT 도입' :
                           year === 2015 ? '에너지 절약 프로그램' :
                           year === 2016 ? '스마트 조명 시스템' :
                           year === 2017 ? '녹색 건축 확대' :
                           year === 2018 ? '온실가스 측정' :
                           year === 2019 ? '재생에너지 확대' :
                           year === 2020 ? '탄소중립 선언' :
                           year === 2021 ? 'AI 에너지 관리' :
                           year === 2022 ? '탄소 흡수원 조성' :
                           year === 2023 ? 'ESG 경영 도입' :
                           '스마트 그린캠퍼스'}</h3>
                      <p>{year === 2008 ? '지속가능한 캠퍼스 구축 시작' :
                          year === 2009 ? 'LEED 인증 건물 도입' :
                          year === 2010 ? '캠퍼스 태양광 패널 설치' :
                          year === 2011 ? '실시간 에너지 사용량 추적' :
                          year === 2012 ? '캠퍼스 폐기물 분리수거 강화' :
                          year === 2013 ? '자전거 도로 및 공유 시스템' :
                          year === 2014 ? '에너지 효율적 IT 인프라' :
                          year === 2015 ? '캠퍼스 에너지 효율성 향상' :
                          year === 2016 ? 'LED 조명 및 센서 도입' :
                          year === 2017 ? '친환경 건축 기준 강화' :
                          year === 2018 ? '캠퍼스 탄소 발자국 측정' :
                          year === 2019 ? '풍력 및 지열 에너지 도입' :
                          year === 2020 ? '2050 탄소중립 목표 설정' :
                          year === 2021 ? '인공지능 기반 에너지 최적화' :
                          year === 2022 ? '캠퍼스 숲 조성 프로젝트' :
                          year === 2023 ? '지속가능 경영 체계 구축' :
                          '디지털 트윈 기반 관리'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="timeline-slider">
                <div className="year-bar-container">
                  <div className="year-bar">
                    {[2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((year, index) => (
                      <div key={year} className={`year-item ${index === 0 ? 'active' : ''}`} data-year={year}>{year}</div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Sustainable Campus Section */}
        <section className="sustainable-section">
          <div className="container">
            <h2>지속가능한 친환경 서울대학교</h2>
            <div className="icon-grid">
              {[
                { name: '온실가스 배출량', img: '1.png', href: '/greenhouse-gas' },
                { name: '온실가스 감축활동', img: '2.png', href: '#' },
                { name: '온실가스 맵', img: '3.png', href: '#' },
                { name: '에너지', img: '4.png', href: '/energy' },
                { name: '태양광 발전', img: '5.png', href: '/solar-power' },
                { name: '전력사용량', img: '6.png', href: '#' },
                { name: '친환경 학생 활동', img: '8.png', href: '#' },
                { name: '그린리더십', img: '9.png', href: '#' },
                { name: '그린레포트', img: '10.png', href: '#' },
                { name: '인포그래픽', img: '11.png', href: '/infographic' },
                { name: '자료실', img: '12.png', href: '#' },
                { name: '지속가능성 보고서', img: '1.png', href: '#' }
              ].map((item, index) => (
                <a 
                  key={index} 
                  href={item.href} 
                  className="icon-item"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="icon">
                    <img src={`/img/${item.img}`} alt={item.name} />
                  </div>
                  <h3>{item.name}</h3>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Energy Data Section */}
        <section className="energy-data-section">
          <div className="container">
            <h2>온실가스&에너지 한 눈에 보기</h2>
            <div className="data-grid">
              <div className="data-card">
                <h3>온실가스 전체 배출량</h3>
                <div className="data-year">{energyData.greenhouse.year}년 연간 기준</div>
                <div className="data-value">
                  {loading ? '로딩중...' : energyData.greenhouse.total.toLocaleString()}
                </div>
                <p>단위 {energyData.greenhouse.unit}</p>
              </div>
              <div className="data-card">
                <h3>에너지 전체 소비량</h3>
                <div className="data-year">{energyData.energy.year}년 연간 기준</div>
                <div className="data-value">
                  {loading ? '로딩중...' : energyData.energy.total.toLocaleString()}
                </div>
                <p>단위 {energyData.energy.unit}</p>
              </div>
              <div className="data-card">
                <h3>태양광 전체 발전량</h3>
                <div className="data-year">{energyData.solar.year}년 연간 기준</div>
                <div className="data-value">
                  {loading ? '로딩중...' : energyData.solar.total.toLocaleString()}
                </div>
                <p>단위 {energyData.solar.unit}</p>
              </div>
              <div className="data-card">
                <h3>온실가스 감축효과</h3>
                <div className="data-year">{energyData.reduction.year}년 연간 기준</div>
                <div className="data-value">
                  {loading ? '로딩중...' : Math.round(energyData.reduction.total).toLocaleString()}
                </div>
                <p>단위 {energyData.reduction.unit}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Framer Motion 기반 Year Details Modal */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(15px)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  console.log('배경 클릭으로 모달 닫기!');
                  closeIframeModal();
                }
              }}
            >
              <motion.div
                className="modal-container"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                style={{
                  width: '1500px',
                  height: '745px',
                  maxWidth: '95vw',
                  maxHeight: '95vh',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                  position: 'relative'
                }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 250,
                  duration: 0.6
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  className="modal-close-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('닫기 버튼 직접 클릭됨!');
                    closeIframeModal();
                  }}
                  whileHover={{ scale: 1.2, rotate: 90, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '2px solid #ddd',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    zIndex: 10002,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  ✕
                </motion.button>

                {/* Loading Indicator */}
                {iframeLoading && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '18px',
                      color: '#666',
                      zIndex: 10003,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      padding: '20px 30px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    📄 {selectedYear}년 페이지 로딩중...
                  </motion.div>
                )}
                
                {/* Iframe Content */}
                <motion.iframe
                  src={selectedYear ? `/html/${selectedYear}.html` : ''}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '16px',
                    display: iframeLoading ? 'none' : 'block'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: iframeLoading ? 0 : 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  onLoad={() => {
                    console.log(`✅ ${selectedYear}.html 로드 완료`);
                    setTimeout(() => setIframeLoading(false), 100);
                  }}
                  onError={() => {
                    console.error(`❌ ${selectedYear}.html 로드 실패`);
                    setIframeLoading(false);
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>서울대학교 탄소중립 캠퍼스</h3>
                <p>08826 서울특별시 관악구 관악로 1</p>
                <p>전화: 02-880-5114</p>
              </div>
              <div className="footer-section">
                <h4>바로가기</h4>
                <ul>
                  <li><a href="/greenhouse-gas">온실가스 현황</a></li>
                  <li><a href="/energy">에너지 관리</a></li>
                  <li><a href="#">연구 네트워크</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>관련 사이트</h4>
                <ul>
                  <li><a href="#">서울대학교</a></li>
                  <li><a href="#">환경부</a></li>
                  <li><a href="#">한국환경공단</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 Seoul National University. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;