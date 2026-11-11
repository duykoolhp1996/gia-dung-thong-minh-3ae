export interface HeaderProps {
  logoText?: string;
  announcementText?: string;
  onSearch?: (query: string) => void;
}
export declare function Header(props: HeaderProps): any;

export interface ButtonProps {
  variant?: 'primary' | 'dark' | 'outline' | 'soft';
  children?: any;
  onClick?: () => void;
}
export declare function Button(props: ButtonProps): any;

export interface BadgeProps {
  tone?: 'success' | 'danger' | 'info' | 'brand' | 'dark';
  children?: any;
}
export declare function Badge(props: BadgeProps): any;

export interface ProductCardProps {
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  imageUrl?: string;
  rating?: number;
}
export declare function ProductCard(props: ProductCardProps): any;

declare global {
  interface Window {
    GiaDungThongMinh: {
      Header: typeof Header;
      Button: typeof Button;
      Badge: typeof Badge;
      ProductCard: typeof ProductCard;
    }
  }
}
