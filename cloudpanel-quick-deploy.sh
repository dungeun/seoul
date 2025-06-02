#!/bin/bash
# CloudPanel 빠른 배포 스크립트

echo "=== Mini-CMS CloudPanel 배포 ==="

# 1. 현재 디렉토리 확인
SITE_DIR=$(pwd)
echo "배포 디렉토리: $SITE_DIR"

# 2. Git 클론 (현재 디렉토리가 비어있을 때만)
if [ ! -f "package.json" ]; then
    echo "Git 저장소 URL을 입력하세요:"
    read REPO_URL
    git clone $REPO_URL .
fi

# 3. 클라이언트 빌드
echo "클라이언트 빌드 중..."
cd client
npm install
npm run build
cd ..

# 4. 서버 설정
echo "서버 설정 중..."
cd server
npm install

# 5. 데이터 초기화
echo "데이터베이스 초기화..."
node init-db.js
sleep 2
node create-admin.js
sleep 2
node setup-menus-boards.js

# 6. PM2 설정
echo "PM2로 서버 시작..."
pm2 delete mini-cms 2>/dev/null
pm2 start server.js --name mini-cms --env production
pm2 save
pm2 startup

# 7. 완료
echo ""
echo "=== 배포 완료! ==="
echo "사이트 URL: http://$(hostname -I | awk '{print $1}')"
echo "관리자 로그인: admin / admin123"
echo ""
echo "PM2 상태: pm2 status"
echo "로그 확인: pm2 logs mini-cms"