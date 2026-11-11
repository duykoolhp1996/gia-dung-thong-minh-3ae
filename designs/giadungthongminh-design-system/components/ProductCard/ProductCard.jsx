import React from 'react';

export function ProductCard({
  title,
  price,
  oldPrice,
  discount,
  rating = 5,
  reviewsCount = 0,
  imageSrc,
  imageElement,
  isFavorite = false,
  isVerified = true,
  hasVat = true,
  onAddToCart,
  onToggleFavorite,
  className = '',
  ...props
}) {
  return (
    <div className={`gdtm-card ${className}`.trim()} {...props}>
      <div className="gdtm-card-image-wrap">
        <div className="gdtm-card-badge-top">
          {discount && <span className="gdtm-badge gdtm-badge-danger">{discount}</span>}
          {isVerified && <span className="gdtm-badge gdtm-badge-success">Chính hãng</span>}
        </div>
        <button 
          className={`gdtm-card-fav-btn ${isFavorite ? 'active' : ''}`}
          type="button" 
          aria-label="Yêu thích"
          onClick={onToggleFavorite}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? '#EF4444' : 'none'} stroke={isFavorite ? '#EF4444' : 'currentColor'} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div className="gdtm-card-mock-img">
          {imageElement ? imageElement : (
            <img src={imageSrc || '/assets/placeholder.png'} alt={title} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
          )}
        </div>
      </div>

      <div className="gdtm-card-body">
        {hasVat && (
          <div className="gdtm-card-tagline">
            <span className="gdtm-badge gdtm-badge-info">Xuất VAT đầy đủ</span>
          </div>
        )}
        <h3 className="gdtm-card-title">{title}</h3>
        <div className="gdtm-card-rating">
          <span className="gdtm-stars">★★★★★</span>
          {reviewsCount > 0 && <span className="gdtm-rating-count">({reviewsCount})</span>}
        </div>
        <div className="gdtm-card-price-row">
          <span className="gdtm-price-current">{price}</span>
          {oldPrice && <span className="gdtm-price-old">{oldPrice}</span>}
        </div>
        <button 
          className="gdtm-btn gdtm-btn-primary gdtm-btn-block"
          type="button"
          onClick={onAddToCart}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
