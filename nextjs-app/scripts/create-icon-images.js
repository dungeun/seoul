const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const icons = [
  { name: 'greenhouse-gas', text: '온실가스', color: '#10b981' },
  { name: 'greenhouse-reduction', text: '감축활동', color: '#06b6d4' },
  { name: 'greenhouse-map', text: '온실가스맵', color: '#8b5cf6' },
  { name: 'energy', text: '에너지', color: '#f59e0b' },
  { name: 'solar-power', text: '태양광', color: '#eab308' },
  { name: 'electricity-usage', text: '전력사용', color: '#3b82f6' },
  { name: 'eco-student', text: '학생활동', color: '#84cc16' },
  { name: 'green-leadership', text: '그린리더십', color: '#14b8a6' },
  { name: 'green-report', text: '그린레포트', color: '#22c55e' },
  { name: 'infographic', text: '인포그래픽', color: '#a855f7' },
  { name: 'archive', text: '자료실', color: '#6366f1' },
  { name: 'sustainability-report', text: '지속가능성', color: '#0ea5e9' }
];

async function createIconImages() {
  const outputDir = path.join(__dirname, '../public/img/icons');
  
  // icons 디렉토리 생성
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // 디렉토리가 이미 존재하는 경우 무시
  }
  
  for (const icon of icons) {
    const size = 100;
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" rx="20" fill="${icon.color}"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="14" font-weight="bold">
          ${icon.text}
        </text>
      </svg>
    `;
    
    const outputPath = path.join(outputDir, `${icon.name}.png`);
    
    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);
      
      console.log(`✅ ${icon.name}.png 생성 완료`);
    } catch (error) {
      console.error(`❌ ${icon.name}.png 생성 실패:`, error);
    }
  }
  
  console.log('🎉 모든 아이콘 이미지 생성 완료!');
}

createIconImages();