const fs = require('fs');

// 파일 읽기
let content = fs.readFileSync('mini-cms/client/src/pages/public/GreenhouseGas.jsx', 'utf8');

// 기존 초과 배출량 박스 패턴 찾기
const oldPattern = `                <div style={{
                  backgroundColor: '#6ECD8E',
                  color: 'white',
                  padding: '2rem',
                  borderRadius: '12px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.9 }}>초과 배출량</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#FFD700' }}>
                    <CountUp key={\`excess-\${selectedYear}\`} end={Math.max(0, currentYearData.total - 65069)} suffix="t" />
                  </div>
                </div>`;

// 새로운 초과 배출량 박스
const newPattern = `                <div style={{
                  textAlign: 'center'
                }}>
                  <div style={{ 
                    fontSize: '1.2rem', 
                    color: 'white', 
                    backgroundColor: '#6ECD8D',
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '1rem'
                  }}>초과 배출량</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#6ECD8D' }}>
                    <CountUp key={\`excess-\${selectedYear}\`} end={Math.max(0, currentYearData.total - 65069)} suffix="t" />
                  </div>
                </div>`;

// 교체 실행
content = content.replace(oldPattern, newPattern);

// 파일 쓰기
fs.writeFileSync('mini-cms/client/src/pages/public/GreenhouseGas.jsx', content, 'utf8');

console.log('초과 배출량 박스가 성공적으로 수정되었습니다.'); 