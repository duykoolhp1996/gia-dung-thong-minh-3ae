import { HTMLAttributes } from 'react';

/**
 * @startingPoint section="Navigation" subtitle="Header thương mại điện tử chuẩn nhận diện Gia Dụng Thông Minh" viewport="1280x110"
 */
export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  topbarText?: string;
  searchPlaceholder?: string;
  cartCount?: number;
  onSearch?: (query: string) => void;
  className?: string;
}

export declare function Header(props: HeaderProps): JSX.Element;
