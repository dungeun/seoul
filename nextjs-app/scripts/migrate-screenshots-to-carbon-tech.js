const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrateScreenshots() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 스크린샷 마이그레이션 시작...\n');
    
    // 1. 먼저 carbon_tech_posts 테이블 비우기 (테스트 데이터 제거)
    await client.query('DELETE FROM carbon_tech_posts');
    console.log('✅ 기존 테스트 데이터 삭제 완료');
    
    // 2. link_posts에서 실제 교수 데이터만 가져오기 (example.com 제외)
    const linkPosts = await client.query(`
      SELECT title, link_url, image_url, created_at
      FROM link_posts 
      WHERE link_url NOT LIKE '%example.com%'
      ORDER BY id
    `);
    
    console.log(`\n📊 ${linkPosts.rows.length}개의 실제 데이터를 찾았습니다.\n`);
    
    let insertCount = 0;
    let skipCount = 0;
    
    // 3. 각 레코드를 carbon_tech_posts로 이동
    for (const post of linkPosts.rows) {
      try {
        // 제목에서 이름과 학과 파싱
        const titleMatch = post.title.match(/^(.+?)\s*\((.+?)\)$/);
        if (!titleMatch) {
          console.log(`⚠️  파싱 실패: ${post.title}`);
          skipCount++;
          continue;
        }
        
        const name = titleMatch[1].trim();
        const department = titleMatch[2].trim();
        
        // 카테고리 추측 (학과명 기반)
        let mainCategory = '탄소중립 기술개발';
        let subCategory = '기타';
        
        if (department.includes('정책') || department.includes('경제') || department.includes('법')) {
          mainCategory = '탄소중립 정책연구';
          subCategory = '탄소중립 정책 및 제도';
        } else if (department.includes('환경') || department.includes('지구')) {
          mainCategory = '기후과학 연구';
          subCategory = '기후변화 과학';
        } else if (department.includes('화학') || department.includes('에너지')) {
          subCategory = '수소 분야 (생산, 운반, 저장 등)';
        } else if (department.includes('전기') || department.includes('전자')) {
          subCategory = '무탄소 전력공급 (태양광, 풍력, 지열, 원자력, ESS, 에너지 하베스팅 등)';
        } else if (department.includes('기계') || department.includes('자동차')) {
          subCategory = '친환경 모빌리티 기술 (배터리, 친환경 자동차, 철도 전기화, 친환경 선박, UAM 등)';
        } else if (department.includes('건설') || department.includes('건축')) {
          subCategory = '친환경 건설시스템 (친환경 건축물, 탈탄소 시멘트/철강/화학/조선 등)';
        }
        
        // carbon_tech_posts에 삽입
        await client.query(`
          INSERT INTO carbon_tech_posts 
          (name, department, url, screenshot_url, main_category, sub_category, order_index, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (url) DO UPDATE SET
            screenshot_url = EXCLUDED.screenshot_url,
            updated_at = CURRENT_TIMESTAMP
        `, [
          name,
          department,
          post.link_url,
          post.image_url,
          mainCategory,
          subCategory,
          insertCount,
          'published',
          post.created_at || new Date()
        ]);
        
        insertCount++;
        console.log(`✅ 추가: ${name} (${department})`);
        
      } catch (error) {
        console.error(`❌ 오류: ${post.title} - ${error.message}`);
        skipCount++;
      }
    }
    
    console.log('\n📊 마이그레이션 완료!');
    console.log(`✅ 성공: ${insertCount}개`);
    console.log(`⚠️  스킵: ${skipCount}개`);
    
    // 4. 결과 확인
    const result = await client.query(`
      SELECT 
        main_category,
        COUNT(*) as count,
        COUNT(CASE WHEN screenshot_url IS NOT NULL THEN 1 END) as with_screenshot
      FROM carbon_tech_posts
      GROUP BY main_category
    `);
    
    console.log('\n📈 카테고리별 통계:');
    result.rows.forEach(row => {
      console.log(`${row.main_category}: ${row.count}개 (스크린샷 ${row.with_screenshot}개)`);
    });
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateScreenshots().catch(console.error);