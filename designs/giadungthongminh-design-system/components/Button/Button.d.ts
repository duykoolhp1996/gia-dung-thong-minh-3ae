import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * @startingPoint section="Actions" subtitle="Nút bấm chuẩn thương hiệu Gia Dụng Thông Minh" viewport="320x60"
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'outline' | 'soft' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export declare function Button(props: ButtonProps): JSX.Element;
