# CloudPanel 배포 가이드

## 1. CloudPanel 접속
- URL: https://158.247.196.94:8443
- 초기 로그인 정보는 서버 설치 시 제공됨

## 2. Node.js 사이트 생성

### CloudPanel에서:
1. **Sites** → **Add Site** → **Create a Node.js Site**
2. 설정:
   - Domain Name: `your-domain.com` (또는 `158.247.196.94`)
   - Site User: `minicms` (자동 생성)
   - Node.js Version: 18.x 이상
   - App Port: `3001`

## 3. 프로젝트 배포

### SSH로 접속:
```bash
# CloudPanel이 생성한 사용자로 접속
ssh minicms@158.247.196.94

# 프로젝트 클론
cd ~/htdocs/your-domain.com
git clone [your-repo-url] .

# 클라이언트 빌드
cd client
npm install
npm run build
cd ..

# 서버 설정
cd server
npm install

# 데이터베이스 초기화
node init-db.js
node create-admin.js
node setup-menus-boards.js

# PM2로 앱 시작
pm2 start server.js --name mini-cms
pm2 save
```

## 4. CloudPanel에서 PM2 설정

1. **Sites** → 해당 사이트 선택
2. **Node.js Settings** 탭
3. **App Start Command**: `cd server && pm2 start server.js --name mini-cms`
4. **Save**

## 5. SSL 인증서 (도메인이 있는 경우)

CloudPanel에서:
1. **Sites** → 해당 사이트 → **SSL/TLS** 탭
2. **Actions** → **New Let's Encrypt Certificate**
3. 이메일 입력 후 **Create and Install**

## 6. 환경 변수 설정

CloudPanel에서:
1. **Sites** → 해당 사이트 → **Node.js Settings**
2. **Environment Variables** 섹션:
   ```
   NODE_ENV=production
   PORT=3001
   ```

## 7. 파일 권한 설정
```bash
# uploads 디렉토리 권한
chmod 755 ~/htdocs/your-domain.com/server/uploads

# database.db 권한
chmod 644 ~/htdocs/your-domain.com/server/database.db
```

## 모니터링

### CloudPanel 대시보드에서:
- CPU, Memory, Disk 사용량 확인
- 로그 파일 실시간 확인
- PM2 프로세스 상태 확인

### SSH에서:
```bash
pm2 status
pm2 logs mini-cms
pm2 monit
```

## 백업 설정

CloudPanel에서:
1. **Sites** → 해당 사이트 → **Backup** 탭
2. 백업 스케줄 설정
3. 원격 백업 위치 설정 (선택사항)