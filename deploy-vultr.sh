#!/bin/bash
# Vultr 배포 스크립트

echo "=== Vultr 서버 초기 설정 ==="

# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. PM2 설치
sudo npm install -g pm2

# 4. Nginx 설치
sudo apt install -y nginx

# 5. Git 설치
sudo apt install -y git

# 6. 방화벽 설정
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# 7. 프로젝트 디렉토리 생성
mkdir -p ~/apps
cd ~/apps

echo "=== 기본 설치 완료 ==="
echo "이제 다음 명령어를 실행하세요:"
echo "1. git clone [your-repo-url] mini-cms"
echo "2. cd mini-cms"
echo "3. ./setup-production.sh"