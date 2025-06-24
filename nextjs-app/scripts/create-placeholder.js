const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function createPlaceholder() {
  const width = 100;
  const height = 100;
  
  // SVG로 placeholder 이미지 생성
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial" font-size="14">
        No Image
      </text>
    </svg>
  `;
  
  const outputPath = path.join(__dirname, '../public/img/placeholder.png');
  
  try {
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);
    
    console.log('✅ Placeholder 이미지 생성 완료:', outputPath);
  } catch (error) {
    console.error('❌ Placeholder 이미지 생성 실패:', error);
  }
}

createPlaceholder();