export default function SubPage({ title = '서브 페이지', subtitle = 'Sub Page', children }) {
  const subHTML = `
    <div class="header">
      <div class="logo-section">
        <img src="/img/main_logo.png" alt="서울대학교 로고" class="logo">
      </div>
      <nav class="navigation">
        <div class="nav-menu">
          <a href="/" class="nav-item">홈</a>
        </div>
        <div class="nav-menu">
          <a href="/greenhouse-gas" class="nav-item">온실가스</a>
        </div>
        <div class="nav-menu">
          <a href="/energy" class="nav-item">에너지</a>
        </div>
        <div class="nav-menu">
          <a href="#" class="nav-item">그린캠퍼스</a>
        </div>
        <div class="nav-menu">
          <a href="#" class="nav-item">그린레포트</a>
        </div>
        <div class="nav-menu">
          <a href="#" class="nav-item">탄소중립연구자 네트워크</a>
        </div>
        <div class="nav-menu">
          <a href="/admin/login" class="nav-item">관리자</a>
        </div>
      </nav>
    </div>

    <div class="sub-title-section">
      <div class="gradient-circles">
        <div class="gradient-circle-1"></div>
        <div class="gradient-circle-2"></div>
        <div class="gradient-circle-3"></div>
      </div>
      <div class="sub-title-content">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
    </div>
  `;

  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <div dangerouslySetInnerHTML={{ __html: subHTML }} />
      <div className="main-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </div>
    </>
  );
}