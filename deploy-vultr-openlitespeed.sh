#!/bin/bash
# Vultr OpenLiteSpeed + Node.js 환경 배포 스크립트

echo "=== Vultr OpenLiteSpeed 서버 설정 ==="

# 1. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 2. PM2 설치 (Node.js는 이미 설치됨)
sudo npm install -g pm2

# 3. Git 설치
sudo apt install -y git

# 4. 프로젝트 디렉토리 생성
mkdir -p /usr/local/lsws/Example/html/apps
cd /usr/local/lsws/Example/html/apps

# 5. 프로젝트 클론
echo "GitHub 저장소 URL을 입력하세요:"
read REPO_URL
git clone $REPO_URL mini-cms
cd mini-cms

# 6. 권한 설정
chmod +x setup-production.sh

echo "=== 기본 설정 완료 ==="
echo ""
echo "다음 단계:"
echo "1. OpenLiteSpeed 관리자 패널: https://158.247.196.94:7080"
echo "   (기본 로그인: admin/123456)"
echo "2. ./setup-production.sh 실행하여 앱 설정"
echo "3. OpenLiteSpeed에서 프록시 설정 필요"