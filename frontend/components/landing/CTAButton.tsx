'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface CTAButtonProps {
  variant?: Variant;
  size?: Size;
  label: string;
  href: string;
  icon?: 'plus' | 'arrow';
  className?: string;
}

const sizeConfig: Record<Size, { height: string; px: string; text: string; iconSize: number }> = {
  sm: { height: 'h-10', px: 'px-5', text: 'text-sm', iconSize: 16 },
  md: { height: 'h-12', px: 'px-6', text: 'text-base', iconSize: 18 },
  lg: { height: 'h-14', px: 'px-8', text: 'text-lg', iconSize: 20 },
};

export default function CTAButton({
  variant = 'primary',
  size = 'md',
  label,
  href,
  icon = 'plus',
  className,
}: CTAButtonProps) {
  const s = sizeConfig[size];

  if (variant === 'primary') {
    return (
      <Link
        href={href}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(100deg,#ff5b84,#992cff_48%,#00d8e9)] font-bold transition-all duration-300 active:scale-[0.97]',
          s.height,
          s.px,
          s.text,
          className
        )}
        style={{
          boxShadow:
            '0 0 28px rgba(165,49,255,.3), inset 0 0 0 1px rgba(255,255,255,.48)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Inner highlight */}
        <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent opacity-60" />
        {/* Shine overlay */}
        <span className="shine-overlay" />
        <span className="relative z-10 text-white drop-shadow-sm">{label}</span>
        <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-90">
          {icon === 'plus' ? (
            <Plus size={s.iconSize - 4} className="text-white" strokeWidth={3} />
          ) : (
            <ArrowRight size={s.iconSize - 4} className="text-white" strokeWidth={2.5} />
          )}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 font-semibold text-white/90 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white active:scale-[0.97]',
        s.height,
        s.px,
        s.text,
        className
      )}
      style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
    >
      <span className="relative z-10">{label}</span>
      <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
        <ArrowRight size={s.iconSize} className="text-current" strokeWidth={2} />
      </span>
    </Link>
  );
}
