import React from 'react';

export function Header({
  topbarText = 'Sản phẩm chính hãng - Xuất VAT đầy đủ',
  searchPlaceholder = 'Bạn tìm gì hôm nay?',
  cartCount = 0,
  onSearch,
  className = '',
  ...props
}) {
  return (
    <header className={`gdtm-header-container ${className}`.trim()} {...props}>
      {/* Top Banner Vàng */}
      <div class="gdtm-topbar">
        <div class="gdtm-topbar-content">
          <span class="gdtm-topbar-chip">
            <span class="gdtm-chip-dot">●</span> {topbarText}
          </span>
        </div>
      </div>

      {/* Main Navbar Đen */}
      <div className="gdtm-navbar">
        <div className="gdtm-navbar-inner">
          <a href="/" className="gdtm-logo-link">
            <svg className="gdtm-logo-mark" viewBox="0 0 48 48" fill="none">
              <path d="M6 18L24 6L42 18" stroke="#FCD10C" stroke-width="3.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M34 11.5V9H38V14.5" stroke="#FCD10C" strokeWidth="2.5" strokeLinecap="round"/>
              <rect x="9" y="18" width="30" height="24" rx="3" stroke="#FCD10C" strokeWidth="3" fill="#000000"/>
              <text x="13" y="29" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FCD10C" letterSpacing="1">GĐ</text>
              <text x="13" y="38" fontFamily="'Plus Jakarta Sans', system-ui, sans-serif" fontSize="9" fontWeight="900" fill="#FCD10C" letterSpacing="1">TM</text>
            </svg>
            <span className="gdtm-logo-text">giadungthongminh</span>
          </a>

          <button className="gdtm-menu-btn" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            <span>Danh mục</span>
          </button>

          <div className="gdtm-search-wrapper">
            <input 
              type="text" 
              className="gdtm-search-input" 
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <button className="gdtm-search-btn" type="button" aria-label="Tìm kiếm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
          </div>

          <nav className="gdtm-nav-actions">
            <a href="/wishlist" className="gdtm-action-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span>Yêu thích</span>
            </a>
            <a href="/account" className="gdtm-action-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Đăng nhập</span>
            </a>
            <a href="/cart" className="gdtm-action-item gdtm-action-cart">
              <div className="gdtm-cart-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                {cartCount > 0 && <span className="gdtm-cart-badge">{cartCount}</span>}
              </div>
              <span>Giỏ hàng</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
