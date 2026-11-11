import { HTMLAttributes, ReactNode } from 'react';

/**
 * @startingPoint section="Commerce" subtitle="Thẻ sản phẩm chuẩn thương mại điện tử Gia Dụng Thông Minh" viewport="280x420"
 */
export interface ProductCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  rating?: number;
  reviewsCount?: number;
  imageSrc?: string;
  imageElement?: ReactNode;
  isFavorite?: boolean;
  isVerified?: boolean;
  hasVat?: boolean;
  onAddToCart?: () => void;
  onToggleFavorite?: () => void;
  className?: string;
}

export declare function ProductCard(props: ProductCardProps): JSX.Element;
