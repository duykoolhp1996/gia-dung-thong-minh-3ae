import { HTMLAttributes, ReactNode } from 'react';

/**
 * @startingPoint section="Status" subtitle="Huy hiệu trạng thái và cam kết thương hiệu" viewport="240x40"
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'info' | 'brand' | 'dark';
  children?: ReactNode;
  className?: string;
}

export declare function Badge(props: BadgeProps): JSX.Element;
