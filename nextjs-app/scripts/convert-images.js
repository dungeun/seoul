const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function convertImages() {
  const imgDir = path.join(__dirname, '../public/img');
  
  // 백업 디렉토리 생성
  const backupDir = path.join(imgDir, 'backup');
  try {
    await fs.mkdir(backupDir, { recursive: true });
  } catch (err) {
    console.log('Backup directory already exists');
  }

  // a1~a9 이미지 처리
  for (let i = 1; i <= 9; i++) {
    const filename = `a${i}.jpg`;
    const inputPath = path.join(imgDir, filename);
    const outputPath = path.join(imgDir, `a${i}.webp`);
    const backupPath = path.join(backupDir, filename);

    try {
      // 원본 파일 백업
      await fs.copyFile(inputPath, backupPath);
      console.log(`✅ Backed up ${filename}`);

      // 이미지 메타데이터 읽기
      const metadata = await sharp(inputPath).metadata();
      console.log(`📊 Original ${filename}: ${metadata.width}x${metadata.height}`);

      // 높이 1000px로 고정하고 비율 유지하여 WebP로 변환
      await sharp(inputPath)
        .resize(null, 1000)  // width는 null로 설정하여 비율 자동 유지
        .webp({ quality: 85 })
        .toFile(outputPath);

      // 변환된 이미지 정보
      const newMetadata = await sharp(outputPath).metadata();
      console.log(`✨ Converted to ${path.basename(outputPath)}: ${newMetadata.width}x${newMetadata.height}`);

    } catch (err) {
      console.error(`❌ Error processing ${filename}:`, err.message);
    }
  }

  console.log('\n🎉 All images processed!');
}

convertImages().catch(console.error);