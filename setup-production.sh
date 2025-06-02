#!/bin/bash
# 프로덕션 설정 스크립트

echo "=== Mini-CMS 프로덕션 설정 ==="

# 1. 클라이언트 빌드
echo "1. 클라이언트 빌드 중..."
cd client
npm install
npm run build
cd ..

# 2. 서버 설정
echo "2. 서버 설정 중..."
cd server
npm install

# 3. 데이터 디렉토리 생성
mkdir -p uploads
touch database.db

# 4. 데이터베이스 초기화
echo "3. 데이터베이스 초기화..."
node init-db.js
node create-admin.js
node setup-menus-boards.js

# 5. PM2 설정
echo "4. PM2 설정..."
pm2 start server.js --name mini-cms --env production
pm2 save
pm2 startup systemd -u $USER --hp /home/$USER

# 6. 환경변수 설정
echo "5. 환경변수 설정..."
cat > .env << EOF
NODE_ENV=production
PORT=3001
SESSION_SECRET=$(openssl rand -base64 32)
EOF

echo "=== 설정 완료 ==="
echo "PM2 상태 확인: pm2 status"
echo "로그 확인: pm2 logs mini-cms"